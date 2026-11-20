import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { getProductById, updateProduct } from "@/server/repositories/productRepository";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import connectToDatabase from "@/server/db/mongoose";
import Order from "@/server/db/models/Order";
import { emailService } from "@/lib/email/nodemailer";

export async function POST(req: Request) {
  try {
    const settings = await getCachedSiteSettings();
    const paymentSettings = (settings as any).paymentSettings || {};
    const deliverySettings = (settings as any).deliverySettings?.options || settings.shippingMethods || [];

    const body = await req.json();
    const {
      items,
      customerEmail: bodyEmail,
      customerName: bodyName,
      customerPhone: bodyPhone,
      shippingAddress,
      deliveryOption: clientDeliveryOption,
      paymentMethod,
      paymentDetails,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!["cod", "manual"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method selected." }, { status: 400 });
    }

    // Verify payment method is enabled in settings
    if (paymentMethod === "cod" && paymentSettings.codEnabled === false) {
      return NextResponse.json({ error: "Cash on Delivery is currently disabled." }, { status: 400 });
    }

    if (paymentMethod === "manual" && paymentSettings.manualEnabled === false) {
      return NextResponse.json({ error: "Manual payment is currently disabled." }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.country) {
      return NextResponse.json({ error: "Complete shipping address is required." }, { status: 400 });
    }

    const session = await auth();
    let customerId = undefined;
    let customerEmail = bodyEmail || undefined;
    let customerName = bodyName || undefined;

    if (session?.user && session.user.id !== "admin-1") {
      customerId = session.user.id;
      customerEmail = session.user.email || customerEmail;
      customerName = session.user.name || customerName;
    }

    if (!customerEmail) {
      return NextResponse.json({ error: "Customer email is required." }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Verify products & calculate subtotal
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await getProductById(item.productId);
      if (!product || product.status !== "active") {
        return NextResponse.json({ error: `Product "${item.name}" is unavailable.` }, { status: 400 });
      }

      let itemPrice = product.price;
      let selectedVariantData = undefined;

      if (item.selectedVariant) {
        const variant = product.variants?.find((v: any) => v.name === item.selectedVariant.name);
        if (!variant) {
          return NextResponse.json({ error: `Variant "${item.selectedVariant.name}" for product "${product.name}" was not found.` }, { status: 400 });
        }
        if (variant.inventory < item.quantity) {
          return NextResponse.json({ error: `Insufficient inventory for variant "${variant.name}" of "${product.name}".` }, { status: 400 });
        }
        if (variant.priceOverride !== undefined && variant.priceOverride !== null) {
          itemPrice = variant.priceOverride;
        }
        selectedVariantData = {
          name: variant.name,
          price: itemPrice,
          sku: variant.sku,
        };
      } else {
        if (product.inventory < item.quantity) {
          return NextResponse.json({ error: `Insufficient inventory for "${product.name}".` }, { status: 400 });
        }
      }

      subtotal += itemPrice * item.quantity;
      verifiedItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: itemPrice,
        selectedVariant: selectedVariantData,
      });
    }

    // 2. Validate & calculate delivery fee
    const freeThreshold = Number(settings?.freeShippingThreshold ?? 0);
    let shippingFee = 0;
    let selectedDeliveryObj = undefined;

    if (clientDeliveryOption && clientDeliveryOption.id) {
      const matchedOption = deliverySettings.find((d: any) => d.id === clientDeliveryOption.id && d.isActive !== false);
      if (matchedOption) {
        shippingFee = matchedOption.cost || 0;
        const methodMin = Number(matchedOption.freeShippingMin || 0);
        if ((methodMin > 0 && subtotal >= methodMin) || (freeThreshold > 0 && subtotal >= freeThreshold)) {
          shippingFee = 0;
        }
        selectedDeliveryObj = {
          id: matchedOption.id,
          name: matchedOption.name,
          cost: shippingFee,
          estimatedDays: matchedOption.estimatedDays,
        };
      }
    }

    if (!selectedDeliveryObj && deliverySettings.length > 0) {
      const defaultOption = deliverySettings[0];
      shippingFee = defaultOption.cost || 0;
      const methodMin = Number(defaultOption.freeShippingMin || 0);
      if ((methodMin > 0 && subtotal >= methodMin) || (freeThreshold > 0 && subtotal >= freeThreshold)) {
        shippingFee = 0;
      }
      selectedDeliveryObj = {
        id: defaultOption.id,
        name: defaultOption.name,
        cost: shippingFee,
        estimatedDays: defaultOption.estimatedDays,
      };
    }

    const total = subtotal + shippingFee;

    // COD order value check if configured
    if (paymentMethod === "cod") {
      if (paymentSettings.codMinOrder && subtotal < paymentSettings.codMinOrder) {
        return NextResponse.json({ error: `Cash on Delivery requires a minimum order subtotal of $${paymentSettings.codMinOrder}.` }, { status: 400 });
      }
      if (paymentSettings.codMaxOrder && paymentSettings.codMaxOrder > 0 && subtotal > paymentSettings.codMaxOrder) {
        return NextResponse.json({ error: `Cash on Delivery is only available for orders up to $${paymentSettings.codMaxOrder}.` }, { status: 400 });
      }
    }

    // 3. Create Order
    const paymentStatus = paymentMethod === "cod" ? "pending" : "awaiting_verification";
    const orderStatus = "pending";

    const order = await Order.create({
      customerId: customerId,
      customerEmail: customerEmail,
      customerName: customerName || bodyName || shippingAddress.name || "Customer",
      customerPhone: bodyPhone || shippingAddress.phone || "",
      items: verifiedItems,
      totals: {
        subtotal,
        shippingFee,
        tax: 0,
        total,
      },
      status: orderStatus,
      paymentMethod,
      paymentStatus,
      paymentDetails: paymentDetails || {},
      deliveryOption: selectedDeliveryObj,
      shippingAddress: {
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state || "",
        postalCode: shippingAddress.postalCode || "",
        country: shippingAddress.country,
      },
    });

    // 4. Decrement inventory
    for (const item of verifiedItems) {
      const product = await getProductById(String(item.productId));
      if (product) {
        if (item.selectedVariant) {
          const variantName = item.selectedVariant.name;
          const updatedVariants = product.variants?.map((v: any) => {
            if (v.name === variantName) {
              return {
                ...v,
                inventory: Math.max(0, v.inventory - item.quantity),
              };
            }
            return v;
          });
          await updateProduct(String(product._id), { variants: updatedVariants });
        } else {
          const newInventory = Math.max(0, product.inventory - item.quantity);
          await updateProduct(String(product._id), { inventory: newInventory });
        }
      }
    }

    // 5. Send order confirmation email & Notify Admin
    try {
      if (customerEmail) {
        await emailService.sendOrderConfirmationEmail(
          customerEmail,
          order._id.toString(),
          total
        );
      }
      await emailService.sendAdminNewOrderNotification(
        order._id.toString(),
        total
      );
    } catch (e) {
      console.error("Failed to send order emails:", e);
    }

    return NextResponse.json({
      success: true,
      orderId: order._id.toString(),
    });
  } catch (err: any) {
    console.error("Direct Checkout Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process order." }, { status: 500 });
  }
}

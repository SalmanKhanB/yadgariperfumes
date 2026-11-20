import { after, NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { getProductById } from "@/server/repositories/productRepository";
import connectToDatabase from "@/server/db/mongoose";
import Order, { type IOrderItem } from "@/server/db/models/Order";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import { getShippingMethods } from "@/server/stripe/shipping";
import { emailService } from "@/lib/email/nodemailer";
import { sendMetaCapiEvent } from "@/server/analytics/metaCapi";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      items,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      paymentMethod = "cod",
      paymentDetails,
      deliveryOption,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (paymentMethod !== "cod" && paymentMethod !== "manual") {
      return NextResponse.json({ error: "Select an available payment method." }, { status: 400 });
    }

    if (
      typeof customerEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim()) ||
      typeof customerName !== "string" || !customerName.trim() ||
      typeof shippingAddress?.line1 !== "string" || !shippingAddress.line1.trim() ||
      typeof shippingAddress?.city !== "string" || !shippingAddress.city.trim()
    ) {
      return NextResponse.json({ error: "Please fill in all required shipping fields." }, { status: 400 });
    }

    if (paymentMethod === "manual" && (typeof paymentDetails?.referenceId !== "string" || !paymentDetails.referenceId.trim())) {
      return NextResponse.json({ error: "Please provide your Transaction / Reference ID for manual payment verification." }, { status: 400 });
    }

    const settings = await getCachedSiteSettings();
    const currency = String(settings.currency || "USD").toUpperCase();
    const { codEnabled, manualEnabled } = settings.paymentSettings || {};
    if ((paymentMethod === "cod" && codEnabled === false) || (paymentMethod === "manual" && manualEnabled === false)) {
      return NextResponse.json({ error: "Select an available payment method." }, { status: 400 });
    }

    const session = await auth();
    let customerId = undefined;

    if (session?.user && session.user.id !== "admin-1") {
      customerId = session.user.id;
    }

    // 1. Verify prices & availability against database
    let subtotal = 0;
    const verifiedItems: IOrderItem[] = [];
    const requestedQuantities = new Map<string, number>();

    for (const item of items) {
      if (
        typeof item?.productId !== "string" || !/^[a-f0-9]{24}$/i.test(item.productId) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99
      ) {
        return NextResponse.json({ error: "The cart contains an invalid item or quantity." }, { status: 400 });
      }

      const product = await getProductById(item.productId);
      if (!product || product.status !== "active") {
        return NextResponse.json({ error: `Product ${item.name} is unavailable.` }, { status: 400 });
      }

      const stockKey = JSON.stringify([String(product._id), item.selectedVariant?.name || null]);
      const requestedQuantity = (requestedQuantities.get(stockKey) || 0) + item.quantity;
      requestedQuantities.set(stockKey, requestedQuantity);

      let itemPrice = product.price;
      let selectedVariantData = undefined;

      if (item.selectedVariant) {
        const variant = product.variants?.find((v: any) => v.name === item.selectedVariant.name);
        if (!variant) {
          return NextResponse.json({ error: `Variant ${item.selectedVariant.name} for product ${product.name} is not found.` }, { status: 400 });
        }
        if (variant.inventory < requestedQuantity) {
          return NextResponse.json({ error: `Not enough inventory for variant ${variant.name} of ${product.name}.` }, { status: 400 });
        }
        if (variant.priceOverride !== undefined && variant.priceOverride !== null) {
          itemPrice = variant.priceOverride;
        }
        selectedVariantData = {
          name: variant.name,
          price: itemPrice,
          sku: variant.sku,
        };
      } else if (product.inventory < requestedQuantity) {
        return NextResponse.json({ error: `Not enough inventory for ${product.name}.` }, { status: 400 });
      }

      if (!Number.isFinite(itemPrice) || itemPrice < 0) {
        return NextResponse.json({ error: "A product has an invalid price." }, { status: 400 });
      }
      subtotal += itemPrice * item.quantity;
      verifiedItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: itemPrice,
        selectedVariant: selectedVariantData,
      });
    }

    const shippingMethods = getShippingMethods(settings);
    const requestedShippingId = deliveryOption?.id;
    const shippingMethod = requestedShippingId
      ? shippingMethods.find((method) => method.id === requestedShippingId)
      : shippingMethods[0];
    if (requestedShippingId && !shippingMethod) {
      return NextResponse.json({ error: "Select an available shipping method." }, { status: 400 });
    }

    const freeThreshold = Number(settings.freeShippingThreshold ?? 0);
    const methodMin = shippingMethod?.freeShippingMin || 0;
    const isFree = (methodMin > 0 && subtotal >= methodMin) || (freeThreshold > 0 && subtotal >= freeThreshold);
    const shippingFee = isFree ? 0 : (shippingMethod?.price ?? 0);
    if (!Number.isFinite(shippingFee) || shippingFee < 0) {
      return NextResponse.json({ error: "Select an available shipping method." }, { status: 400 });
    }
    const grandTotal = subtotal + shippingFee;

    const initialPaymentStatus = paymentMethod === "manual" ? "awaiting_verification" : "pending";

    // 2. Connect DB and create Order
    await connectToDatabase();

    const order = await Order.create({
      customerId: customerId,
      customerEmail: customerEmail.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : "",
      items: verifiedItems,
      totals: {
        subtotal: subtotal,
        shippingFee: shippingFee,
        tax: 0,
        total: grandTotal,
      },
      status: "pending",
      currency,
      paymentMethod: paymentMethod,
      paymentStatus: initialPaymentStatus,
      paymentDetails: paymentMethod === "manual" && paymentDetails
        ? {
            referenceId: paymentDetails.referenceId ? paymentDetails.referenceId.trim() : "",
            note: typeof paymentDetails.note === "string" ? paymentDetails.note.trim() : "",
          }
        : undefined,
      deliveryOption: shippingMethod
        ? {
            id: shippingMethod.id,
            name: shippingMethod.name,
            cost: shippingFee,
            estimatedDays: shippingMethod.timeframe,
          }
        : undefined,
      shippingAddress: {
        line1: shippingAddress.line1 || "",
        line2: shippingAddress.line2 || "",
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        postalCode: shippingAddress.postalCode || "",
        country: shippingAddress.country || "AE",
      },
    });

    after(async () => {
      const results = await Promise.allSettled([
        emailService.sendOrderConfirmationEmail(
          order.customerEmail || customerEmail,
          order._id.toString(),
          grandTotal
        ),
        emailService.sendAdminNewOrderNotification(
          order._id.toString(),
          grandTotal
        ),
        sendMetaCapiEvent({
          eventName: "Purchase",
          eventId: order._id.toString(),
          userData: {
            email: order.customerEmail,
            phone: order.customerPhone,
            firstName: customerName.trim().split(" ")[0],
            lastName: customerName.trim().split(" ").slice(1).join(" "),
            city: shippingAddress.city,
            country: shippingAddress.country || "AE",
          },
          customData: {
            currency,
            value: grandTotal,
            orderId: order._id.toString(),
            contentIds: verifiedItems.map((i) => i.productId.toString()),
            contents: verifiedItems.map((i) => ({
              id: i.productId.toString(),
              quantity: i.quantity,
              item_price: i.price,
            })),
          },
        }),
      ]);
      for (const result of results) {
        if (result.status === "rejected") {
          console.error("Order notification failed", String(order._id), result.reason);
        }
      }
    });

    return NextResponse.json({
      success: true,
      orderId: order._id.toString(),
    });
  } catch (err: any) {
    console.error("Direct Checkout Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { getProductById } from "@/server/repositories/productRepository";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import PendingCheckout from "@/server/db/models/PendingCheckout";
import { createWooCommerceOrder } from "@/server/woocommerce/wcClient";

export async function POST(req: Request) {
  try {
    const settings = await getCachedSiteSettings();
    const wcConfig = settings?.woocommerceConfig;

    const storeUrl = wcConfig?.storeUrl || process.env.WOOCOMMERCE_URL || "";
    const consumerKey = wcConfig?.consumerKey || process.env.WOOCOMMERCE_CONSUMER_KEY || "";
    const consumerSecret = wcConfig?.consumerSecret || process.env.WOOCOMMERCE_CONSUMER_SECRET || "";

    if (!storeUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        {
          error:
            "WooCommerce Payments is not configured. Please add valid WooCommerce URL, Consumer Key, and Consumer Secret in Admin Settings or .env.local file.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { items, customerEmail: bodyEmail, customerName: bodyName, shippingAddress } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
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

    // 1. Server-side price validation against database
    let subtotal = 0;
    const verifiedItems = [];
    const wcLineItems = [];

    for (const item of items) {
      const product = await getProductById(item.productId);
      if (!product || product.status !== "active") {
        return NextResponse.json({ error: `Product ${item.name || "Item"} is unavailable.` }, { status: 400 });
      }

      const verifiedPrice = product.price;
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      subtotal += verifiedPrice * quantity;

      verifiedItems.push({
        productId: product._id.toString(),
        name: product.name,
        price: verifiedPrice,
        quantity,
      });

      wcLineItems.push({
        name: product.name,
        quantity,
        price: String(verifiedPrice),
        total: String(verifiedPrice * quantity),
      });
    }

    // 2. Create PendingCheckout record in database
    const pendingCheckout = await PendingCheckout.create({
      customerId,
      customerEmail,
      customerName,
      items: verifiedItems,
      subtotal,
      paymentProvider: "woocommerce",
    });

    const firstName = customerName ? customerName.split(" ")[0] : "Valued";
    const lastName = customerName && customerName.includes(" ") ? customerName.split(" ").slice(1).join(" ") : "Customer";

    const billingInfo = {
      first_name: firstName,
      last_name: lastName,
      address_1: shippingAddress?.street || "Standard Address",
      city: shippingAddress?.city || "City",
      state: shippingAddress?.state || "",
      postcode: shippingAddress?.zip || "",
      country: shippingAddress?.country || "US",
      email: customerEmail || "customer@example.com",
      phone: shippingAddress?.phone || "",
    };

    // 3. Dispatch WooCommerce Order creation via REST API
    const wcOrder = await createWooCommerceOrder(storeUrl, consumerKey, consumerSecret, {
      payment_method: "woocommerce_payments",
      payment_method_title: "WooCommerce Payments",
      set_paid: false,
      billing: billingInfo,
      shipping: {
        first_name: billingInfo.first_name,
        last_name: billingInfo.last_name,
        address_1: billingInfo.address_1,
        city: billingInfo.city,
        state: billingInfo.state,
        postcode: billingInfo.postcode,
        country: billingInfo.country,
      },
      line_items: wcLineItems,
      meta_data: [
        { key: "pendingCheckoutId", value: pendingCheckout._id.toString() },
        { key: "storefrontOrigin", value: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" },
      ],
    });

    // 4. Update pending checkout with WooCommerce Order ID
    const wcOrderId = String(wcOrder.id || wcOrder.number || "");
    await PendingCheckout.findByIdAndUpdate(pendingCheckout._id, {
      woocommerceOrderId: wcOrderId,
    });

    const checkoutUrl = wcOrder.payment_url || `${storeUrl.replace(/\/+$/, "")}/checkout/order-pay/${wcOrderId}/?key=${wcOrder.order_key || ""}`;

    return NextResponse.json({
      success: true,
      pendingCheckoutId: pendingCheckout._id.toString(),
      woocommerceOrderId: wcOrderId,
      checkoutUrl,
    });
  } catch (err: any) {
    console.error("WooCommerce Checkout API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process WooCommerce checkout" }, { status: 500 });
  }
}

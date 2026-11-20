import { NextResponse } from "next/server";
import { getStripeCurrencyMultiplier } from "@/server/stripe/currency";
import { stripe } from "@/server/stripe/client";
import { auth } from "@/server/auth/config";
import { getProductById } from "@/server/repositories/productRepository";
import { getShippingMethods } from "@/server/stripe/shipping";

import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";

function isStripeConfigured(): boolean {
  const key = (process.env.STRIPE_SECRET_KEY || "").trim();
  return (
    key.startsWith("sk_test_") ||
    key.startsWith("sk_live_") ||
    key.startsWith("rk_test_") ||
    key.startsWith("rk_live_")
  );
}

export async function POST(req: Request) {
  try {
    // Guard: return a friendly error when no valid Stripe key is set
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Please add a valid STRIPE_SECRET_KEY (starting with sk_test_ or sk_live_) to your .env.local file.",
        },
        { status: 503 }
      );
    }

    const settings = await getCachedSiteSettings();
    if (settings.paymentSettings?.stripeEnabled === false) {
      return NextResponse.json({ error: "Card payments are disabled." }, { status: 403 });
    }
    const currencyCode = (settings.currency || "AED").toLowerCase();
    const currencyMultiplier = getStripeCurrencyMultiplier(currencyCode);

    const body = await req.json();
    const { items, customerEmail: bodyEmail, customerName: bodyName, shippingMethodId } = body;

    if (!Array.isArray(items) || items.length === 0 || items.some((item) =>
      !item || typeof item.productId !== "string" || !Number.isSafeInteger(item.quantity) || item.quantity < 1
    )) {
      return NextResponse.json({ error: "Cart is empty or contains invalid items." }, { status: 400 });
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

    // 1. Verify prices against the database
    const requestedQuantities = new Map<string, number>();
    let subtotalMinor = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await getProductById(item.productId);
      if (!product || product.status !== "active") {
        return NextResponse.json({ error: `Product ${item.name} is unavailable.` }, { status: 400 });
      }

      const stockKey = JSON.stringify([String(product._id), item.selectedVariant?.name || null]);
      const quantity = (requestedQuantities.get(stockKey) || 0) + item.quantity;
      requestedQuantities.set(stockKey, quantity);

      let itemPrice = product.price;
      let selectedVariantData = undefined;

      if (item.selectedVariant) {
        const variant = product.variants?.find((v: any) => v.name === item.selectedVariant.name);
        if (!variant) {
          return NextResponse.json({ error: `Variant ${item.selectedVariant.name} for product ${product.name} is not found.` }, { status: 400 });
        }
        if (variant.inventory < quantity) {
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
      } else {
        if (product.inventory < quantity) {
          return NextResponse.json({ error: `Not enough inventory for ${product.name}.` }, { status: 400 });
        }
      }

      if (!Number.isFinite(itemPrice) || itemPrice < 0) {
        return NextResponse.json({ error: "A product has an invalid price." }, { status: 400 });
      }
      subtotalMinor += Math.round(itemPrice * currencyMultiplier) * item.quantity;
      verifiedItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: itemPrice,
        selectedVariant: selectedVariantData,
      });

    }

    const subtotal = subtotalMinor / currencyMultiplier;
    const shippingMethods = getShippingMethods(settings);
    const shippingMethod = shippingMethodId
      ? shippingMethods.find((method) => method.id === shippingMethodId)
      : shippingMethods[0];
    if (shippingMethodId && !shippingMethod) {
      return NextResponse.json({ error: "Select an available shipping method." }, { status: 400 });
    }
    const freeThreshold = Number(settings.freeShippingThreshold ?? 0);
    const methodThreshold = shippingMethod?.freeShippingMin || 0;
    const freeShipping = (freeThreshold > 0 && subtotal >= freeThreshold) ||
      (methodThreshold > 0 && subtotal >= methodThreshold);
    const shippingMinor = freeShipping ? 0 : Math.round((shippingMethod?.price || 0) * currencyMultiplier);
    const amount = subtotalMinor + shippingMinor;
    if (!Number.isSafeInteger(amount) || amount <= 0 || shippingMinor < 0) {
      return NextResponse.json({ error: "This cart cannot be paid by card." }, { status: 400 });
    }

    // 2. Create a "PendingCheckout" in the database instead of an Order
    const { default: PendingCheckout } = await import("@/server/db/models/PendingCheckout");
    const { default: connectToDatabase } = await import("@/server/db/mongoose");
    const mongoose = await connectToDatabase();
    const topology = await mongoose.connection.db.admin().command({ hello: 1 });
    if (!topology.setName && topology.msg !== "isdbgrid") {
      console.error("Stripe checkout requires MongoDB transaction support.");
      return NextResponse.json({ error: "Card checkout is temporarily unavailable." }, { status: 503 });
    }

    const pendingCheckout = await PendingCheckout.create({
      customerId: customerId,
      customerEmail,
      customerName,
      items: verifiedItems,
      subtotal,
      amount,
      currency: currencyCode,
      deliveryOption: shippingMethod ? {
        id: shippingMethod.id,
        name: shippingMethod.name,
        cost: shippingMinor / currencyMultiplier,
        estimatedDays: shippingMethod.timeframe,
      } : undefined,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currencyCode,
      automatic_payment_methods: { enabled: true },
      metadata: { pendingCheckoutId: pendingCheckout._id.toString() },
    }, { idempotencyKey: `checkout-${pendingCheckout._id}` });

    // Update pending checkout with payment intent ID
    await PendingCheckout.findByIdAndUpdate(pendingCheckout._id, {
      stripePaymentIntentId: paymentIntent.id
    });

    // 4. Return the client secret to the client
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      orderId: pendingCheckout._id.toString(),
      total: amount / currencyMultiplier,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    });
  } catch (err: any) {
    console.error("Checkout Error:", { type: err.type, message: err.message });
    if (err.type === "StripeAuthenticationError" || err.type === "StripePermissionError") {
      return NextResponse.json({
        error: "Card payments are temporarily unavailable. Please choose another payment method or contact the store.",
        code: "PAYMENT_CONFIGURATION_ERROR",
      }, { status: 503 });
    }
    return NextResponse.json({ error: "Card checkout could not be started. Please try again." }, { status: 500 });
  }
}

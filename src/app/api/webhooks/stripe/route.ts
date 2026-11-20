import { NextResponse } from "next/server";
import { stripe } from "@/server/stripe/client";
import { getStripeCurrencyMultiplier } from "@/server/stripe/currency";
import { emailService } from "@/lib/email/nodemailer";
import { sendMetaCapiEvent } from "@/server/analytics/metaCapi";
import connectToDatabase from "@/server/db/mongoose";
import type { ClientSession } from "mongoose";
import Order, { type IOrder } from "@/server/db/models/Order";
import PendingCheckout from "@/server/db/models/PendingCheckout";
import Product from "@/server/db/models/Product";
import { invalidateCache } from "@/server/cache/nodeCache";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type !== "payment_intent.succeeded") return NextResponse.json({ received: true });
  const payment = event.data.object;
  const pendingCheckoutId = payment.metadata.pendingCheckoutId;
  if (!pendingCheckoutId) return NextResponse.json({ received: true });

  try {
    const mongoose = await connectToDatabase();
    const pending = await PendingCheckout.findById(pendingCheckoutId);
    if (!pending || pending.paymentProvider !== "stripe" || pending.stripePaymentIntentId !== payment.id ||
      (pending.amount !== undefined && pending.amount !== payment.amount_received) ||
      (pending.currency && pending.currency !== payment.currency) ||
      payment.status !== "succeeded" || payment.amount_received !== payment.amount
    ) {
      console.error("Stripe payment did not match the pending checkout", payment.id);
      return NextResponse.json({ error: "Payment does not match checkout" }, { status: 409 });
    }

    const shipping = payment.shipping;
    const customerEmail = payment.receipt_email || pending.customerEmail;
    const total = payment.amount_received / getStripeCurrencyMultiplier(payment.currency);
    const order: IOrder | null = await mongoose.connection.transaction(async (session: ClientSession) => {
      if (await Order.exists({ _id: pending._id }).session(session)) return null;

      const [created] = await Order.create([{
        _id: pending._id,
        customerId: pending.customerId,
        customerEmail,
        currency: payment.currency.toUpperCase(),
        customerName: shipping?.name || pending.customerName,
        customerPhone: shipping?.phone || "",
        items: pending.items,
        totals: { subtotal: pending.subtotal, shippingFee: pending.deliveryOption?.cost || 0, tax: 0, total },
        status: "processing",
        paymentMethod: "stripe",
        paymentStatus: "paid",
        stripeSessionId: payment.id,
        deliveryOption: pending.deliveryOption,
        shippingAddress: {
          line1: shipping?.address?.line1 || "",
          line2: shipping?.address?.line2 || "",
          city: shipping?.address?.city || "",
          state: shipping?.address?.state || "",
          postalCode: shipping?.address?.postal_code || "",
          country: shipping?.address?.country || "",
        },
      }], { session });

      for (const item of created.items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) continue;
        if (item.selectedVariant?.name) {
          const variant = product.variants?.find((entry) => entry.name === item.selectedVariant?.name);
          if (!variant) continue;
          variant.inventory = Math.max(0, variant.inventory - item.quantity);
        } else {
          product.inventory = Math.max(0, product.inventory - item.quantity);
        }
        await product.save({ session });
      }

      return created;
    });

    if (order) {
      invalidateCache("products_");
      const orderId = String(order._id);
      const notifications = await Promise.allSettled([
        emailService.sendOrderConfirmationEmail(customerEmail || "", orderId, total),
        emailService.sendAdminNewOrderNotification(orderId, total),
        sendMetaCapiEvent({
          eventName: "Purchase",
          eventId: orderId,
          userData: {
            email: customerEmail,
            phone: order.customerPhone,
            firstName: (order.customerName || "").split(" ")[0],
            lastName: (order.customerName || "").split(" ").slice(1).join(" "),
            city: order.shippingAddress?.city,
            country: order.shippingAddress?.country,
          },
          customData: {
            currency: payment.currency.toUpperCase(),
            value: total,
            orderId,
            contentIds: order.items.map((item) => String(item.productId)),
            contents: order.items.map((item) => ({
              id: String(item.productId),
              quantity: item.quantity,
              item_price: item.price,
            })),
          },
        }),
      ]);
      for (const notification of notifications) {
        if (notification.status === "rejected") {
          console.error("Stripe order notification failed", orderId, notification.reason);
        } else if (notification.value === false) {
          console.error("Stripe order email was not accepted by the mail service", orderId);
        }
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe order creation failed", payment.id, error);
    return NextResponse.json({ error: "Could not finalize order" }, { status: 500 });
  }
}

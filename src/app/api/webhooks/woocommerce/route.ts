import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import { verifyWooCommerceWebhookSignature } from "@/server/woocommerce/wcClient";
import PendingCheckout from "@/server/db/models/PendingCheckout";
import { createOrder } from "@/server/repositories/orderRepository";
import { emailService } from "@/lib/email/nodemailer";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-wc-webhook-signature") || req.headers.get("X-WC-Webhook-Signature");

    const settings = await getCachedSiteSettings();
    const webhookSecret =
      settings?.woocommerceConfig?.webhookSecret || process.env.WOOCOMMERCE_WEBHOOK_SECRET || "";

    // 1. HMAC Signature Verification if secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyWooCommerceWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid WooCommerce Webhook Signature");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const orderStatus = (payload.status || "").toLowerCase();
    const wcOrderId = String(payload.id || payload.number || "");

    // Process completed / paid order events
    if (["processing", "completed", "paid"].includes(orderStatus)) {
      const metaData = payload.meta_data || [];
      const pendingMeta = metaData.find((m: any) => m.key === "pendingCheckoutId");
      const pendingCheckoutId = pendingMeta?.value;

      let pending = null;
      if (pendingCheckoutId) {
        pending = await PendingCheckout.findById(pendingCheckoutId);
      } else if (wcOrderId) {
        pending = await PendingCheckout.findOne({ woocommerceOrderId: wcOrderId });
      }

      if (pending) {
        // Create full Order in database
        const newOrder = await createOrder({
          customerId: pending.customerId && mongoose.Types.ObjectId.isValid(pending.customerId) ? (new mongoose.Types.ObjectId(pending.customerId) as any) : undefined,
          customerEmail: payload.billing?.email || pending.customerEmail || "customer@example.com",
          customerName:
            `${payload.billing?.first_name || ""} ${payload.billing?.last_name || ""}`.trim() ||
            pending.customerName ||
            "Valued Customer",
          items: pending.items,
          totals: {
            subtotal: pending.subtotal,
            tax: 0,
            total: pending.subtotal,
          },
          status: "processing",
          paymentStatus: "paid",
          shippingAddress: {
            line1: payload.shipping?.address_1 || payload.billing?.address_1 || "Standard Address",
            line2: payload.shipping?.address_2 || payload.billing?.address_2 || "",
            city: payload.shipping?.city || payload.billing?.city || "City",
            state: payload.shipping?.state || payload.billing?.state || "",
            postalCode: payload.shipping?.postcode || payload.billing?.postcode || "",
            country: payload.shipping?.country || payload.billing?.country || "US",
          },
        });

        // Clean up pending checkout to prevent duplicates
        await PendingCheckout.findByIdAndDelete(pending._id);

        // Dispatch Order Confirmation Email via Nodemailer
        if (newOrder.customerEmail) {
          try {
            await emailService.sendOrderConfirmationEmail(
              newOrder.customerEmail,
              newOrder._id.toString(),
              newOrder.totals?.total || pending.subtotal
            );
          } catch (emailErr) {
            console.error("WooCommerce Order Email Dispatch Error:", emailErr);
          }
        }

        return NextResponse.json({ success: true, orderId: newOrder._id.toString() });
      }
    }

    return NextResponse.json({ received: true, status: orderStatus });
  } catch (err: any) {
    console.error("WooCommerce Webhook Handler Error:", err);
    return NextResponse.json({ error: err.message || "Webhook error" }, { status: 500 });
  }
}

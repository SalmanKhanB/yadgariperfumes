import nodemailer from "nodemailer";
import User from "@/server/db/models/User";
import Order from "@/server/db/models/Order";
import { getOrderById } from "@/server/repositories/orderRepository";
import { getSiteSettings } from "@/server/repositories/siteSettingsRepository";
import { formatCurrency } from "@/lib/utils/format";

class EmailService {
  private async getTransporter(settingsOverride?: any): Promise<{
    transporter: nodemailer.Transporter | null;
    from: string;
    adminEmail: string;
  }> {
    let settings = settingsOverride;
    if (!settings) {
      try {
        const raw = await getSiteSettings(true);
        settings = raw ? JSON.parse(JSON.stringify(raw)) : {};
      } catch {
        settings = {};
      }
    }

    const emailSettings = settings?.emailSettings || {};

    const host = emailSettings.smtpHost?.trim() || process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST;
    const port = Number(emailSettings.smtpPort || process.env.EMAIL_SERVER_PORT || 587);
    const user = emailSettings.smtpUser?.trim() || process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
    const pass = emailSettings.smtpPassword?.trim() || process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS;
    const secure = emailSettings.smtpSecure !== undefined
      ? Boolean(emailSettings.smtpSecure)
      : (port === 465 || process.env.EMAIL_SERVER_PORT === "465");

    const senderName = emailSettings.fromName?.trim() || settings?.name || "Sqodex Storefront";
    const senderEmail = emailSettings.fromEmail?.trim() || process.env.EMAIL_FROM || user || "orders@sqodex.com";
    const from = senderEmail.includes("<") ? senderEmail : `"${senderName}" <${senderEmail}>`;

    const adminEmail = emailSettings.adminNotificationEmail?.trim() ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "bgpharma@sqodex.com";

    // Check if valid SMTP credentials are configured
    if (!host || !user || !pass || host === "smtp.example.com" || user === "your-smtp-username") {
      console.warn("EmailService: SMTP not fully configured in Settings or .env. Email sending skipped in dev/preview mode.");
      return { transporter: null, from, adminEmail };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return { transporter, from, adminEmail };
  }

  /**
   * 1. Send Order Confirmation Email to Customer
   */
  async sendOrderConfirmationEmail(to: string, orderId: string, total: number) {
    const from = process.env.EMAIL_FROM || "Sqodex Storefront <orders@sqodex.com>";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const [order, settingsRaw] = await Promise.all([
      getOrderById(orderId),
      getSiteSettings(true),
    ]);

    const customer = !to?.trim() && !order?.customerEmail?.trim() && order?.customerId
      ? await User.findById(order.customerId).select("email").lean()
      : null;
    const targetEmail = to?.trim() || order?.customerEmail?.trim() || customer?.email;
    if (!targetEmail) {
      await Order.updateOne({ _id: orderId }, { $set: { confirmationEmailStatus: "failed" } });
      console.warn(`Order confirmation skipped: No recipient email for order ${orderId}`);
      return false;
    }

    const settings = settingsRaw ? JSON.parse(JSON.stringify(settingsRaw)) : {};
    const siteName = settings?.name || process.env.NEXT_PUBLIC_SITE_NAME || "Sqodex Store";
    const currency = order?.currency || settings.currency || "USD";
    const items = order?.items || [];

    const itemsHtml = items
      .map((item: any) => {
        const product = item.productId;
        const name = product?.name || item.name || "Product";
        const price = item.price || 0;
        const qty = item.quantity || 1;
        const image =
          product?.images && product.images.length > 0
            ? typeof product.images[0] === "string"
              ? product.images[0]
              : product.images[0].url
            : "";

        return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937;">
            <div style="display: flex; align-items: center; gap: 12px;">
              ${image ? `<img src="${image}" alt="${name}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; background-color: #f3f4f6;" />` : ""}
              <div>
                <strong style="display: block; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">${name}</strong>
                ${item.selectedVariant ? `<span style="display: block; font-size: 11px; color: #10b981; font-weight: bold; text-transform: uppercase; margin-top: 2px;">${item.selectedVariant.name}</span>` : ""}
                <span style="font-size: 12px; color: #6b7280;">Qty: ${qty}</span>
              </div>
            </div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px; color: #1f2937; font-weight: bold;">
            ${formatCurrency(price * qty, currency)}
          </td>
        </tr>
      `;
      })
      .join("");

    const orderTotal = order?.totals?.total ?? total;
    const orderSubtotal = order?.totals?.subtotal ?? orderTotal;
    const orderShipping = order?.totals?.shippingFee || 0;
    const orderTax = order?.totals?.tax || 0;
    const paymentMessage = order?.paymentStatus === "paid"
      ? "We've received your payment."
      : order?.paymentMethod === "cod"
        ? "Please pay when your order arrives."
        : order?.paymentStatus === "awaiting_verification"
          ? "We'll review your payment details and update your order."
          : "We'll update your order as soon as payment is confirmed.";
    const orderDate = new Date(order?.createdAt ?? Date.now());

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px 0; -webkit-font-smoothing: antialiased;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #141210; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase;">${siteName}</h1>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="font-size: 20px; font-weight: 800; color: #111827; margin-top: 0; margin-bottom: 8px; text-transform: uppercase;">Thank you for your order!</h2>
              <p style="font-size: 15px; color: #4b5563; line-height: 24px; margin-bottom: 24px;">
                Hello <strong>${order?.customerName || "Customer"}</strong>, we've received your order. ${paymentMessage}
              </p>
              
              <!-- Order Details Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; font-size: 13px; color: #4b5563; line-height: 22px;">
                    <div><strong>Order ID:</strong> <span style="font-family: monospace; font-size: 12px;">#${orderId.slice(-8).toUpperCase()}</span></div>
                    <div><strong>Payment Mode:</strong> ${order?.paymentMethod?.toUpperCase() || "COD / CARD"}</div>
                    <div><strong>Date Placed:</strong> ${orderDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                    ${order?.shippingAddress?.line1 ? `<div><strong>Delivery Address:</strong> ${order.shippingAddress.line1}, ${order.shippingAddress.city}</div>` : ""}
                  </td>
                </tr>
              </table>

              <!-- Product List -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr>
                    <th style="padding: 12px; text-align: left; background-color: #f9fafb; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Product Details</th>
                    <th style="padding: 12px; text-align: right; background-color: #f9fafb; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; width: 90px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals Section -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4b5563;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right; font-size: 14px; color: #111827;">${formatCurrency(orderSubtotal, currency)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4b5563;">Shipping</td>
                  <td style="padding: 6px 0; text-align: right; font-size: 14px; color: #111827; font-weight: bold;">
                    ${orderShipping === 0 ? "Free" : formatCurrency(orderShipping, currency)}
                  </td>
                </tr>
                ${orderTax > 0 ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 14px; color: #4b5563; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">Tax</td>
                  <td style="padding: 6px 0; text-align: right; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px;">${formatCurrency(orderTax, currency)}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 16px 0 0 0; font-size: 14px; font-weight: 800; text-transform: uppercase; color: #111827;">Grand Total</td>
                  <td style="padding: 16px 0 0 0; text-align: right; font-size: 22px; font-weight: 900; color: #10b981;">${formatCurrency(orderTotal, currency)}</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 16px;">
                <a href="${baseUrl}/order-confirmation/${orderId}" style="display: inline-block; background-color: #141210; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Track Order Status</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
              <p style="margin: 0 0 8px 0;">This is a transactional email regarding your purchase with ${siteName}.</p>
              <p style="margin: 0;">Need assistance? <a href="${baseUrl}/contact" style="color: #111827; text-decoration: underline; font-weight: bold;">Contact Customer Support</a></p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      const { transporter, from: senderFrom } = await this.getTransporter(settings);
      if (!transporter) {
        await Order.updateOne({ _id: orderId }, { $set: { confirmationEmailStatus: "failed" } });
        return false;
      }

      await transporter.sendMail({
        from: senderFrom || from,
        to: targetEmail,
        subject: `Order Confirmation #${orderId.slice(-6).toUpperCase()} - ${siteName}`,
        html: htmlTemplate,
        text: [
          "Thank you for your order!",
          paymentMessage,
          `Order #${orderId.slice(-8).toUpperCase()}`,
          `Order total: ${formatCurrency(orderTotal, currency)}`,
          `View your order: ${baseUrl}/order-confirmation/${orderId}`,
        ].join("\n"),
      });
      await Order.updateOne({ _id: orderId }, {
        $set: { confirmationEmailStatus: "sent", confirmationEmailSentAt: new Date() },
      });
      console.log(`[SMTP] Order confirmation email successfully sent to ${targetEmail}`);
      return true;
    } catch (error) {
      await Order.updateOne({ _id: orderId }, {
        $set: { confirmationEmailStatus: "failed" },
      }).catch((recordError) => console.error("Could not record email failure", recordError));
      console.error("[SMTP] Failed to send order confirmation email:", error);
      return false;
    }
  }

  /**
   * 2. Send Admin / Merchant Notification Email when a New Order Arrives
   */
  async sendAdminNewOrderNotification(orderId: string, total: number) {
    const from = process.env.EMAIL_FROM || "Sqodex Storefront <orders@sqodex.com>";
    const adminTo =
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "bgpharma@sqodex.com";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const [order, settingsRaw] = await Promise.all([
      getOrderById(orderId),
      getSiteSettings(true),
    ]);

    const settings = settingsRaw ? JSON.parse(JSON.stringify(settingsRaw)) : {};
    const currency = order?.currency || settings.currency || "USD";
    const items = order?.items || [];

    const itemsSummary = items
      .map((item: any) => {
        const name = item.productId?.name || item.name || "Item";
        return `<li><strong>${name}</strong> x ${item.quantity || 1} - ${formatCurrency((item.price || 0) * (item.quantity || 1), currency)}</li>`;
      })
      .join("");

    const orderTotal = order?.totals?.total ?? total;

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Received</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px 0;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          <tr>
            <td style="background-color: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.1em;">New Order Alert!</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.8;">Order #${orderId.slice(-8).toUpperCase()}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <p style="font-size: 15px; color: #1f2937; margin-top: 0;">
                A new order has been placed on your store. Here are the details:
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 22px; color: #334155;">
                <div><strong>Customer Name:</strong> ${order?.customerName || "N/A"}</div>
                <div><strong>Customer Email:</strong> ${order?.customerEmail || "N/A"}</div>
                <div><strong>Phone Number:</strong> ${order?.customerPhone || "N/A"}</div>
                <div><strong>Payment Method:</strong> ${(order?.paymentMethod || "cod").toUpperCase()}</div>
                <div><strong>Payment Status:</strong> ${(order?.paymentStatus || "pending").toUpperCase()}</div>
                <div><strong>Delivery Address:</strong> ${order?.shippingAddress?.line1 || ""}, ${order?.shippingAddress?.city || ""}, ${order?.shippingAddress?.country || ""}</div>
              </div>

              <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #0f172a;">Items Ordered:</h4>
              <ul style="font-size: 14px; color: #475569; padding-left: 20px; margin-bottom: 24px;">
                ${itemsSummary}
              </ul>

              <div style="border-top: 2px solid #e2e8f0; padding-top: 16px; margin-bottom: 24px; font-size: 16px; font-weight: bold; color: #0f172a; display: flex; justify-content: space-between;">
                <span>Total Amount:</span>
                <span style="color: #059669;">${formatCurrency(orderTotal, currency)}</span>
              </div>

              <div style="text-align: center;">
                <a href="${baseUrl}/admin/orders/${orderId}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">View Order in Admin Dashboard</a>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      const { transporter, from: senderFrom, adminEmail } = await this.getTransporter(settings);
      if (!transporter) return false;

      const recipient = adminEmail || adminTo;

      await transporter.sendMail({
        from: senderFrom || from,
        to: recipient,
        subject: `[New Order] #${orderId.slice(-6).toUpperCase()} - ${order?.customerName || "Customer"} (${formatCurrency(orderTotal, currency)})`,
        html: htmlTemplate,
      });
      console.log(`[SMTP] Admin new order notification email sent to ${recipient}`);
      return true;
    } catch (error) {
      console.error("[SMTP] Failed to send admin new order notification:", error);
      return false;
    }
  }

  /**
   * 3. Send Order Status Transition Email to Customer (Confirmed, Shipped, Delivered, Cancelled)
   */
  async sendOrderStatusUpdateEmail(to: string, orderId: string, status: string, trackingNumber?: string) {
    const from = process.env.EMAIL_FROM || "Sqodex Storefront <orders@sqodex.com>";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const [order, settingsRaw] = await Promise.all([
      getOrderById(orderId),
      getSiteSettings(true),
    ]);

    const customer = !to?.trim() && !order?.customerEmail?.trim() && order?.customerId
      ? await User.findById(order.customerId).select("email").lean()
      : null;
    const targetEmail = to?.trim() || order?.customerEmail?.trim() || customer?.email;
    if (!targetEmail) return;

    const settings = settingsRaw ? JSON.parse(JSON.stringify(settingsRaw)) : {};
    const siteName = settings?.name || process.env.NEXT_PUBLIC_SITE_NAME || "Sqodex Store";

    const statusMessages: Record<string, { title: string; headline: string; body: string; color: string }> = {
      processing: {
        title: "Order Confirmed & Being Prepared",
        headline: "Your Order is Being Prepared!",
        body: "Great news! Your order has been approved and is currently being packed for shipment.",
        color: "#2563eb",
      },
      shipped: {
        title: "Your Order is On The Way!",
        headline: "Your Parcel Has Shipped!",
        body: "Your order has been handed to our courier partner and is on its way to your destination.",
        color: "#7c3aed",
      },
      delivered: {
        title: "Your Order Has Been Delivered",
        headline: "Order Delivered!",
        body: "Your parcel has been successfully delivered. We hope you enjoy your purchase!",
        color: "#059669",
      },
      cancelled: {
        title: "Order Cancellation Notification",
        headline: "Your Order Has Been Cancelled",
        body: "Your order has been cancelled. If a refund applies, it will be processed according to our store policy.",
        color: "#e11d48",
      },
    };

    const config = statusMessages[status] || {
      title: `Order Update: ${status.toUpperCase()}`,
      headline: `Order Status: ${status.toUpperCase()}`,
      body: `Your order status has been updated to ${status}.`,
      color: "#4b5563",
    };

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${config.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px 0;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
          <tr>
            <td style="background-color: #141210; padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase;">${siteName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="font-size: 20px; font-weight: 800; color: ${config.color}; margin-top: 0; text-transform: uppercase;">${config.headline}</h2>
              <p style="font-size: 15px; color: #4b5563; line-height: 24px;">
                Hello <strong>${order?.customerName || "Customer"}</strong>,
              </p>
              <p style="font-size: 15px; color: #4b5563; line-height: 24px;">
                ${config.body}
              </p>

              <div style="background-color: #f3f4f6; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 13px; color: #4b5563; line-height: 22px;">
                <div><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</div>
                <div><strong>Status:</strong> <span style="font-weight: bold; text-transform: uppercase; color: ${config.color};">${status}</span></div>
                ${trackingNumber ? `<div><strong>Tracking Number:</strong> <span style="font-family: monospace;">${trackingNumber}</span></div>` : ""}
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="${baseUrl}/order-confirmation/${orderId}" style="display: inline-block; background-color: #141210; color: #ffffff; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">View Order & Tracking</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
              <p style="margin: 0;">Have questions? Contact us at <a href="${baseUrl}/contact" style="color: #111827;">our support desk</a>.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      const { transporter, from: senderFrom } = await this.getTransporter(settings);
      if (!transporter) return;

      await transporter.sendMail({
        from: senderFrom || from,
        to: targetEmail,
        subject: `Update on Order #${orderId.slice(-6).toUpperCase()}: ${config.title}`,
        html: htmlTemplate,
      });
      console.log(`[SMTP] Status update (${status}) email sent to ${targetEmail}`);
    } catch (error) {
      console.error(`[SMTP] Failed to send status update email to ${targetEmail}:`, error);
    }
  }

  /**
   * 4. Customer Password Reset Email
   */
  async sendPasswordResetEmail(to: string, token: string) {
    const from = process.env.EMAIL_FROM || "Sqodex Storefront <orders@sqodex.com>";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/account/reset-password?token=${token}`;

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px 0; text-align: center;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb;">
          <tr>
            <td>
              <h1 style="color: #111827; font-size: 24px; font-weight: 900; margin-bottom: 16px; text-transform: uppercase;">Reset Your Password</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 32px;">You requested a password reset. Click the button below to set a new password. This link is valid for 1 hour.</p>
              <a href="${resetUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Reset Password</a>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      const { transporter, from: senderFrom } = await this.getTransporter();
      if (!transporter) return;

      await transporter.sendMail({
        from: senderFrom || from,
        to,
        subject: "Reset your password",
        html: htmlTemplate,
      });
      console.log(`Password reset email sent to ${to}`);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }
  }

  /**
   * 5. Customer Email Verification Email
   */
  async sendVerificationEmail(to: string, token: string) {
    const from = process.env.EMAIL_FROM || "Sqodex Storefront <orders@sqodex.com>";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/account/verify-email?token=${token}`;

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px 0; text-align: center;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb;">
          <tr>
            <td>
              <h1 style="color: #111827; font-size: 24px; font-weight: 900; margin-bottom: 16px; text-transform: uppercase;">Verify Your Email</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 32px;">Thank you for registering. Please click the button below to verify your email address.</p>
              <a href="${verifyUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Verify Email</a>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      const { transporter, from: senderFrom } = await this.getTransporter();
      if (!transporter) return;

      await transporter.sendMail({
        from: senderFrom || from,
        to,
        subject: "Verify your email address",
        html: htmlTemplate,
      });
      console.log(`Verification email sent to ${to}`);
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }
  }
}

// Singleton export
export const emailService = new EmailService();

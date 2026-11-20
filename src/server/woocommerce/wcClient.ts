import crypto from "crypto";

export interface WooCommerceOrderPayload {
  payment_method?: string;
  payment_method_title?: string;
  set_paid?: boolean;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode?: string;
    country: string;
    email: string;
    phone?: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state?: string;
    postcode?: string;
    country: string;
  };
  line_items: Array<{
    product_id?: number;
    name: string;
    quantity: number;
    price?: string;
    total?: string;
  }>;
  meta_data?: Array<{ key: string; value: string }>;
}

export function verifyWooCommerceWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;
  try {
    const hmac = crypto.createHmac("sha256", secret);
    const calculatedSignature = hmac.update(rawBody, "utf8").digest("base64");
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(calculatedSignature)
    );
  } catch (err) {
    console.error("WooCommerce Webhook Signature Verification Error:", err);
    return false;
  }
}

export async function createWooCommerceOrder(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string,
  orderPayload: WooCommerceOrderPayload
) {
  const cleanUrl = storeUrl.replace(/\/+$/, "");
  const endpoint = `${cleanUrl}/wp-json/wc/v3/orders`;

  const authString = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WooCommerce API Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function getWooCommerceOrder(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string,
  orderId: string | number
) {
  const cleanUrl = storeUrl.replace(/\/+$/, "");
  const endpoint = `${cleanUrl}/wp-json/wc/v3/orders/${orderId}`;
  const authString = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Basic ${authString}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WooCommerce API Fetch Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

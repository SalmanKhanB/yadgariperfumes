import crypto from "crypto";

/**
 * Meta Conversions API (CAPI) Server-Side Helper
 * Reference: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

function hashData(value?: string): string | undefined {
  if (!value) return undefined;
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return undefined;
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

function hashPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (!cleaned) return undefined;
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

export interface CapiUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  ipAddress?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
}

export interface CapiCustomData {
  currency?: string;
  value?: number;
  contentType?: string;
  contentIds?: string[];
  contents?: Array<{ id: string; quantity: number; item_price: number }>;
  orderId?: string;
}

export interface SendCapiEventParams {
  eventName: "Purchase" | "InitiateCheckout" | "AddToCart" | "ViewContent" | "Lead";
  eventId: string;
  eventSourceUrl?: string;
  userData: CapiUserData;
  customData: CapiCustomData;
}

export async function sendMetaCapiEvent(params: SendCapiEventParams): Promise<{ success: boolean; error?: string }> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1803684254231950";
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!accessToken) {
    // Conversions API token not yet provided in .env - safe degradation
    return { success: false, error: "META_ACCESS_TOKEN not configured" };
  }

  try {
    const hashedEmail = hashData(params.userData.email);
    const hashedPhone = hashPhone(params.userData.phone);
    const hashedFirstName = hashData(params.userData.firstName);
    const hashedLastName = hashData(params.userData.lastName);
    const hashedCity = hashData(params.userData.city);
    const hashedCountry = hashData(params.userData.country);

    const userPayload: Record<string, any> = {};
    if (hashedEmail) userPayload.em = [hashedEmail];
    if (hashedPhone) userPayload.ph = [hashedPhone];
    if (hashedFirstName) userPayload.fn = [hashedFirstName];
    if (hashedLastName) userPayload.ln = [hashedLastName];
    if (hashedCity) userPayload.ct = [hashedCity];
    if (hashedCountry) userPayload.country = [hashedCountry];
    if (params.userData.ipAddress) userPayload.client_ip_address = params.userData.ipAddress;
    if (params.userData.userAgent) userPayload.client_user_agent = params.userData.userAgent;
    if (params.userData.fbp) userPayload.fbp = params.userData.fbp;
    if (params.userData.fbc) userPayload.fbc = params.userData.fbc;

    const eventPayload = {
      event_name: params.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.eventId,
      event_source_url: params.eventSourceUrl || process.env.NEXT_PUBLIC_APP_URL || "https://yadgari.com",
      action_source: "website",
      user_data: userPayload,
      custom_data: {
        currency: params.customData.currency || "AED",
        value: Number(params.customData.value || 0),
        content_type: params.customData.contentType || "product",
        content_ids: params.customData.contentIds || [],
        contents: params.customData.contents || [],
        order_id: params.customData.orderId,
      },
    };

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [eventPayload] }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.warn("Meta CAPI response warning:", result);
      return { success: false, error: JSON.stringify(result) };
    }

    return { success: true };
  } catch (err: any) {
    console.warn("Meta CAPI network error:", err?.message || err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}


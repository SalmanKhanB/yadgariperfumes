"use client";

/**
 * Meta Pixel (Facebook Pixel) E-commerce Helper Utilities
 * Reference: https://www.facebook.com/business/help/402791146561655?id=1205376682832142
 */

function getFbq(): any {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.fbq || null;
}

export function trackMetaEvent(
  eventName: string,
  params?: Record<string, any>,
  eventId?: string
) {
  if (typeof window === "undefined") return;
  const w = window as any;
  const options = eventId ? { eventID: String(eventId) } : undefined;

  if (w.fbq) {
    try {
      if (params && options) {
        w.fbq("track", eventName, params, options);
      } else if (params) {
        w.fbq("track", eventName, params);
      } else {
        w.fbq("track", eventName);
      }
    } catch (err) {
      console.warn("Meta Pixel event error:", err);
    }
  } else {
    // If fbq is still loading, wait and fire once ready
    setTimeout(() => {
      if (w.fbq) {
        try {
          if (params && options) {
            w.fbq("track", eventName, params, options);
          } else if (params) {
            w.fbq("track", eventName, params);
          } else {
            w.fbq("track", eventName);
          }
        } catch (_) {}
      }
    }, 300);
  }
}

/**
 * 1. ViewContent
 * Triggered on Product Detail Page views
 */
export function trackMetaViewContent(product: {
  productId: string;
  name: string;
  price: number;
  currency?: string;
  category?: string;
  eventId?: string;
}) {
  const price = Number(product.price || 0);
  const currency = product.currency || "AED";
  const id = String(product.productId);

  trackMetaEvent(
    "ViewContent",
    {
      content_ids: [id],
      content_name: product.name,
      content_category: product.category || "General",
      content_type: "product",
      contents: [
        {
          id: id,
          quantity: 1,
          item_price: price,
        },
      ],
      value: price,
      currency: currency,
    },
    product.eventId
  );
}

/**
 * 2. AddToCart
 * Triggered when a shopper adds an item to cart
 */
export function trackMetaAddToCart(item: {
  productId: string;
  name: string;
  price: number;
  currency?: string;
  quantity?: number;
  category?: string;
  eventId?: string;
}) {
  const qty = Math.max(1, Number(item.quantity || 1));
  const price = Number(item.price || 0);
  const currency = item.currency || "AED";
  const id = String(item.productId);

  trackMetaEvent(
    "AddToCart",
    {
      content_ids: [id],
      content_name: item.name,
      content_category: item.category || "General",
      content_type: "product",
      contents: [
        {
          id: id,
          quantity: qty,
          item_price: price,
        },
      ],
      value: price * qty,
      currency: currency,
      num_items: qty,
    },
    item.eventId
  );
}

/**
 * 3. InitiateCheckout
 * Triggered when a visitor begins the checkout journey
 */
export function trackMetaInitiateCheckout(data: {
  items: Array<{ productId: string; name?: string; price: number; quantity: number }>;
  total: number;
  currency?: string;
  numItems?: number;
  eventId?: string;
}) {
  const contentIds = data.items.map((i) => String(i.productId));
  const contents = data.items.map((i) => ({
    id: String(i.productId),
    quantity: Math.max(1, Number(i.quantity || 1)),
    item_price: Number(i.price || 0),
  }));
  const total = Number(data.total || 0);
  const currency = data.currency || "AED";
  const numItems = data.numItems || data.items.reduce((acc, i) => acc + (i.quantity || 1), 0);

  trackMetaEvent(
    "InitiateCheckout",
    {
      content_ids: contentIds,
      contents: contents,
      content_type: "product",
      num_items: numItems,
      value: total,
      currency: currency,
    },
    data.eventId
  );
}

/**
 * 4. AddPaymentInfo
 * Triggered when payment information is selected or submitted
 */
export function trackMetaAddPaymentInfo(data: {
  total: number;
  currency?: string;
  paymentType?: string;
  contentIds?: string[];
  contents?: Array<{ id: string; quantity: number; item_price: number }>;
  eventId?: string;
}) {
  const total = Number(data.total || 0);
  const currency = data.currency || "AED";

  trackMetaEvent(
    "AddPaymentInfo",
    {
      content_category: data.paymentType || "Card",
      content_ids: data.contentIds || [],
      contents: data.contents || [],
      value: total,
      currency: currency,
    },
    data.eventId
  );
}

/**
 * 5. Purchase
 * Triggered on successful checkout / order confirmation
 */
export function trackMetaPurchase(order: {
  orderId: string;
  total: number;
  currency?: string;
  numItems?: number;
  contentIds?: string[];
  contents?: Array<{ id: string; quantity: number; item_price: number }>;
  eventId?: string;
}) {
  const total = Number(order.total || 0);
  const currency = order.currency || "AED";
  const orderId = String(order.orderId);

  trackMetaEvent(
    "Purchase",
    {
      content_type: "product",
      content_ids: order.contentIds || [],
      contents: order.contents || [],
      value: total,
      currency: currency,
      num_items: order.numItems || 1,
      order_id: orderId,
    },
    order.eventId || orderId
  );
}

/**
 * 6. AddToWishlist
 * Triggered when a shopper adds an item to wishlist
 */
export function trackMetaAddToWishlist(item: {
  productId: string;
  name?: string;
  price?: number;
  currency?: string;
  category?: string;
  eventId?: string;
}) {
  const price = Number(item.price || 0);
  const currency = item.currency || "AED";
  const id = String(item.productId);

  trackMetaEvent(
    "AddToWishlist",
    {
      content_ids: [id],
      content_name: item.name || "Fragrance",
      content_category: item.category || "Luxury Fragrance",
      content_type: "product",
      contents: [
        {
          id: id,
          quantity: 1,
          item_price: price,
        },
      ],
      value: price,
      currency: currency,
    },
    item.eventId
  );
}

/**
 * 7. Search
 * Triggered when a customer performs a site search
 */
export function trackMetaSearch(query: string, eventId?: string) {
  if (!query || !query.trim()) return;
  trackMetaEvent(
    "Search",
    {
      search_string: query.trim(),
    },
    eventId
  );
}

/**
 * 8. Lead
 * Triggered when a user signs up for newsletter or submits an inquiry
 */
export function trackMetaLead(data?: {
  content_name?: string;
  value?: number;
  currency?: string;
  eventId?: string;
}) {
  trackMetaEvent(
    "Lead",
    {
      content_name: data?.content_name || "Newsletter Signup",
      value: data?.value || 0,
      currency: data?.currency || "AED",
    },
    data?.eventId
  );
}

/**
 * 9. CompleteRegistration
 * Triggered on customer account signup
 */
export function trackMetaCompleteRegistration(method: string = "email", eventId?: string) {
  trackMetaEvent(
    "CompleteRegistration",
    {
      content_name: method,
      status: true,
    },
    eventId
  );
}

/**
 * 10. Contact
 * Triggered when contact or inquiry is submitted
 */
export function trackMetaContact(data?: { method?: string; eventId?: string }) {
  trackMetaEvent(
    "Contact",
    {
      content_name: data?.method || "Contact Form",
    },
    data?.eventId
  );
}

/**
 * Advanced Matching Helper
 * Updates user identification data for Meta Event Match Quality (EMQ)
 */
export function setMetaUserData(data: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
}) {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (!w.fbq) return;

  const userData: Record<string, string> = {};
  if (data.email) userData.em = data.email.trim().toLowerCase();
  if (data.phone) userData.ph = data.phone.replace(/[^0-9]/g, "");
  if (data.firstName) userData.fn = data.firstName.trim().toLowerCase();
  if (data.lastName) userData.ln = data.lastName.trim().toLowerCase();
  if (data.city) userData.ct = data.city.trim().toLowerCase();
  if (data.country) userData.country = data.country.trim().toLowerCase();

  try {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1803684254231950";
    w.fbq("setUserProperties", pixelId, userData);
  } catch (_) {}
}

import Stripe from "stripe";

export function getStripeClient(): Stripe {
  const key = (process.env.STRIPE_SECRET_KEY || "dummy_key_for_build").trim();
  return new Stripe(key, {
    appInfo: {
      name: "Sqodex-Shopify-Template",
      version: "0.1.0",
    },
  });
}

// Proxy getter ensures Stripe always reads the latest STRIPE_SECRET_KEY from process.env dynamically
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripeClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

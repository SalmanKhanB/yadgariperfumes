import { IProduct } from "../db/models/Product";
import { IOffer } from "../db/models/Offer";

export interface EffectivePriceResult {
  price: number;
  compareAt?: number;
  offer?: IOffer | null;
}

export function getEffectivePrice(product: IProduct, offer?: IOffer | null): EffectivePriceResult {
  if (!offer || !offer.isActive) {
    return { price: product.price, compareAt: product.compareAtPrice, offer: null };
  }

  const now = new Date();
  
  // Check if offer is currently valid
  if (now < offer.startsAt || (offer.endsAt && now > offer.endsAt)) {
    return { price: product.price, compareAt: product.compareAtPrice, offer: null };
  }
  
  // Check redemption limit
  if (offer.maxRedemptions && offer.redemptions >= offer.maxRedemptions) {
    return { price: product.price, compareAt: product.compareAtPrice, offer: null };
  }

  let discountedPrice = product.price;

  if (offer.type === "PERCENTAGE") {
    // e.g. 20 means 20% off
    discountedPrice = product.price * (1 - (offer.value / 100));
  } else if (offer.type === "FIXED_AMOUNT") {
    // e.g. 10 means $10 off
    discountedPrice = Math.max(0, product.price - offer.value);
  }

  return {
    price: discountedPrice,
    compareAt: product.price, // original price becomes compareAt
    offer
  };
}

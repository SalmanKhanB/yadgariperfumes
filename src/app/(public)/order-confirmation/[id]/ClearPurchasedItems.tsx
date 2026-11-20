"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

interface PurchasedItem {
  productId: string;
  variantName?: string;
  quantity: number;
}

export default function ClearPurchasedItems({
  orderId,
  items,
}: {
  orderId: string;
  items: PurchasedItem[];
}) {
  useEffect(() => {
    const key = "sqodex-stripe-checkout";
    try {
      if (window.sessionStorage.getItem(key) !== orderId) return;
      window.sessionStorage.removeItem(key);
    } catch {
      return;
    }

    for (const item of items) {
      const { cart, removeFromCart, updateQuantity } = useAppStore.getState();
      const cartItem = cart.find(
        (line) => line.productId === item.productId && line.selectedVariant?.name === item.variantName
      );
      if (!cartItem) continue;

      const remaining = cartItem.quantity - item.quantity;
      if (remaining > 0) {
        updateQuantity(item.productId, remaining, item.variantName);
      } else {
        removeFromCart(item.productId, item.variantName);
      }
    }
  }, [items, orderId]);

  return null;
}

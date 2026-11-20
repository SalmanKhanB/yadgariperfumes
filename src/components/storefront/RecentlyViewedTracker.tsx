"use client";

import { useEffect, useRef } from "react";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";

export default function RecentlyViewedTracker({ product }: { product: any }) {
  const addProduct = useRecentlyViewedStore(state => state.addProduct);
  const addedRef = useRef(false);

  useEffect(() => {
    if (product && !addedRef.current) {
      addedRef.current = true;
      try {
        addProduct(product);
      } catch (e) {
        console.error("Failed to add to recently viewed", e);
      }
    }
  }, [product, addProduct]);

  return null;
}

"use client";

import { useEffect, useRef } from "react";
import { trackMetaPurchase } from "@/lib/analytics/metaPixel";

interface MetaPurchaseTrackerProps {
  orderId: string;
  total: number;
  currency?: string;
  numItems?: number;
  contentIds?: string[];
  contents?: Array<{ id: string; quantity: number; item_price: number }>;
}

export default function MetaPurchaseTracker({
  orderId,
  total,
  currency = "AED",
  numItems = 1,
  contentIds,
  contents,
}: MetaPurchaseTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!orderId || trackedRef.current) return;

    // Prevent duplicate Purchase events on page refresh / re-render
    const storageKey = `meta_purchase_tracked_${orderId}`;
    if (typeof window !== "undefined") {
      try {
        if (sessionStorage.getItem(storageKey)) {
          return;
        }
        sessionStorage.setItem(storageKey, "true");
      } catch (_) {}
    }

    trackedRef.current = true;

    trackMetaPurchase({
      orderId,
      total,
      currency,
      numItems,
      contentIds,
      contents,
    });
  }, [orderId, total, currency, numItems, contentIds, contents]);

  return null;
}

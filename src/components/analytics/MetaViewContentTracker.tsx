"use client";

import { useEffect, useRef } from "react";
import { trackMetaViewContent } from "@/lib/analytics/metaPixel";

interface MetaViewContentTrackerProps {
  productId: string;
  name: string;
  price: number;
  currency?: string;
  category?: string;
}

export default function MetaViewContentTracker({
  productId,
  name,
  price,
  currency = "AED",
  category,
}: MetaViewContentTrackerProps) {
  const lastTrackedId = useRef<string | null>(null);

  useEffect(() => {
    if (!productId || lastTrackedId.current === productId) return;
    lastTrackedId.current = productId;

    trackMetaViewContent({
      productId,
      name,
      price,
      currency,
      category,
    });
  }, [productId, name, price, currency, category]);

  return null;
}


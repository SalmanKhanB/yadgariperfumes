"use client";

import { useEffect, useRef } from "react";
import { trackMetaSearch } from "@/lib/analytics/metaPixel";

export default function MetaSearchTracker({ query }: { query: string }) {
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    const trimmed = query?.trim();
    if (!trimmed || trackedRef.current === trimmed) return;
    trackedRef.current = trimmed;
    trackMetaSearch(trimmed);
  }, [query]);

  return null;
}


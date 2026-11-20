"use client";

import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";

export default function RecentlyViewedCarousel({ currentProductId }: { currentProductId?: string }) {
  const [mounted, setMounted] = useState(false);
  const viewedProducts = useRecentlyViewedStore(state => state.viewedProducts);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter out the current product from the recently viewed list if we are on a product page
  const displayProducts = viewedProducts.filter(p => p._id !== currentProductId).slice(0, 4);

  if (displayProducts.length === 0) return null;

  return (
    <div className="py-24 border-t border-border bg-background">
      <div className="max-w-[90rem] mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-12 text-foreground">
          Recently Viewed
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

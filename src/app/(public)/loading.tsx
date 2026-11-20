import React from "react";
import { HeroSkeleton, ProductSkeletonGrid } from "@/components/storefront/SectionSkeleton";

export default function GlobalPublicLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-7 w-48 skeleton-shimmer rounded-xl" />
          <div className="h-5 w-24 skeleton-shimmer rounded-lg" />
        </div>
        <ProductSkeletonGrid count={8} />
      </div>
    </div>
  );
}

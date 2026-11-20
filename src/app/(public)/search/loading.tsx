import React from "react";
import { ProductSkeletonGrid } from "@/components/storefront/SectionSkeleton";

export default function SearchLoading() {
  return (
    <div className="min-h-screen pt-24 pb-24 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        <div className="space-y-3">
          <div className="h-10 w-80 max-w-full skeleton-shimmer rounded-xl" />
          <div className="h-4 w-48 skeleton-shimmer rounded-lg" />
        </div>
        <ProductSkeletonGrid count={8} />
      </div>
    </div>
  );
}

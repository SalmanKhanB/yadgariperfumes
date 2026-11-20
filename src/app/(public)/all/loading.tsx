import React from "react";
import { ProductSkeletonGrid } from "@/components/storefront/SectionSkeleton";

export default function AllProductsLoading() {
  return (
    <div className="min-h-screen pt-24 pb-24 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header Skeleton */}
        <div className="mb-10 space-y-3">
          <div className="h-4 w-32 skeleton-shimmer rounded-full" />
          <div className="h-10 w-64 skeleton-shimmer rounded-xl" />
          <div className="h-4 w-96 max-w-full skeleton-shimmer rounded-lg" />
        </div>

        {/* Sidebar & Products Grid Skeleton */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="hidden lg:block w-72 shrink-0 p-6 bg-card border border-border/60 rounded-2xl space-y-6">
            <div className="h-6 w-32 skeleton-shimmer rounded-lg" />
            <div className="space-y-3 pt-4 border-t border-border/40">
              <div className="h-4 w-20 skeleton-shimmer rounded" />
              <div className="h-10 w-full skeleton-shimmer rounded-xl" />
            </div>
            <div className="space-y-3 pt-4 border-t border-border/40">
              <div className="h-4 w-24 skeleton-shimmer rounded" />
              <div className="h-8 w-full skeleton-shimmer rounded-lg" />
              <div className="h-8 w-full skeleton-shimmer rounded-lg" />
            </div>
          </div>

          <div className="grow w-full">
            <ProductSkeletonGrid count={8} />
          </div>
        </div>

      </div>
    </div>
  );
}

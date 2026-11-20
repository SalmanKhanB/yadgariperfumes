import React from "react";
import { ProductSkeletonGrid } from "@/components/storefront/SectionSkeleton";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen pt-24 pb-24 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Banner Skeleton */}
        <div className="relative w-full h-64 md:h-80 skeleton-shimmer rounded-3xl mb-10 overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 space-y-4">
            <div className="h-4 w-24 skeleton-shimmer rounded-full" />
            <div className="h-10 w-64 skeleton-shimmer rounded-xl" />
            <div className="h-4 w-96 max-w-full skeleton-shimmer rounded-lg" />
          </div>
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

import React from "react";

export default function ProductLoading() {
  return (
    <div className="relative min-h-screen pt-24 pb-32 overflow-hidden bg-background text-foreground">
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-4 w-16 skeleton-shimmer rounded-md" />
          <div className="h-3 w-3 skeleton-shimmer rounded-full" />
          <div className="h-4 w-24 skeleton-shimmer rounded-md" />
          <div className="h-3 w-3 skeleton-shimmer rounded-full" />
          <div className="h-4 w-36 skeleton-shimmer rounded-md" />
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Gallery Skeleton (Left 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="relative aspect-4/5 w-full skeleton-shimmer rounded-3xl overflow-hidden border border-border/40" />
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-24 skeleton-shimmer rounded-xl shrink-0" />
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-5 w-1/3 skeleton-shimmer rounded-lg" />
              <div className="h-4 w-full skeleton-shimmer rounded" />
              <div className="h-4 w-11/12 skeleton-shimmer rounded" />
              <div className="h-4 w-4/5 skeleton-shimmer rounded" />
            </div>
          </div>

          {/* Product Details Sidebar Skeleton (Right 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex gap-3">
              <div className="h-6 w-28 skeleton-shimmer rounded-full" />
              <div className="h-6 w-20 skeleton-shimmer rounded-full" />
            </div>

            <div className="space-y-3">
              <div className="h-10 w-4/5 skeleton-shimmer rounded-xl" />
              <div className="h-6 w-2/3 skeleton-shimmer rounded-lg" />
            </div>

            <div className="border-y border-border/40 py-6 space-y-2">
              <div className="flex items-center gap-4">
                <div className="h-9 w-32 skeleton-shimmer rounded-xl" />
                <div className="h-6 w-20 skeleton-shimmer rounded-lg" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-5 w-24 skeleton-shimmer rounded" />
              <div className="flex gap-3">
                <div className="h-12 w-24 skeleton-shimmer rounded-xl" />
                <div className="h-12 w-24 skeleton-shimmer rounded-xl" />
                <div className="h-12 w-24 skeleton-shimmer rounded-xl" />
              </div>
            </div>

            <div className="h-14 w-full skeleton-shimmer rounded-2xl pt-4" />
          </div>

        </div>
      </div>
    </div>
  );
}

import React from "react";

export function HeroSkeleton() {
  return (
    <div className="w-full py-16 md:py-24 px-4 max-w-7xl mx-auto space-y-8">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="h-4 w-32 mx-auto skeleton-shimmer rounded-full" />
        <div className="h-10 md:h-14 w-3/4 mx-auto skeleton-shimmer rounded-2xl" />
        <div className="h-5 w-2/3 mx-auto skeleton-shimmer rounded-lg" />
        <div className="flex justify-center gap-4 pt-4">
          <div className="h-12 w-36 skeleton-shimmer rounded-xl" />
          <div className="h-12 w-36 skeleton-shimmer rounded-xl" />
        </div>
      </div>
      <div className="h-72 md:h-112 w-full skeleton-shimmer rounded-3xl" />
    </div>
  );
}

export function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 bg-card border border-border/60 rounded-2xl space-y-3 shadow-xs">
          <div className="aspect-square w-full skeleton-shimmer rounded-xl" />
          <div className="space-y-2">
            <div className="h-3 w-1/3 skeleton-shimmer rounded-full" />
            <div className="h-4 w-5/6 skeleton-shimmer rounded-lg" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-5 w-20 skeleton-shimmer rounded-lg" />
              <div className="h-8 w-8 skeleton-shimmer rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategorySkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-card border border-border/60 rounded-2xl text-center space-y-3">
          <div className="w-16 h-16 mx-auto skeleton-shimmer rounded-full" />
          <div className="h-4 w-20 mx-auto skeleton-shimmer rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="py-10 border-b border-border/40 space-y-3 text-center">
      <div className="h-4 w-24 mx-auto skeleton-shimmer rounded-full" />
      <div className="h-8 md:h-10 w-64 mx-auto skeleton-shimmer rounded-xl" />
      <div className="h-4 w-96 max-w-full mx-auto skeleton-shimmer rounded-lg" />
    </div>
  );
}

export function PageContentSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
      <PageHeaderSkeleton />
      <div className="space-y-4 pt-6">
        <div className="h-6 w-1/3 skeleton-shimmer rounded-lg" />
        <div className="h-4 w-full skeleton-shimmer rounded" />
        <div className="h-4 w-11/12 skeleton-shimmer rounded" />
        <div className="h-4 w-4/5 skeleton-shimmer rounded" />
      </div>
      <div className="space-y-4 pt-6">
        <div className="h-6 w-1/4 skeleton-shimmer rounded-lg" />
        <div className="h-4 w-full skeleton-shimmer rounded" />
        <div className="h-4 w-5/6 skeleton-shimmer rounded" />
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-8 w-48 skeleton-shimmer rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 bg-card border border-border/60 rounded-2xl flex gap-4 items-center">
            <div className="w-20 h-20 skeleton-shimmer rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 skeleton-shimmer rounded" />
              <div className="h-3 w-1/4 skeleton-shimmer rounded" />
              <div className="h-5 w-20 skeleton-shimmer rounded-md" />
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-card border border-border/60 rounded-2xl space-y-4 h-fit">
        <div className="h-6 w-32 skeleton-shimmer rounded-lg" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-20 skeleton-shimmer rounded" />
            <div className="h-4 w-16 skeleton-shimmer rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-24 skeleton-shimmer rounded" />
            <div className="h-4 w-12 skeleton-shimmer rounded" />
          </div>
        </div>
        <div className="h-12 w-full skeleton-shimmer rounded-xl pt-4" />
      </div>
    </div>
  );
}

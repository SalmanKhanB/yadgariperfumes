import React from "react";
import { PageHeaderSkeleton, CategorySkeletonGrid, ProductSkeletonGrid } from "@/components/storefront/SectionSkeleton";

export default function CollectionsLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 max-w-7xl mx-auto space-y-12">
      <PageHeaderSkeleton />
      <div className="space-y-4">
        <div className="h-6 w-36 skeleton-shimmer rounded-lg" />
        <CategorySkeletonGrid count={6} />
      </div>
      <div className="space-y-6 pt-4">
        <div className="h-6 w-48 skeleton-shimmer rounded-lg" />
        <ProductSkeletonGrid count={8} />
      </div>
    </div>
  );
}

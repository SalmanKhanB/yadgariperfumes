import React from "react";
import { PageContentSkeleton } from "@/components/storefront/SectionSkeleton";

export default function CustomPageLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageContentSkeleton />
    </div>
  );
}

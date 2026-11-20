import React from "react";
import { CartSkeleton } from "@/components/storefront/SectionSkeleton";

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CartSkeleton />
    </div>
  );
}

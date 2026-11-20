"use client";

import { useWishlist } from "@/components/providers/WishlistProvider";
import { useEffect, useState } from "react";
import { fetchProductsByIdsAction } from "@/server/actions/productActions";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function WishlistClientGrid({
  gridClass,
  cardStyle,
  showSoldOutBadge = true
}: {
  gridClass: string;
  cardStyle: string;
  showSoldOutBadge?: boolean;
}) {
  const { wishlistIds, isLoading: isContextLoading } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        return;
      }

      setIsFetching(true);
      const res = await fetchProductsByIdsAction(wishlistIds);
      if (res.success) {
        setProducts(res.data);
      }
      setIsFetching(false);
    }

    if (!isContextLoading) {
      loadProducts();
    }
  }, [wishlistIds, isContextLoading]);

  if (isContextLoading || isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
        <Loader2 size={32} className="animate-spin" />
        <p className="font-bold tracking-widest uppercase text-sm">Loading Wishlist...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-32 rounded-3xl glass-card border border-border">
        <p className="text-xl text-muted-foreground font-medium uppercase tracking-wider mb-6">Your wishlist is empty.</p>
        <Link
          href="/all"
          className="inline-flex items-center justify-center px-8 py-3 bg-foreground text-background font-bold uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform"
        >
          Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-start">
      {products.map((product: any) => (
        <div key={String(product._id)} className="w-full flex">
          <ProductCard product={product} layoutStyle={cardStyle as any} showSoldOutBadge={showSoldOutBadge} />
        </div>
      ))}
    </div>
  );
}

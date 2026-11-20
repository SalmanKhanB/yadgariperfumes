"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Check, ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
    slug: string;
    inventory: number;
  };
  selectedVariant?: {
    name: string;
    price: number;
    sku?: string;
  };
  quantity?: number;
}

export default function AddToCartButton({ product, selectedVariant, quantity = 1 }: AddToCartButtonProps) {
  const addToCart = useAppStore((state) => state.addToCart);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      productId: product._id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      image: product.image,
      slug: product.slug,
      quantity: Math.min(99, Math.max(1, quantity)),
      selectedVariant: selectedVariant ? {
        name: selectedVariant.name,
        price: selectedVariant.price,
        sku: selectedVariant.sku
      } : undefined
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2500);
  };

  const isOutOfStock = selectedVariant ? selectedVariant.price === -1 : product.inventory === 0;

  return (
    <button 
      onClick={handleAdd}
      disabled={isOutOfStock}
      className={`w-full py-3.5 sm:py-4 px-3 sm:px-6 font-mono text-[11px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer border rounded-none whitespace-nowrap ${
        added
          ? "bg-emerald-700 text-white border-emerald-700 shadow-md"
          : isOutOfStock
          ? "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-60"
          : "bg-foreground text-background border-foreground hover:bg-transparent hover:text-foreground"
      }`}
    >
      {added ? (
        <>
          <Check size={14} className="shrink-0" />
          <span className="hidden sm:inline font-bold">ADDED TO CART</span>
          <span className="sm:hidden font-bold">ADDED</span>
        </>
      ) : isOutOfStock ? (
        <span>Out of Stock</span>
      ) : (
        <>
          <ShoppingBag size={14} className="shrink-0" />
          <span className="hidden sm:inline font-bold">ADD TO CART</span>
          <span className="sm:hidden font-bold">CART</span>
        </>
      )}
    </button>
  );
}

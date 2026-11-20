"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import AddToCartButton from "./AddToCartButton";
import { Heart, Zap, Minus, Plus } from "lucide-react";

interface ProductVariantsFormProps {
  product: {
    _id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    slug: string;
    inventory: number;
    images?: any[];
    hasVariants?: boolean;
    variants?: {
      name: string;
      sku?: string;
      priceOverride?: number;
      inventory: number;
      options: { name: string; value: string }[];
    }[];
  };
}

export default function ProductVariantsForm({ product }: ProductVariantsFormProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const hasVariants = product.hasVariants && product.variants && product.variants.length > 0;

  // Extract option groups (e.g. Size -> ["S", "M", "L"])
  const optionGroups = useMemo(() => {
    const groups: { [key: string]: string[] } = {};
    if (!hasVariants) return groups;

    product.variants!.forEach((v: any) => {
      v.options.forEach((o: any) => {
        if (!groups[o.name]) {
          groups[o.name] = [];
        }
        if (!groups[o.name].includes(o.value)) {
          groups[o.name].push(o.value);
        }
      });
    });

    return groups;
  }, [hasVariants, product.variants]);

  // Selected options state
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});

  // Initialize selected options with first available variant
  useEffect(() => {
    if (hasVariants && product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      const initialOptions: { [key: string]: string } = {};
      firstVariant.options.forEach((o) => {
        initialOptions[o.name] = o.value;
      });
      setSelectedOptions(initialOptions);
    }
  }, [hasVariants, product.variants]);

  // Find the currently matching variant
  const matchingVariant = useMemo(() => {
    if (!hasVariants || !product.variants) return null;

    return product.variants.find((v) => {
      return v.options.every((o) => selectedOptions[o.name] === o.value);
    }) || null;
  }, [hasVariants, product.variants, selectedOptions]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Determine current active price and inventory
  const activePrice = matchingVariant?.priceOverride !== undefined && matchingVariant.priceOverride !== null
    ? matchingVariant.priceOverride
    : product.price;

  const activeInventory = matchingVariant?.inventory !== undefined && matchingVariant.inventory !== null
    ? matchingVariant.inventory
    : product.inventory;

  const isOutOfStock = activeInventory <= 0;

  const primaryImage = product.images && product.images.length > 0
    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
    : undefined;

  const cartProduct = {
    _id: product._id,
    name: product.name,
    price: activePrice,
    image: primaryImage,
    slug: product.slug,
    inventory: activeInventory,
  };

  const selectedVariantData = matchingVariant
    ? {
        name: matchingVariant.name,
        price: activePrice,
        sku: matchingVariant.sku,
      }
    : undefined;

  const addToCart = useAppStore((state) => state.addToCart);

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart({
      productId: cartProduct._id,
      name: cartProduct.name,
      price: cartProduct.price,
      image: cartProduct.image,
      quantity: Math.min(99, Math.max(1, quantity)),
      slug: cartProduct.slug,
      selectedVariant: selectedVariantData,
    });
    router.push("/checkout");
  };

  // Determine if a sale compareAt price should be displayed
  let compareAt = product.compareAtPrice;
  if (matchingVariant && matchingVariant.priceOverride !== undefined) {
    if (matchingVariant.priceOverride < product.price && !compareAt) {
      compareAt = product.price;
    }
  }

  const showCompareAt = compareAt !== undefined && compareAt > activePrice;
  const discountPercent = showCompareAt ? Math.round(((compareAt! - activePrice) / compareAt!) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Price Segment */}
      <div className="border-b border-border pb-6">
        <div className="flex flex-col gap-2">
          {/* Main Price, Strike-Through Original Price & Discount Badge Row */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-price font-bold text-foreground tracking-tight">
              {formatPrice(activePrice)}
            </span>
            
            {showCompareAt && (
              <span className="text-lg sm:text-xl font-price font-bold text-muted-foreground/75 line-through decoration-muted-foreground/50">
                {formatPrice(compareAt!)}
              </span>
            )}

            {showCompareAt && (
              <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <p className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground font-medium">
            Taxes and duties included
          </p>
        </div>
      </div>

      {/* Option Selectors Segment */}
      {hasVariants && (
        <div className="space-y-6 border-b border-border pb-8">
          {Object.keys(optionGroups).map((optionName) => (
            <div key={optionName} className="space-y-3">
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-foreground block">{optionName}</span>
              <div className="flex flex-wrap gap-3">
                {optionGroups[optionName].map((value) => {
                  const isSelected = selectedOptions[optionName] === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(optionName, value)}
                      className={`px-5 py-2.5 text-xs md:text-sm font-semibold uppercase tracking-wider transition-colors border ${
                        isSelected
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-foreground border-border hover:border-foreground"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quantity & Actions Segment */}
      <div className="space-y-4 pt-2">
        {/* Quantity Picker */}
        <div className="flex items-center justify-between border-y border-border py-3.5">
          <span className="text-xs md:text-sm uppercase tracking-wider text-foreground font-bold">
            Quantity
          </span>
          <div className="flex items-center border border-border bg-background rounded-lg overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={isOutOfStock || quantity <= 1}
              className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <input
              type="number"
              min={1}
              max={99}
              disabled={isOutOfStock}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setQuantity(Math.min(99, Math.max(1, val)));
              }}
              onBlur={(e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 1) setQuantity(1);
                else if (val > 99) setQuantity(99);
              }}
              className="w-12 text-center font-mono text-xs font-bold text-foreground bg-transparent border-x border-border py-1.5 focus:outline-none focus:bg-muted/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Quantity"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              disabled={isOutOfStock || quantity >= 99}
              className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <AddToCartButton 
              product={cartProduct} 
              selectedVariant={selectedVariantData}
              quantity={quantity}
            />
          </div>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`flex-1 py-3.5 sm:py-4 px-3 sm:px-6 font-mono text-[11px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer border whitespace-nowrap ${
              isOutOfStock
                ? "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-60"
                : "bg-foreground text-background border-foreground hover:bg-transparent hover:text-foreground"
            }`}
          >
            <Zap size={14} className="shrink-0" />
            <span className="font-bold">BUY NOW</span>
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(String(product._id));
            }}
            className="shrink-0 flex items-center justify-center border border-foreground w-14 h-13 hover:bg-foreground hover:text-background transition-all cursor-pointer group"
            aria-label="Toggle Wishlist"
            title={isInWishlist(String(product._id)) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart 
              size={18} 
              className={`transition-all ${isInWishlist(String(product._id)) ? 'fill-red-500 text-red-500' : 'text-foreground group-hover:text-background'}`} 
            />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeInventory > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
          <span className="text-xs font-sans font-medium text-muted-foreground">
            {activeInventory > 0 ? "In Stock & Ready to Ship" : "Currently Out of Stock"}
          </span>
        </div>
      </div>
    </div>
  );
}

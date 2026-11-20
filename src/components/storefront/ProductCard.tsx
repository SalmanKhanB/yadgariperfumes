"use client";

import Link from "next/link";
import Image from "next/image";
import ShimmerImage from "@/components/ui/ShimmerImage";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useAppStore } from "@/store/useAppStore";
import { Heart, Sparkles, Leaf, Award, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";

import { getOptimizedImageUrl } from "@/lib/utils/format";

const highlightMatch = (text: string, query?: string) => {
  if (!query || !query.trim()) return text;
  const q = query.trim();
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="bg-transparent text-amber-300 dark:text-amber-400 font-extrabold underline">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export default function ProductCard({
  product,
  layoutStyle,
  showSoldOutBadge = true,
  searchQuery = "",
}: {
  product: any;
  layoutStyle?: string;
  showSoldOutBadge?: boolean;
  searchQuery?: string;
}) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const addToCart = useAppStore((state) => state.addToCart);

  const [isNavigating, setIsNavigating] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const primaryCategory = product.categories && product.categories.length > 0 ? product.categories[0] : null;
  const categoryName = primaryCategory?.name || "FOR MEN";
  const productUrl = `/${primaryCategory?.slug || "uncategorized"}/${product.slug}`;
  const primaryImage = product.images && product.images.length > 0
    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
    : undefined;
  const altText = product.images && product.images.length > 0 && typeof product.images[0] === 'object' && product.images[0].altText
    ? product.images[0].altText
    : product.name;

  const isWishlisted = isInWishlist(String(product._id));
  const isOutOfStock = product.inventory === 0;
  const discountPercent = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const unitText = product.unitQuantity && product.unitType
    ? `${product.unitQuantity} ${product.unitType}`
    : "50 ML";

  const handleLinkClick = () => {
    setIsNavigating(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart({
      productId: String(product._id),
      name: product.name,
      price: product.price,
      image: primaryImage,
      slug: product.slug,
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div className={`group relative flex flex-col w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-md hover:shadow-xl transition-all duration-300 bg-card text-card-foreground ${isNavigating ? 'opacity-80' : ''}`}>

      {/* Loading bar on click */}
      {isNavigating && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent z-30 overflow-hidden">
          <div className="w-full h-full bg-background animate-shimmer" />
        </div>
      )}

      {/* 1. Header Section */}
      <div className="bg-card text-card-foreground p-3 sm:p-4 lg:p-5 relative transition-colors duration-300 border-b border-border/50">
        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
          <div className="flex-1 min-w-0 pr-0.5">
            <span className="text-[10px] sm:text-xs lg:text-sm font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5 truncate">
              {categoryName}
            </span>
            <Link href={productUrl} prefetch={true} onClick={handleLinkClick}>
              <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-card-foreground tracking-tight leading-snug line-clamp-1 group-hover:text-accent transition-colors">
                {highlightMatch(product.name, searchQuery)}
              </h3>
            </Link>
          </div>

          {/* Wishlist Icon Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(String(product._id));
            }}
            aria-label="Toggle Wishlist"
            className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full bg-muted text-card-foreground flex items-center justify-center border border-border hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 z-20 shadow-sm"
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-card-foreground'}`}
            />
          </button>
        </div>

        {/* Pricing */}
        <div className="mt-1.5 sm:mt-2.5 flex items-baseline gap-2 flex-wrap min-w-0">
          <span className="text-base sm:text-lg lg:text-xl font-bold text-card-foreground font-mono tracking-tight shrink-0">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice > product.price && (
            <span className="text-xs sm:text-sm lg:text-base text-muted-foreground/70 line-through font-mono shrink-0">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Sold Out Badge */}
        {showSoldOutBadge && isOutOfStock && (
          <div className="absolute left-3 sm:left-4 -bottom-3 sm:-bottom-3.5 z-20">
            <span className="bg-destructive text-destructive-foreground px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-[6px] text-xs font-bold font-mono tracking-wider border border-border whitespace-nowrap shadow-md">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute right-3 sm:right-4 -bottom-3 sm:-bottom-3.5 z-20">
            <span className="bg-[#141210] text-[#F4F1EA] dark:bg-black dark:text-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-[6px] text-xs font-bold font-mono tracking-wider border border-border whitespace-nowrap shadow-md">
              {discountPercent}% OFF
            </span>
          </div>
        )}
      </div>

      {/* 2. Image Section */}
      <div className="relative aspect-square w-full bg-muted/40 overflow-hidden flex items-center justify-center border-b border-border/50">

        <Link href={productUrl} prefetch={true} onClick={handleLinkClick} className="block w-full h-full relative">
          {primaryImage ? (
            <ShimmerImage
              src={getOptimizedImageUrl(primaryImage, 600)}
              alt={altText}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-[8.5px] sm:text-xs uppercase tracking-widest">
              No Image
            </div>
          )}
        </Link>
      </div>

      {/* 3. Product Features Bar (3 Icons) */}
      <div className="bg-card py-2.5 sm:py-3 px-1.5 border-b border-border/50">
        <div className="grid grid-cols-3 gap-1 text-center font-sans">

          <div className="flex flex-col items-center justify-start px-0.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0 mb-1" />
            <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-foreground/80 leading-tight text-center block w-full truncate">
              Extrait
            </span>
            <span className="text-[8.5px] sm:text-[9.5px] lg:text-[10px] font-medium text-muted-foreground leading-tight text-center block w-full truncate">
              Parfum
            </span>
          </div>

          <div className="flex flex-col items-center justify-start px-0.5 min-w-0">
            <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0 mb-1" />
            <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-foreground/80 leading-tight text-center block w-full truncate">
              Premium
            </span>
            <span className="text-[8.5px] sm:text-[9.5px] lg:text-[10px] font-medium text-muted-foreground leading-tight text-center block w-full truncate">
              Quality
            </span>
          </div>

          <div className="flex flex-col items-center justify-start px-0.5 min-w-0">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0 mb-1" />
            <span className="text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-foreground/80 leading-tight text-center block w-full truncate">
              Lasting
            </span>
            <span className="text-[8.5px] sm:text-[9.5px] lg:text-[10px] font-medium text-muted-foreground leading-tight text-center block w-full truncate">
              Impressions
            </span>
          </div>

        </div>
      </div>

      {/* 4. Bottom Footer Actions */}
      <div className="p-2.5 sm:p-3 lg:p-4 flex flex-row items-center justify-between gap-2 sm:gap-3 bg-card">

        {/* Size / Volume Pill */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[40px] flex items-center justify-center rounded-full border border-border text-[9.5px] sm:text-[10px] lg:text-xs font-semibold text-card-foreground bg-muted/50 uppercase tracking-wider text-center shrink-0 shadow-2xs font-mono">
          {unitText}
        </div>

        {/* Add To Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 max-w-[200px] px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[40px] rounded-[7px] text-[9.5px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap shadow-sm hover:shadow-md font-mono ${isAdded
            ? "bg-emerald-700 text-white"
            : isOutOfStock
              ? "bg-muted text-muted-foreground/50 border border-border cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>ADDED</span>
            </>
          ) : isOutOfStock ? (
            <>
              <span className="hidden min-[340px]:inline">SOLD OUT</span>
              <span className="inline min-[340px]:hidden">OUT</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden min-[320px]:inline">ADD TO CART</span>
              <span className="inline min-[320px]:hidden">CART</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
}

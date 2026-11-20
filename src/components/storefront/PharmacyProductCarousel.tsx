"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";

interface PharmacyProductCarouselProps {
  title?: string;
  subtitle?: string;
  products: any[];
  settings?: any;
  bannerImage?: string;
  viewAllLink?: string;
  categoryName?: string;
}

export default function PharmacyProductCarousel({
  title = "Catalog",
  subtitle = "Curated health & wellness essentials",
  products = [],
  settings,
  bannerImage,
  viewAllLink = "/collections/all",
  categoryName,
}: PharmacyProductCarouselProps) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, products.length - itemsPerPage);

  const handlePrev = () => {
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setScrollIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="py-6 md:py-10 max-w-[100rem] mx-auto px-4 sm:px-6 md:px-8">
      <div className="glass-card border border-border rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm relative overflow-hidden space-y-6">

        {/* Optional Top Showcase Banner Image */}
        {bannerImage && (
          <div className="w-full relative rounded-2xl md:rounded-3xl overflow-hidden h-48 sm:h-64 md:h-80 border border-border group shadow-sm">
            <img
              src={bannerImage}
              alt={title || "Catalog Banner"}
              decoding="async"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.startsWith('data:')) {
                  target.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400" fill="none"><rect width="800" height="400" fill="#18181b"/></svg>');
                }
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
              {categoryName && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 mb-1">
                  Collection: {categoryName}
                </span>
              )}
              {title && <h3 className="text-2xl md:text-4xl font-serif font-black uppercase tracking-tight text-white">{title}</h3>}
              {subtitle && <p className="text-xs md:text-sm text-white/80 max-w-xl mt-1">{subtitle}</p>}
            </div>
          </div>
        )}

        {/* Banner Header / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-black uppercase tracking-tight text-foreground">
                {title || "Catalog Showcase"}
              </h2>
              {subtitle && !bannerImage && (
                <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-primary hover:text-primary/80 transition-colors font-bold"
              >
                View All <ArrowRight size={14} />
              </Link>
            )}

            {products.length > itemsPerPage && (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={scrollIndex === 0}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Previous Products"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={scrollIndex >= maxIndex}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Next Products"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid / Slider */}
        <div className="w-full">
          {products.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground font-mono text-xs uppercase tracking-widest border border-dashed border-border rounded-2xl">
              No catalog products found.
            </div>
          ) : (
            <div className="overflow-hidden">
              <div
                className="flex gap-4 md:gap-6 transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${scrollIndex * (100 / Math.min(itemsPerPage, products.length))}%)`,
                }}
              >
                {products.map((product) => (
                  <div
                    key={String(product._id)}
                    className="shrink-0 w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-12px)] lg:w-[calc(25%-14px)] flex"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/utils/format";
import ShimmerImage from "@/components/ui/ShimmerImage";

interface ProductGalleryProps {
  images: any[];
  productName: string;
  layout?: string;
  inventory?: number;
}

export default function ProductGallery({ images, productName, inventory = 10 }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeImage = images && images.length > 0 ? images[activeIndex] : null;
  const activeImageUrl = activeImage 
    ? getOptimizedImageUrl(typeof activeImage === 'string' ? activeImage : activeImage.url, 1000)
    : undefined;
  
  const activeImageAlt = activeImage && typeof activeImage === 'object' && activeImage.altText
    ? activeImage.altText
    : productName;

  // Lock body scroll when lightbox is open & handle keyboard shortcuts
  useEffect(() => {
    if (!isLightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        setIsZoomed(false);
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight" && images.length > 1) {
        setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-none border border-border/40 aspect-square bg-muted/30 w-full max-h-[540px]">
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          No Image Provided
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Product Image Container */}
      <div 
        className="relative overflow-hidden bg-muted/20 border border-border/40 rounded-none cursor-pointer group select-none aspect-square w-full max-h-[540px]"
        onClick={() => {
          setIsZoomed(false);
          setIsLightboxOpen(true);
        }}
      >
        {activeImageUrl && (
          <>
            <ShimmerImage 
              src={activeImageUrl} 
              alt={activeImageAlt} 
              fill
              priority
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105" 
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
              <span className="inline-flex items-center gap-2 bg-background/90 text-foreground px-5 py-2.5 rounded-none text-xs font-mono font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl backdrop-blur-md transform group-hover:translate-y-0 translate-y-2 border border-foreground/20">
                <Maximize2 size={14} /> Full Screen View
              </span>
            </div>
          </>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
          {inventory === 0 && (
            <div className="bg-background/90 backdrop-blur-md text-foreground px-3 py-1 text-[9px] font-mono font-bold tracking-[0.2em] uppercase border border-border rounded-none shadow-sm">
              Sold Out
            </div>
          )}
          {inventory > 0 && inventory <= 10 && (
            <div className="bg-foreground text-background px-3 py-1 text-[9px] font-mono font-bold tracking-[0.2em] uppercase border border-foreground rounded-none shadow-sm animate-pulse">
              Only {inventory} Left
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 shrink-0">
          {images.map((img, idx) => {
            const imgUrl = typeof img === 'string' ? img : img.url;
            const imgAlt = (typeof img === 'object' && img.altText) ? img.altText : `${productName} thumbnail ${idx + 1}`;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-square w-16 sm:w-20 shrink-0 rounded-none overflow-hidden border transition-all duration-300 cursor-pointer ${activeIndex === idx ? 'opacity-100 border-foreground ring-2 ring-foreground/20' : 'opacity-60 border-border/40 hover:opacity-100'}`}
                aria-label={`View image ${idx + 1}`}
              >
                <ShimmerImage src={imgUrl} alt={imgAlt} fill className="object-cover" sizes="80px" />
              </button>
            );
          })}
        </div>
      )}
      
      {/* High-End Solid Full-Screen Lightbox Modal (Rendered via React Portal directly into document.body) */}
      {mounted && isLightboxOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex flex-col bg-black text-white select-none overflow-hidden animate-in fade-in duration-300">
          
          {/* Top Control Bar */}
          <div className="flex justify-between items-center px-6 py-4 shrink-0 border-b border-white/10 bg-[#0a0a0a] z-50">
            <div className="text-white/80 font-mono text-xs uppercase tracking-[0.2em]">
              {images.length > 1 ? `${productName} — ${activeIndex + 1} / ${images.length}` : productName}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Zoom toggle */}
              <button 
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2.5 bg-card/10 hover:bg-card/20 text-white rounded-none border border-white/20 transition-colors cursor-pointer"
                title={isZoomed ? "Zoom out" : "Zoom in"}
                aria-label="Toggle zoom"
              >
                {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </button>

              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsLightboxOpen(false);
                  setIsZoomed(false);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-card text-foreground hover:bg-card/90 text-xs font-mono uppercase tracking-widest transition-all cursor-pointer font-bold border border-white"
                aria-label="Close full view"
              >
                <span>Close</span>
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Main Full-Screen Canvas */}
          <div 
            className={`flex-grow relative flex items-center justify-center p-6 md:p-12 min-h-0 bg-[#050505] overflow-auto ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            {/* Previous Arrow */}
            {images.length > 1 && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveIndex(activeIndex === 0 ? images.length - 1 : activeIndex - 1); 
                }}
                className="absolute left-6 p-4 bg-card/10 hover:bg-card/20 text-white rounded-full transition-all hover:scale-110 z-30 cursor-pointer border border-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            
            <img 
              src={activeImageUrl} 
              alt={activeImageAlt} 
              decoding="async"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.startsWith('data:')) {
                  target.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="#18181b"/><g opacity="0.3" transform="translate(250, 250)"><rect x="0" y="0" width="100" height="100" rx="16" stroke="#a1a1aa" stroke-width="6"/><circle cx="35" cy="35" r="10" fill="#a1a1aa"/><path d="M15 80 L45 45 L70 70 L85 55 L90 60" stroke="#a1a1aa" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g></svg>');
                }
              }}
              className={`transition-all duration-300 ${isZoomed ? 'max-w-none w-[160%] md:w-[140%] object-contain shadow-2xl' : 'max-w-full max-h-[85vh] object-contain shadow-2xl'}`} 
            />
            
            {/* Next Arrow */}
            {images.length > 1 && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveIndex(activeIndex === images.length - 1 ? 0 : activeIndex + 1); 
                }}
                className="absolute right-6 p-4 bg-card/10 hover:bg-card/20 text-white rounded-full transition-all hover:scale-110 z-30 cursor-pointer border border-white/20"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
          
          {/* Bottom Thumbnail Strip */}
          {images.length > 1 && (
            <div className="shrink-0 py-4 px-6 overflow-x-auto hide-scrollbar flex justify-center gap-3 border-t border-white/10 bg-[#0a0a0a]">
              {images.map((img, idx) => {
                const imgUrl = typeof img === 'string' ? img : img.url;
                const imgAlt = (typeof img === 'object' && img.altText) ? img.altText : `${productName} thumbnail ${idx + 1}`;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative aspect-square h-16 md:h-20 shrink-0 transition-all duration-300 rounded-none overflow-hidden border cursor-pointer ${activeIndex === idx ? 'opacity-100 border-white ring-2 ring-white/50 scale-105' : 'opacity-40 border-transparent hover:opacity-100'}`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={imgAlt} 
                      decoding="async" 
                      loading="lazy" 
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.startsWith('data:')) {
                          target.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="#27272a"/></svg>');
                        }
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

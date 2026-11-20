"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Award, ArrowLeft } from "lucide-react";

interface Certificate {
  _id: string;
  imageUrl: string;
  description: string;
  isActive: boolean;
}

interface CertificatesWallProps {
  certificates: Certificate[];
  textColor?: string;
  customTextStyle?: React.CSSProperties;
}

export default function CertificatesWall({ certificates, textColor, customTextStyle }: CertificatesWallProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Keyboard Escape listener to close full view modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveIndex(null);
      }
    };
    if (activeIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [activeIndex]);

  if (!certificates || certificates.length === 0) {
    return null;
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex !== null) {
      setActiveIndex((activeIndex + 1) % certificates.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex !== null) {
      setActiveIndex((activeIndex - 1 + certificates.length) % certificates.length);
    }
  };

  return (
    <div className="w-full py-12 md:py-20 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className={`text-2xl md:text-4xl font-serif tracking-tight flex items-center justify-center gap-3 ${!textColor ? 'text-foreground' : ''}`} style={customTextStyle}>
            <Award className="text-primary hidden md:block" size={32} />
            Awards & Certifications
          </h2>
          <p className={`mt-4 text-sm font-mono uppercase tracking-widest ${!textColor ? 'text-muted-foreground' : ''}`} style={textColor ? { color: textColor, opacity: 0.8 } : {}}>
            Recognized for excellence
          </p>
        </div>

        {/* The Wall Grid */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {certificates.map((cert, index) => (
            <button
              key={cert._id}
              onClick={() => setActiveIndex(index)}
              className="group relative flex flex-col items-center w-32 md:w-48 text-center outline-none cursor-pointer"
            >
              <div className="w-full aspect-square rounded-full md:rounded-2xl overflow-hidden bg-muted border-4 border-transparent group-hover:border-primary/20 transition-all duration-300 shadow-sm group-hover:shadow-md mb-4 p-2">
                <div className="w-full h-full relative rounded-full md:rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={cert.imageUrl} 
                    alt={`Certificate ${index + 1}`} 
                    decoding="async"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.startsWith('data:')) {
                        target.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none"><rect width="200" height="200" fill="#27272a"/></svg>');
                      }
                    }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-background/90 text-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                      View
                    </span>
                  </div>
                </div>
              </div>
              <p className={`text-xs md:text-sm font-medium line-clamp-2 transition-colors ${!textColor ? 'text-muted-foreground group-hover:text-foreground' : ''}`} style={textColor ? { color: textColor, opacity: 0.8 } : {}}>
                {cert.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Slider Modal */}
      {activeIndex !== null && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-background/98 backdrop-blur-2xl animate-in fade-in duration-200">
          
          {/* Backdrop Click to Close */}
          <div className="absolute inset-0 z-0" onClick={() => setActiveIndex(null)} />

          {/* Top Control Bar */}
          <div className="relative z-20 p-4 sm:p-6 flex justify-between items-center bg-background/80 border-b border-border/40 backdrop-blur-md">
            <button 
              type="button"
              onClick={() => setActiveIndex(null)}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold rounded-full hover:opacity-90 transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <span className="text-xs font-mono font-bold tracking-widest text-muted-foreground">
              {activeIndex + 1} / {certificates.length}
            </span>

            <button 
              type="button"
              onClick={() => setActiveIndex(null)}
              className="p-2.5 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={22} />
            </button>
          </div>
          
          {/* Main Lightbox Content Area */}
          <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 min-h-0" onClick={() => setActiveIndex(null)}>
            {certificates.length > 1 && (
              <button 
                type="button"
                onClick={handlePrev}
                className="absolute left-3 sm:left-8 p-3 sm:p-5 bg-foreground text-background rounded-full transition-transform hover:scale-110 active:scale-95 z-20 shadow-xl cursor-pointer"
                aria-label="Previous Certificate"
              >
                <ChevronLeft size={24} className="sm:w-8 sm:h-8" />
              </button>
            )}
            
            <div 
              className="w-full max-w-4xl max-h-full flex flex-col items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={certificates[activeIndex].imageUrl} 
                alt="Certificate Full" 
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.startsWith('data:')) {
                    target.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="#18181b"/></svg>');
                  }
                }}
                className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-xl shadow-2xl border border-border/40 bg-card" 
              />
              
              {certificates[activeIndex].description && (
                <div className="mt-4 sm:mt-6 text-center max-w-2xl px-4">
                  <p className="text-sm sm:text-base font-medium leading-relaxed text-foreground">
                    {certificates[activeIndex].description}
                  </p>
                </div>
              )}
            </div>

            {certificates.length > 1 && (
              <button 
                type="button"
                onClick={handleNext}
                className="absolute right-3 sm:right-8 p-3 sm:p-5 bg-foreground text-background rounded-full transition-transform hover:scale-110 active:scale-95 z-20 shadow-xl cursor-pointer"
                aria-label="Next Certificate"
              >
                <ChevronRight size={24} className="sm:w-8 sm:h-8" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails & Close Action Bar */}
          <div className="relative z-20 p-4 border-t border-border/40 bg-background/90 backdrop-blur-md flex flex-col items-center gap-3">
            {certificates.length > 1 && (
              <div className="w-full overflow-x-auto scrollbar-none flex justify-center gap-3 py-1">
                {certificates.map((cert, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative aspect-square h-14 sm:h-16 shrink-0 transition-all duration-200 rounded-lg overflow-hidden border ${activeIndex === idx ? 'ring-2 ring-foreground border-foreground scale-105 opacity-100' : 'opacity-50 hover:opacity-100 border-border'}`}
                  >
                    <img 
                      src={cert.imageUrl} 
                      alt={`Thumbnail ${idx + 1}`} 
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
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="px-6 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold rounded-full shadow-md hover:opacity-90 transition-transform active:scale-95 cursor-pointer"
            >
              Close Full View
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

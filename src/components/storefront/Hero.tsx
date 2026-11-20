"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ShimmerImage from "@/components/ui/ShimmerImage";

export interface HeroSlide {
  _id: string;
  title: string;
  subtitle?: string;
  link?: string;
  buttonText?: string;
  bannerImage?: string;
  bannerVideo?: string;
  // Compatibility with category objects
  name?: string;
  slug?: string;
  metaDescription?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  bannerImage?: string;
  bannerVideo?: string;
  metaDescription?: string;
}

export default function Hero({
  heroBlock,
  categories = [],
  slides: explicitSlides
}: {
  heroBlock?: any;
  categories?: Category[];
  slides?: HeroSlide[];
}) {
  // Determine effective slides:
  // 1. Explicit `slides` prop
  // 2. `heroBlock?.slides`
  // 3. Fallback to `categories`
  const effectiveSlides: HeroSlide[] = (() => {
    if (explicitSlides && explicitSlides.length > 0) {
      return explicitSlides.map((s, idx) => ({
        _id: s._id || `slide-${idx}`,
        title: s.title || s.name || "Luxury Fragrance",
        subtitle: s.subtitle || s.metaDescription || "",
        link: s.link || (s.slug ? `/${s.slug}` : "/collections"),
        buttonText: s.buttonText || "View more",
        bannerImage: s.bannerImage,
        bannerVideo: s.bannerVideo,
      }));
    }
    if (heroBlock?.slides && Array.isArray(heroBlock.slides) && heroBlock.slides.length > 0) {
      return heroBlock.slides.map((s: any, idx: number) => ({
        _id: s._id || `slide-${idx}`,
        title: s.title || s.name || "Luxury Fragrance",
        subtitle: s.subtitle || s.metaDescription || "",
        link: s.link || (s.slug ? `/${s.slug}` : "/collections"),
        buttonText: s.buttonText || "View more",
        bannerImage: s.bannerImage,
        bannerVideo: s.bannerVideo,
      }));
    }
    if (categories && categories.length > 0) {
      return categories.map((cat) => ({
        _id: cat._id,
        title: cat.name,
        subtitle: cat.metaDescription || "",
        link: `/${cat.slug}`,
        buttonText: "View more",
        bannerImage: cat.bannerImage,
        bannerVideo: cat.bannerVideo,
      }));
    }
    return [
      {
        _id: "default-slide-1",
        title: "EXCLUSIVE COLLECTION",
        subtitle: "Luxury artisanal perfumes crafted for confidence, strength, and timeless sophistication.",
        link: "/collections",
        buttonText: "View more",
        bannerImage: "",
        bannerVideo: "https://cdn.pixabay.com/video/2021/08/04/83866-584742540_large.mp4",
      }
    ];
  })();

  const [activeSlideId, setActiveSlideId] = useState<string>(
    effectiveSlides[0]?._id || ""
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const touchStartX = useRef<number | null>(null);

  // Keep activeSlideId in sync if effectiveSlides change
  useEffect(() => {
    if (!effectiveSlides.some(s => s._id === activeSlideId)) {
      if (effectiveSlides.length > 0) {
        setActiveSlideId(effectiveSlides[0]._id);
      }
    }
  }, [effectiveSlides, activeSlideId]);

  const activeSlide = effectiveSlides.find(s => s._id === activeSlideId) || effectiveSlides[0];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Manage video play/pause based on active state to save resources
  useEffect(() => {
    effectiveSlides.forEach(slide => {
      const video = videoRefs.current[slide._id];
      if (video) {
        if (!prefersReducedMotion && activeSlide?._id === slide._id) {
          video.play().catch(e => console.log("Video autoplay blocked:", e));
        } else {
          video.pause();
        }
      }
    });
  }, [activeSlide?._id, effectiveSlides, prefersReducedMotion]);

  // Auto-rotate slides every 4.5 seconds unless paused or user prefers reduced motion
  useEffect(() => {
    if (!effectiveSlides || effectiveSlides.length <= 1 || isPaused || prefersReducedMotion) return;

    const timer = setTimeout(() => {
      const currentIndex = effectiveSlides.findIndex(s => s._id === activeSlide?._id);
      const nextIndex = (currentIndex + 1) % effectiveSlides.length;
      setActiveSlideId(effectiveSlides[nextIndex]._id);
    }, 4500);

    return () => clearTimeout(timer);
  }, [activeSlide?._id, effectiveSlides, isPaused, prefersReducedMotion]);

  const handleMouseEnter = (slide: HeroSlide) => {
    setActiveSlideId(slide._id);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    if (Math.abs(diffX) > 40 && effectiveSlides.length > 1) {
      const currentIndex = effectiveSlides.findIndex(s => s._id === activeSlide?._id);
      if (diffX > 0) {
        // Swiped left -> next slide
        const nextIndex = (currentIndex + 1) % effectiveSlides.length;
        setActiveSlideId(effectiveSlides[nextIndex]._id);
      } else {
        // Swiped right -> prev slide
        const prevIndex = (currentIndex - 1 + effectiveSlides.length) % effectiveSlides.length;
        setActiveSlideId(effectiveSlides[prevIndex]._id);
      }
    }
    touchStartX.current = null;
  };

  const fallbackVideoUrl = "https://cdn.pixabay.com/video/2021/08/04/83866-584742540_large.mp4";

  return (
    <section
      className="relative w-full h-[68vh] sm:h-[72vh] md:h-[78vh] lg:h-[750px] xl:h-[800px] min-h-[500px] lg:min-h-[720px] max-h-[660px] lg:max-h-[900px] flex items-end justify-start overflow-hidden bg-background"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Media Layers */}
      <div className="absolute inset-0 z-0 bg-background">
        {/* Render fallback if active slide has no video or image */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${(!activeSlide?.bannerVideo && !activeSlide?.bannerImage) ? 'opacity-100' : 'opacity-0'}`}>
          {!activeSlide?.bannerVideo && !activeSlide?.bannerImage && <video
            aria-hidden="true"
            src={fallbackVideoUrl}
            autoPlay={!prefersReducedMotion}
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />}
        </div>

        {effectiveSlides.map((slide, idx) => {
          const isActive = activeSlide?._id === slide._id;
          const hasVideo = !!slide.bannerVideo;
          const hasImage = !!slide.bannerImage;

          return (
            <div
              key={slide._id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
              style={{ pointerEvents: isActive ? 'auto' : 'none' }}
            >
              {hasVideo && isActive && (
                <video
                  ref={(el) => { videoRefs.current[slide._id] = el; }}
                  aria-hidden="true"
                  src={slide.bannerVideo}
                  loop
                  muted
                  playsInline
                  poster={slide.bannerImage}
                  preload="auto"
                  className={`w-full h-full object-cover ${hasImage ? 'hidden md:block' : 'block'}`}
                />
              )}
              {hasImage && (
                <ShimmerImage
                  src={slide.bannerImage!}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  loading={idx === 0 ? "eager" : "lazy"}
                  className={`object-cover ${hasVideo ? 'md:hidden block' : 'block'}`}
                  sizes="100vw"
                />
              )}
              {!hasVideo && !hasImage && (
                <div className="w-full h-full bg-background" />
              )}
            </div>
          );
        })}

        {/* Subtle dark gradient overlay across the bottom third for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/90 via-[#141210]/40 to-transparent pointer-events-none" />
      </div>

      {/* Foreground Content - Bottom Left Aligned */}
      <div className="relative z-10 w-full max-w-[100rem] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pb-5 sm:pb-8 md:pb-10 pointer-events-none">

        {/* MOBILE PHONE VIEW (Shows ONLY the single active slide title & description for clean UX) */}
        {activeSlide && (
          <div className="block sm:hidden w-full pointer-events-auto transition-all duration-500">
            <div className="flex flex-col items-start w-full pr-4">
              <h2 className="font-serif uppercase tracking-[0.1em] text-3xl leading-[1.1] text-[#F4F1EA] drop-shadow-md">
                {activeSlide.title}
              </h2>
              {activeSlide.subtitle && (
                <p className="font-sans text-sm sm:text-[15px] font-normal tracking-normal text-[#F4F1EA]/95 mt-2 max-w-sm line-clamp-3 leading-relaxed drop-shadow-sm">
                  {activeSlide.subtitle}
                </p>
              )}
              <Link
                href={activeSlide.link || "/collections"}
                className="inline-flex items-center gap-2 font-sans text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-[#F4F1EA] mt-3 border-b border-[#F4F1EA] pb-0.5"
              >
                {activeSlide.buttonText || "View more"} <ArrowRight size={14} className="opacity-80" />
              </Link>
            </div>
          </div>
        )}

        {/* DESKTOP & TABLET VIEW (Side-by-side slides list for larger screens) */}
        <div
          className="hidden sm:flex flex-row items-start gap-x-6 md:gap-x-12 w-full overflow-x-auto pb-2 pointer-events-auto snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
            .overflow-x-auto::-webkit-scrollbar { display: none; }
          `}} />
          {effectiveSlides.map((slide) => {
            const isActive = activeSlide?._id === slide._id;

            return (
              <div
                key={slide._id}
                className="group flex flex-col items-start shrink-0 snap-start min-w-0"
                onMouseEnter={() => handleMouseEnter(slide)}
              >
                <button
                  type="button"
                  onClick={() => handleMouseEnter(slide)}
                  className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-white rounded text-left cursor-pointer"
                >
                  <h2 className={`font-serif uppercase tracking-[0.1em] text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-4xl leading-[1.1] transition-colors duration-500 ${isActive ? 'text-[#F4F1EA]' : 'text-[#F4F1EA]/40 group-hover:text-[#F4F1EA]/70'}`}>
                    {slide.title}
                  </h2>
                </button>

                {/* Tagline & View More link */}
                <div className="flex flex-col gap-2 py-1 mt-2">
                  {slide.subtitle && (
                    <p className={`font-sans text-[13px] sm:text-sm md:text-[15px] font-normal tracking-normal sm:max-w-sm md:max-w-md lg:max-w-lg whitespace-normal line-clamp-3 text-wrap transition-colors duration-500 ${isActive ? 'text-[#F4F1EA]/95' : 'text-[#F4F1EA]/50 group-hover:text-[#F4F1EA]/80'}`}>
                      {slide.subtitle}
                    </p>
                  )}

                  <Link
                    href={slide.link || "/collections"}
                    className={`inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.15em] relative w-fit after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[1px] after:bg-background after:origin-bottom-right after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 transition-colors duration-500 ${isActive ? 'text-[#F4F1EA]' : 'text-[#F4F1EA]/50 group-hover:text-[#F4F1EA]/80'}`}
                  >
                    {slide.buttonText || "View more"} <ArrowRight size={14} className="opacity-80" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Slide Progress Indicator Bars (Le Labo style) */}
        {effectiveSlides.length > 1 && (
          <div className="flex items-center gap-2 mt-4 pointer-events-auto">
            {effectiveSlides.map((slide, idx) => {
              const isActive = activeSlide?._id === slide._id;
              return (
                <button
                  key={slide._id}
                  onClick={() => setActiveSlideId(slide._id)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-0.5 rounded-full transition-all duration-500 cursor-pointer ${isActive
                      ? "w-8 md:w-12 bg-[#F4F1EA] shadow-sm"
                      : "w-4 md:w-6 bg-[#F4F1EA]/30 hover:bg-[#F4F1EA]/60"
                    }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

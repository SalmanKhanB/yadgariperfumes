"use client";

import { ChevronLeft, ChevronRight, Star, Check, Info, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import ShimmerImage from "@/components/ui/ShimmerImage";

// Google 4-Color Wordmark Logo Component (Official Vector)
function GoogleWordmark({ className = "h-7 sm:h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 74 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.24 10.87v2.44h5.88c-.23 1.54-1.78 4.51-5.88 4.51-3.54 0-6.42-2.93-6.42-6.54s2.88-6.54 6.42-6.54c2.02 0 3.37.86 4.14 1.6l1.93-1.86C14.07 3.25 11.89 2.37 9.24 2.37 4.13 2.37 0 6.5 0 11.61s4.13 9.24 9.24 9.24c5.34 0 8.88-3.75 8.88-9.04 0-.61-.07-1.07-.15-1.54H9.24z" fill="#4285F4"/>
      <path d="M24.48 11.61c0-3.32-2.52-5.74-5.69-5.74s-5.69 2.42-5.69 5.74c0 3.29 2.52 5.74 5.69 5.74s5.69-2.45 5.69-5.74zm-2.49 0c0 2.02-1.39 3.44-3.2 3.44s-3.2-1.42-3.2-3.44c0-2.05 1.39-3.44 3.2-3.44s3.2 1.39 3.2 3.44z" fill="#EA4335"/>
      <path d="M37.1 11.61c0-3.32-2.52-5.74-5.69-5.74s-5.69 2.42-5.69 5.74c0 3.29 2.52 5.74 5.69 5.74s5.69-2.45 5.69-5.74zm-2.49 0c0 2.02-1.39 3.44-3.2 3.44s-3.2-1.42-3.2-3.44c0-2.05 1.39-3.44 3.2-3.44s3.2 1.39 3.2 3.44z" fill="#FBBC05"/>
      <path d="M48.86 6.19h-2.37v1.89h-.08c-.46-.72-1.63-1.44-3.32-1.44-3.47 0-6.42 3.03-6.42 6.97 0 3.91 2.95 6.94 6.42 6.94 1.69 0 2.86-.72 3.32-1.47h.08v.92c0 2.65-1.41 4.07-3.69 4.07-1.86 0-3.01-1.33-3.49-2.46l-2.18.91c.63 1.51 2.29 3.86 5.67 3.86 3.29 0 6.07-1.94 6.07-7.23V6.19zm-5.46 9.17c-1.81 0-3.2-1.47-3.2-3.47s1.39-3.47 3.2-3.47c1.78 0 3.2 1.47 3.2 3.5 0 1.97-1.42 3.44-3.2 3.44z" fill="#4285F4"/>
      <path d="M53.19 2.37h-2.49v18.48h2.49V2.37z" fill="#34A853"/>
      <path d="M62.9 14.66c-1.36 0-2.34-.62-2.97-1.85l8.18-3.39-.27-.68c-.51-1.39-2.07-3.99-5.24-3.99-3.14 0-5.75 2.47-5.75 5.74 0 3.2 2.58 5.74 5.99 5.74 2.75 0 4.34-1.68 5.01-2.67l-2.02-1.35c-.68.99-1.6 1.45-2.93 1.45zm-.19-6.66c1.08 0 2 .54 2.31 1.31l-5.52 2.29c0-2.44 1.74-3.6 3.21-3.6z" fill="#EA4335"/>
    </svg>
  );
}

// Google 'G' Icon Component (Official Vector)
function GoogleGIcon({ className = "w-5 h-5 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
    </svg>
  );
}

const DEFAULT_GOOGLE_REVIEWS = [
  {
    _id: "g-review-1",
    authorName: "agha umar",
    timeAgo: "10 months ago",
    content: "Best perfume fragrances at budget friendly cost highly recommended 👌 all yadgari perfumes fragrance are pure, long lasting and distinctively captivating.",
    rating: 5,
    avatarImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    initials: "AU"
  },
  {
    _id: "g-review-2",
    authorName: "usama sherazi",
    timeAgo: "10 months ago",
    content: "Warm. Comforting, relaxing natural and clean smelling. The best way i can describe it is think of a girly perfume that radiates sophistication.",
    rating: 5,
    avatarImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    initials: "US"
  },
  {
    _id: "g-review-3",
    authorName: "Sheri Khan Official",
    timeAgo: "10 months ago",
    content: "The Perfume Yadgari is Amazing and also staff was nice with greeting welcome..... Thanks Samad we pray for your continued success!",
    rating: 5,
    avatarImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    initials: "SK"
  },
  {
    _id: "g-review-4",
    authorName: "Muhammad Ali",
    timeAgo: "7 months ago",
    content: "Exceptional fragrance collection! The projection and longevity are unmatched. Highly recommended to everyone seeking top luxury scents.",
    rating: 5,
    avatarImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80",
    initials: "MA"
  },
  {
    _id: "g-review-5",
    authorName: "Zainab Raza",
    timeAgo: "5 months ago",
    content: "Truly delightful scents with elegant packaging. The customer support team was also super polite and helpful throughout the order process.",
    rating: 5,
    avatarImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    initials: "ZR"
  },
  {
    _id: "g-review-6",
    authorName: "Tariq Jameel",
    timeAgo: "4 months ago",
    content: "Bought Kumrat Valley Extrait de Parfum and Spicy Wood. Absolutely stunning notes, rich sillage and gets compliments everywhere!",
    rating: 5,
    avatarImage: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
    initials: "TJ"
  },
  {
    _id: "g-review-7",
    authorName: "Fatima Al-Maktoum",
    timeAgo: "3 months ago",
    content: "Fast delivery in Dubai! Smells identical to high end luxury niche perfumery at a fraction of the cost. Will order again for sure.",
    rating: 5,
    avatarImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    initials: "FA"
  },
  {
    _id: "g-review-8",
    authorName: "Bilal Hassan",
    timeAgo: "2 months ago",
    content: "Long lasting sillage for 12+ hours. Great atomizers and premium bottle feel. Yadgari Perfumes is a masterpiece brand.",
    rating: 5,
    avatarImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
    initials: "BH"
  },
  {
    _id: "g-review-9",
    authorName: "Omar Al-Mansoori",
    timeAgo: "1 month ago",
    content: "Outstanding customer service and authentic perfumes. Every note unfolds beautifully over hours.",
    rating: 5,
    avatarImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
    initials: "OM"
  },
  {
    _id: "g-review-10",
    authorName: "Ayesha Siddiqui",
    timeAgo: "2 weeks ago",
    content: "Got this as a gift for my husband and he loved it! High-end packaging and amazing fragrance performance.",
    rating: 5,
    avatarImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80",
    initials: "AS"
  }
];

function getTimeAgo(date: Date) {
  if (isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diffInMonths = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
  if (diffInMonths <= 0) return "Recently";
  if (diffInMonths === 1) return "1 month ago";
  return `${diffInMonths} months ago`;
}

export default function TestimonialSlider({ testimonials }: { testimonials?: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeReviewModal, setActiveReviewModal] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveReviewModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (activeReviewModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeReviewModal]);

  const userReviews = (testimonials && testimonials.length > 0)
    ? testimonials.map((t, idx) => ({
        _id: String(t._id || `t-${idx}`),
        authorName: t.authorName || t.name || "Customer",
        timeAgo: t.role || (t.createdAt ? getTimeAgo(new Date(t.createdAt)) : "Recently"),
        content: t.content || t.review || "",
        rating: Number(t.rating || t.stars || 5),
        avatarImage: t.avatarImage || t.avatar || "",
        initials: (t.authorName || t.name || "C")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      }))
    : [];

  const allReviews = userReviews.length >= 3
    ? userReviews
    : [...userReviews, ...DEFAULT_GOOGLE_REVIEWS.filter(g => !userReviews.some(u => u.authorName.toLowerCase() === g.authorName.toLowerCase()))];

  const displayReviews = allReviews.slice(0, visibleCount);
  const hasMore = visibleCount < allReviews.length;

  const totalReviewsCount = 59 + (testimonials ? testimonials.length : 0);

  // Lazy loading pagination trigger on horizontal scroll
  const handleScroll = () => {
    if (!scrollRef.current || isLoadingMore || !hasMore) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 120) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((prev) => Math.min(allReviews.length, prev + 3));
        setIsLoadingMore(false);
      }, 400);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 200 && hasMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(allReviews.length, prev + 3));
          setIsLoadingMore(false);
          if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
          }
        }, 300);
      } else {
        scrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="w-full py-4 sm:py-6">
      <div className="relative max-w-7xl mx-auto bg-muted/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-border/80 shadow-sm">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-5 lg:gap-8">
          
          {/* Left Rating Summary Column */}
          <div className="w-full lg:w-64 shrink-0 flex flex-col items-center justify-center text-center pb-4 lg:pb-0 lg:py-4 px-2 border-b lg:border-b-0 lg:border-r border-border">
            <h3 className="text-xl sm:text-2xl font-black tracking-wider text-foreground uppercase">
              EXCELLENT
            </h3>

            {/* 5 Gold Stars */}
            <div className="flex gap-1 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={22}
                  className="fill-[#fbbc05] text-[#fbbc05]"
                />
              ))}
            </div>

            {/* Total Reviews Count */}
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
              Based on <span className="font-bold text-foreground">{totalReviewsCount} reviews</span>
            </p>

            {/* Google Wordmark Logo */}
            <div className="mt-2.5 flex items-center justify-center">
              <GoogleWordmark className="h-6 sm:h-7" />
            </div>
          </div>

          {/* Right Reviews Carousel Column */}
          <div className="relative w-full min-w-0 flex-1">
            
            {/* Desktop Left Nav Button */}
            <button
              type="button"
              onClick={scrollLeft}
              className="hidden sm:flex absolute -left-3 lg:left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background text-foreground border border-border shadow-md items-center justify-center hover:bg-muted transition-all cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>

            {/* Desktop Right Nav Button */}
            <button
              type="button"
              onClick={scrollRight}
              className="hidden sm:flex absolute -right-3 lg:right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background text-foreground border border-border shadow-md items-center justify-center hover:bg-muted transition-all cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>

            {/* Review Cards Track */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-3.5 sm:gap-5 py-1 px-1 sm:px-12 hide-scrollbar scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {displayReviews.map((rev) => (
                <div
                  key={rev._id}
                  className="w-[82vw] max-w-[320px] sm:w-[310px] md:w-[330px] shrink-0 snap-center sm:snap-start bg-card text-card-foreground border border-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md hover:border-accent/40 cursor-pointer"
                  onClick={() => setActiveReviewModal(rev)}
                >
                  <div>
                    {/* Card Header Row */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {rev.avatarImage ? (
                          <ShimmerImage
                            src={rev.avatarImage}
                            alt={rev.authorName}
                            width={38}
                            height={38}
                            useStandardImg
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0 border border-border"
                          />
                        ) : (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted text-foreground font-mono font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-border">
                            {rev.initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground truncate tracking-tight">
                            {rev.authorName}
                          </h4>
                          <p className="font-mono text-[11px] text-muted-foreground font-normal">
                            {rev.timeAgo}
                          </p>
                        </div>
                      </div>

                      {/* Google 'G' Icon */}
                      <GoogleGIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                    </div>

                    {/* Stars & Blue Verified Badge */}
                    <div className="flex items-center gap-1 mt-2.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < rev.rating
                                ? "fill-[#fbbc05] text-[#fbbc05]"
                                : "fill-muted text-muted-foreground/30"
                            }
                          />
                        ))}
                      </div>

                      {/* Blue Verified Checkmark Badge */}
                      <div
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 ml-1"
                        title="Verified Customer"
                      >
                        <Check size={9} strokeWidth={3.5} />
                      </div>
                    </div>

                    {/* Review Text Body */}
                    <p className="font-mono text-xs sm:text-sm text-foreground/90 leading-relaxed mt-2.5 font-normal line-clamp-3">
                      {rev.content}
                    </p>
                  </div>

                  {/* Read More button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReviewModal(rev);
                    }}
                    className="font-mono text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer transition-colors mt-3 text-left w-fit"
                  >
                    Read more
                  </button>
                </div>
              ))}
            </div>

            {/* Mobile Controls & Trustindex Badge Bar */}
            <div className="flex sm:hidden items-center justify-between mt-3 pt-2.5 border-t border-border/50">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={scrollLeft}
                  className="w-8 h-8 rounded-full bg-background text-foreground border border-border shadow-xs flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  aria-label="Previous review"
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={scrollRight}
                  className="w-8 h-8 rounded-full bg-background text-foreground border border-border shadow-xs flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  aria-label="Next review"
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1b5e39] text-white text-[11px] font-mono font-semibold rounded-md shadow-xs">
                <span>Verified by Trustindex</span>
                <Info size={12} className="shrink-0 opacity-90" />
              </div>
            </div>

          </div>
        </div>

        {/* Desktop Bottom Right Verified Badge */}
        <div className="hidden sm:flex justify-end mt-4 sm:mt-6 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1b5e39] hover:bg-[#14492c] text-white text-xs font-mono font-semibold rounded-md shadow-xs transition-colors cursor-pointer">
            <span>Verified by Trustindex</span>
            <Info size={13} className="shrink-0 opacity-90" />
          </div>
        </div>

      </div>

      {/* Review Details Modal / Dialog Popup */}
      {activeReviewModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveReviewModal(null)}
        >
          <div 
            className="w-full max-w-lg bg-card text-card-foreground border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveReviewModal(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer border border-border"
              aria-label="Close review dialog"
            >
              <X size={18} />
            </button>

            {/* Dialog Header */}
            <div className="flex items-center gap-4 pr-8">
              {activeReviewModal.avatarImage ? (
                <ShimmerImage
                  src={activeReviewModal.avatarImage}
                  alt={activeReviewModal.authorName}
                  width={48}
                  height={48}
                  useStandardImg
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted text-foreground font-mono font-bold text-base flex items-center justify-center shrink-0 border border-border">
                  {activeReviewModal.initials}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-mono font-bold text-base sm:text-lg text-foreground truncate tracking-tight">
                    {activeReviewModal.authorName}
                  </h3>
                  <GoogleGIcon className="w-5 h-5 shrink-0" />
                </div>
                <p className="font-mono text-xs text-muted-foreground font-normal">
                  {activeReviewModal.timeAgo}
                </p>
              </div>
            </div>

            {/* Rating & Verified Badge */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < activeReviewModal.rating
                        ? "fill-[#fbbc05] text-[#fbbc05]"
                        : "fill-muted text-muted-foreground/30"
                    }
                  />
                ))}
              </div>
              <div
                className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 ml-1"
                title="Verified Customer"
              >
                <Check size={10} strokeWidth={3.5} />
              </div>
              <span className="font-mono text-xs text-muted-foreground font-medium">
                Verified Google Review
              </span>
            </div>

            {/* Full Review Content */}
            <div className="my-6 max-h-[50vh] overflow-y-auto pr-2">
              <p className="font-mono text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                {activeReviewModal.content}
              </p>
            </div>

            {/* Dialog Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1b5e39] text-white text-xs font-mono font-semibold rounded-md">
                <span>Verified by Trustindex</span>
                <Info size={12} className="shrink-0 opacity-90" />
              </div>
              <button
                onClick={() => setActiveReviewModal(null)}
                className="px-4 py-2 text-xs font-mono font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



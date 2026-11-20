"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { submitReviewAction } from "@/server/actions/reviewActions";
import { IReview } from "@/server/db/models/Review";
import { Star, ChevronLeft, ChevronRight, X, MessageSquarePlus } from "lucide-react";
import { createPortal } from "react-dom";

interface ProductReviewsProps {
  productId: string;
  initialReviews: IReview[];
  isLoggedIn?: boolean;
  userEmail?: string;
  userName?: string;
}

export default function ProductReviews({ productId, initialReviews, isLoggedIn, userEmail, userName }: ProductReviewsProps) {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      authorName: userName || "",
      authorEmail: userEmail || "",
      rating: 5,
      body: ""
    }
  });

  const rating = watch("rating");

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
      }
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    const res = await submitReviewAction({
      productId: productId as any,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      rating: Number(data.rating),
      body: data.body,
    });
    setSaving(false);
    if (res.success) {
      setSubmitted(true);
      reset();
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
      }, 3000);
    } else {
      alert("Failed to submit review.");
    }
  };

  return (
    <div className="w-full bg-background py-16 md:py-24 border-y border-border">
      <h2 className="text-2xl lg:text-4xl font-serif tracking-tight mb-16 text-center text-foreground uppercase">
        Customer Reviews
      </h2>

      {/* Reviews Slider */}
      <div className="relative max-w-[100rem] mx-auto w-full">
        {initialReviews.length === 0 ? (
          <p className="text-muted-foreground italic text-center font-serif text-lg py-12">No reviews yet. Be the first to share your experience!</p>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-6 sm:gap-8 px-4 sm:px-6 hide-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {initialReviews.map((review, i) => (
                <div
                  key={i}
                  className="w-[85vw] sm:w-[80vw] md:w-[350px] shrink-0 snap-center flex flex-col justify-center items-center text-center space-y-4"
                >
                  <div className="w-8 h-[1px] bg-accent" />

                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        fill={star <= review.rating ? "currentColor" : "none"}
                        className={star <= review.rating ? "text-accent" : "text-muted-foreground/30"}
                      />
                    ))}
                  </div>

                  <p className="text-lg md:text-xl font-serif italic text-foreground leading-relaxed">
                    "{review.body}"
                  </p>

                  <div className="flex flex-col items-center gap-1 pt-1">
                    <h4 className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-foreground">
                      {review.authorName || "Anonymous"}
                    </h4>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground" suppressHydrationWarning>
                      {new Date(review.createdAt!).toLocaleDateString('en-US')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {initialReviews.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 px-4 sm:px-6">
                <button
                  onClick={scrollLeft}
                  className="w-10 h-10 flex items-center justify-center border border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-all cursor-pointer disabled:opacity-30"
                  aria-label="Previous review"
                >
                  <ChevronLeft size={20} strokeWidth={1.5} />
                </button>
                <button
                  onClick={scrollRight}
                  className="w-10 h-10 flex items-center justify-center border border-foreground/20 text-foreground hover:bg-foreground hover:text-background transition-all cursor-pointer disabled:opacity-30"
                  aria-label="Next review"
                >
                  <ChevronRight size={20} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-center mt-12 mb-8 relative z-20">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-foreground hover:bg-foreground/90 text-background px-8 py-3 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors"
        >
          <MessageSquarePlus size={16} strokeWidth={1} /> Share Your Experience
        </button>
      </div>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-background border border-border/50 p-6 md:p-10 w-full max-w-xl relative animate-in fade-in zoom-in duration-300 my-auto shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-foreground hover:opacity-60 transition-opacity"
              aria-label="Close form"
            >
              <X size={24} strokeWidth={1} />
            </button>

            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <h3 className="text-2xl font-serif text-foreground">Thank You.</h3>
                <p className="text-foreground/70 font-sans text-sm">Your review has been submitted.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-serif mb-2 text-foreground tracking-tight">Share Your Experience</h3>
                <p className="text-foreground/70 mb-8 font-sans text-sm">Tell us what you loved about this product.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-foreground mb-2">Rating</label>
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setValue("rating", star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            size={20}
                            strokeWidth={1}
                            fill={star <= rating ? "#A98F5C" : "none"}
                            className={star <= rating ? "text-[#A98F5C]" : "text-foreground/30"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-foreground mb-2">Your Name *</label>
                      <input
                        {...register("authorName", { required: "Name is required" })}
                        className={`w-full bg-transparent border-b p-2 px-0 text-sm focus:outline-none rounded-none transition-colors ${errors.authorName ? 'border-red-500' : 'border-foreground/20 focus:border-foreground'}`}
                        placeholder="John Doe"
                        readOnly={!!userName}
                      />
                      {errors.authorName && <p className="text-red-500 text-[10px] font-mono mt-2">⚠ {errors.authorName.message as string}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-foreground mb-2">Your Email *</label>
                      <input
                        type="email"
                        {...register("authorEmail", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                        className={`w-full bg-transparent border-b p-2 px-0 text-sm focus:outline-none rounded-none transition-colors ${errors.authorEmail ? 'border-red-500' : 'border-foreground/20 focus:border-foreground'}`}
                        placeholder="john@example.com"
                        readOnly={!!userEmail}
                      />
                      {errors.authorEmail && <p className="text-red-500 text-[10px] font-mono mt-2">⚠ {errors.authorEmail.message as string}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-foreground mt-4 mb-2">Your Review *</label>
                    <textarea
                      {...register("body", { required: "Review text is required", minLength: { value: 10, message: "Review must be at least 10 characters long" } })}
                      className={`w-full bg-transparent border-b p-2 px-0 text-sm focus:outline-none rounded-none transition-colors h-24 resize-none ${errors.body ? 'border-red-500' : 'border-foreground/20 focus:border-foreground'}`}
                      placeholder="What did you like or dislike?"
                    />
                    {errors.body && <p className="text-red-500 text-[10px] font-mono mt-2">⚠ {errors.body.message as string}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full mt-6 bg-foreground hover:bg-foreground/90 text-background px-8 py-4 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

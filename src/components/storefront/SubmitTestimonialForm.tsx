"use client";

import { useState, useEffect } from "react";
import { submitPublicTestimonialAction } from "@/server/actions/testimonialActions";
import { Star, X, MessageSquarePlus, UserCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { createPortal } from "react-dom";

interface ITestimonialForm {
  authorName: string;
  role: string;
  content: string;
  rating: number;
  avatarImage: string;
}

export default function SubmitTestimonialForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ITestimonialForm>({
    defaultValues: {
      authorName: "",
      role: "",
      content: "",
      rating: 5,
      avatarImage: "",
    }
  });

  const rating = watch("rating");
  const watchAvatar = watch("avatarImage");

  const onSubmit = async (data: ITestimonialForm) => {
    setIsSubmitting(true);
    const res = await submitPublicTestimonialAction(data);
    setIsSubmitting(false);
    
    if (res.success) {
      setSuccess(true);
      reset();
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 3000);
    } else {
      alert("Failed to submit: " + res.error);
    }
  };

  return (
    <>
      <div className="flex justify-center mt-12 mb-8 relative z-20">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-foreground hover:bg-foreground/90 text-background px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors cursor-pointer border border-foreground"
        >
          <MessageSquarePlus size={16} strokeWidth={1} /> Share Your Experience
        </button>
      </div>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-background border border-border/50 p-6 md:p-10 w-full max-w-xl relative animate-in fade-in zoom-in duration-300 my-auto">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-foreground hover:opacity-60 transition-opacity"
              aria-label="Close form"
            >
              <X size={24} strokeWidth={1} />
            </button>

            {success ? (
              <div className="text-center py-12 space-y-4">
                <h3 className="text-2xl font-serif text-foreground">Thank You.</h3>
                <p className="text-foreground/70 font-sans text-sm">Your review has been submitted.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-serif mb-2 text-foreground tracking-tight">Share Your Experience</h3>
                <p className="text-foreground/70 mb-8 font-sans text-sm">Tell us what you loved about our brand.</p>

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

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-foreground mb-2">Your Name *</label>
                    <input 
                      {...register("authorName", { required: "Name is required" })}
                      className={`w-full bg-transparent border-b p-2 px-0 text-sm focus:outline-none rounded-none transition-colors ${
                        errors.authorName 
                          ? 'border-red-500' 
                          : 'border-foreground/20 focus:border-foreground'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.authorName && <p className="text-red-500 text-[10px] font-mono mt-2">⚠ {errors.authorName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-foreground mt-4 mb-2">Title / Role</label>
                    <input 
                      {...register("role")}
                      className="w-full bg-transparent border-b border-foreground/20 focus:border-foreground rounded-none p-2 px-0 text-sm outline-none transition-colors"
                      placeholder="e.g. Verified Buyer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-2">
                      <UserCircle2 size={14} /> Profile Picture (Optional)
                    </label>
                    <div className="bg-muted/30 border border-border rounded-lg p-2">
                      <ImageUploader 
                        images={watchAvatar ? [watchAvatar] : []}
                        onChange={(urls) => setValue("avatarImage", urls[0] || "", { shouldValidate: true })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-foreground mt-4 mb-2 flex justify-between">
                      <span>Your Review *</span>
                      <span className="opacity-50">Max 100 chars</span>
                    </label>
                    <textarea 
                      {...register("content", { 
                        required: "Review content is required",
                        maxLength: {
                          value: 100,
                          message: "Review cannot exceed 100 characters"
                        }
                      })}
                      rows={3}
                      maxLength={100}
                      className={`w-full bg-transparent border rounded-none p-3 text-sm focus:outline-none transition-colors resize-none ${
                        errors.content 
                          ? 'border-red-500' 
                          : 'border-foreground/20 focus:border-foreground'
                      }`}
                      placeholder="Write your experience here..."
                    />
                    {errors.content && <p className="text-red-500 text-[10px] font-mono mt-2">⚠ {errors.content.message}</p>}
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-foreground text-background font-mono text-[11px] uppercase tracking-[0.15em] py-4 hover:bg-foreground/90 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

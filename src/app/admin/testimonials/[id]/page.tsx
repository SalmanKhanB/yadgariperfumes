"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { fetchTestimonialByIdAction, createTestimonialAction, updateTestimonialAction } from "@/server/actions/testimonialActions";
import { ArrowLeft, Save, Star } from "lucide-react";
import Link from "next/link";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface ITestimonialInput {
  authorName: string;
  role: string;
  content: string;
  avatarImage: string;
  rating: number;
  isActive: boolean;
  order: number;
}

export default function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ITestimonialInput>({
    defaultValues: {
      authorName: "",
      role: "",
      content: "",
      avatarImage: "",
      rating: 5,
      isActive: true,
      order: 0
    }
  });

  const watchAvatar = watch("avatarImage");

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    
    async function load() {
      if (resolvedParams!.id === "new") {
        setLoading(false);
        return;
      }
      
      const res = await fetchTestimonialByIdAction(resolvedParams!.id);
      if (res.success && res.data) {
        reset({
          authorName: res.data.authorName,
          role: res.data.role || "",
          content: res.data.content,
          avatarImage: res.data.avatarImage || "",
          rating: res.data.rating,
          isActive: res.data.isActive,
          order: res.data.order
        });
      } else {
        alert("Testimonial not found");
        router.push("/admin/testimonials");
      }
      setLoading(false);
    }
    load();
  }, [resolvedParams, reset, router]);

  const onSubmit = async (data: ITestimonialInput) => {
    if (!resolvedParams) return;
    setSaving(true);
    let res;
    if (resolvedParams.id === "new") {
      res = await createTestimonialAction(data);
    } else {
      res = await updateTestimonialAction(resolvedParams.id, data);
    }
    setSaving(false);

    if (res.success) {
      router.push("/admin/testimonials");
    } else {
      alert("Error saving testimonial: " + res.error);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  const isNew = resolvedParams?.id === "new";

  return (
    <div className="space-y-6 max-w-4xl pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin/testimonials" className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{isNew ? "Add Testimonial" : "Edit Testimonial"}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Author Name <span className="text-red-500">*</span></label>
              <input 
                {...register("authorName", { required: "Name is required" })}
                className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              />
              {errors.authorName && <span className="text-red-500 text-sm mt-1">{errors.authorName.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Role / Company (Optional)</label>
              <input 
                {...register("role")}
                placeholder="e.g. CEO of Company"
                className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Rating (1-5)</label>
              <input 
                type="number"
                min="1" max="5"
                {...register("rating", { valueAsNumber: true, min: 1, max: 5 })}
                className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              />
            </div>

            <div className="flex gap-6 pt-4 border-t border-border mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register("isActive")} className="w-5 h-5 accent-primary rounded cursor-pointer" />
                <span className="font-semibold">Active (Show on Storefront)</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">Avatar Image (Upload or Paste Image URL)</label>
              <ImageUploader 
                images={watchAvatar ? [watchAvatar] : []}
                onChange={(urls) => setValue("avatarImage", urls[0] || "", { shouldValidate: true })}
              />
              <div className="pt-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">
                  Or Paste Direct Image URL:
                </span>
                <input 
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={watchAvatar || ""}
                  onChange={(e) => setValue("avatarImage", e.target.value, { shouldValidate: true })}
                  className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Display Order</label>
              <input 
                type="number"
                {...register("order", { valueAsNumber: true })}
                className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <label className="block text-sm font-semibold mb-2 text-foreground">Testimonial Content <span className="text-red-500">*</span></label>
          <textarea 
            {...register("content", { required: "Content is required" })}
            rows={5}
            className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
          />
          {errors.content && <span className="text-red-500 text-sm mt-1">{errors.content.message}</span>}
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-primary text-primary-foreground px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? "Saving..." : "Save Testimonial"}
          </button>
        </div>
      </form>
    </div>
  );
}

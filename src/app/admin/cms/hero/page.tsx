"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { fetchHeroBlockAction, updateHeroBlockAction } from "@/server/actions/heroActions";
import Hero from "@/components/storefront/Hero";
import { Upload } from "lucide-react";

interface IHeroBlockInput {
  title: string;
  subtitle?: string;
  cta?: {
    text: string;
    link: string;
  };
  background?: string;
  layout?: "neo-glass" | "cyber-glitch" | "fluid-aurora" | "editorial-grid" | "immersive-parallax" | "architectural-brutalism" | "ecommerce-pro" | "split-screen" | "cinematic-full" | "minimal-brutalist" | "floating-product" | "magazine-cover" | "left" | "center" | "right";
  overlayOpacity?: number;
  titleColor?: string;
  subtitleColor?: string;
}

export default function HeroEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm<IHeroBlockInput>();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formValues = watch();

  useEffect(() => {
    async function load() {
      const res = await fetchHeroBlockAction();
      if (res.success) {
        reset({
          ...res.data,
          layout: res.data.layout || "neo-glass",
          overlayOpacity: res.data.overlayOpacity ?? 20,
        });
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setValue("background", data.url, { shouldValidate: true, shouldDirty: true });
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onSubmit = async (data: IHeroBlockInput) => {
    setSaving(true);
    const res = await updateHeroBlockAction(data);
    setSaving(false);
    if (res.success) {
      toast.success("Hero section updated successfully!");
    } else {
      toast.error(res.error || "Failed to update Hero section");
    }
  };

  if (loading) return <div className="p-8 flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Hero Banner</h1>
        <p className="text-muted-foreground">Configure the first impression of your storefront.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Live Preview</h2>
        <div className="border border-border rounded-3xl overflow-hidden shadow-2xl relative bg-background transform origin-top w-full">
            <Hero heroBlock={formValues} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 glass-card border border-border rounded-2xl p-8 shadow-sm">
        
        {/* Layout Engine */}
        <div className="space-y-6 bg-muted/10 p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Hero Layout Engine</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: "neo-glass", name: "Neo Glassmorphism", desc: "Floating frosted panels" },
                { id: "cyber-glitch", name: "Cyberpunk", desc: "Neon, edgy, dark mode" },
                { id: "fluid-aurora", name: "Fluid Aurora", desc: "Organic animated gradients" },
                { id: "editorial-grid", name: "Editorial Bento", desc: "High fashion grid" },
                { id: "immersive-parallax", name: "Immersive Depth", desc: "3D layers & parallax" },
                { id: "architectural-brutalism", name: "Arch Brutalism", desc: "Raw & bold structure" },
              ].map((layout) => (
                <label key={layout.id} className={`cursor-pointer border rounded-xl p-4 transition-all ${watch("layout") === layout.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-foreground/30 bg-background"}`}>
                  <input
                    type="radio"
                    value={layout.id}
                    {...register("layout")}
                    className="sr-only"
                  />
                  <div className="font-semibold text-sm mb-1">{layout.name}</div>
                  <div className="text-xs text-muted-foreground">{layout.desc}</div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-widest border-b border-border pb-2">Content</h2>
            
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main Title (HTML Allowed)</label>
              <input
                {...register("title")}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                placeholder="The Future of Commerce"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Subtitle / Eyebrow</label>
              <input
                {...register("subtitle")}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                placeholder="New Arrival"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">CTA Button Text</label>
                <input
                  {...register("cta.text")}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">CTA Button Link</label>
                <input
                  {...register("cta.link")}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  placeholder="/collections/all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-widest border-b border-border pb-2">Styling & Background</h2>
            
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Background Image URL or Color</label>
              <div className="flex gap-2">
                <input
                  {...register("background")}
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  placeholder="Upload image or enter #ff0000"
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-3 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-center disabled:opacity-50"
                  title="Upload Background Image"
                >
                  <Upload size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Title Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={watch("titleColor") || "#ffffff"}
                    onChange={(e) => setValue("titleColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <input
                    type="text"
                    {...register("titleColor")}
                    placeholder="Theme default"
                    className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Subtitle Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={watch("subtitleColor") || "#ffffff"}
                    onChange={(e) => setValue("subtitleColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-border"
                  />
                  <input
                    type="text"
                    {...register("subtitleColor")}
                    placeholder="Theme default"
                    className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary uppercase"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overlay Opacity (0-100%)</label>
              <input
                type="number"
                min="0"
                max="100"
                {...register("overlayOpacity")}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                placeholder="20"
              />
              <p className="text-xs text-muted-foreground mt-1">Darkens the background image to make text readable (used in Cinematic & Magazine layouts).</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-border">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Hero Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

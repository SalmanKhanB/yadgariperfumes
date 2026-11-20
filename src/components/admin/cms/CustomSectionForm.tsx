"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomSectionAction, updateCustomSectionAction } from "@/server/actions/customSectionActions";
import { ICustomSection } from "@/server/db/models/CustomSection";
import { Save, ArrowLeft, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { Sparkles, Upload, Plus, Trash2, ArrowRight } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import Link from "next/link";
import PreviewSectionRenderer from "@/components/admin/cms/PreviewSectionRenderer";

interface Props {
  initialData?: ICustomSection | null;
  pages: { slug: string; title: string }[];
}

export default function CustomSectionForm({ initialData, pages }: Props) {
  const router = useRouter();
  
  // Backwards compatibility with old sections that had htmlContent/themeWrapper at root
  const initData = initialData || {} as any;
  const initialBlockType = initData.blockType || (initData.htmlContent ? "custom-html" : "custom-html");
  const initialBlockData = initData.blockData || {
    themeWrapper: initData.themeWrapper || "none",
    htmlContent: initData.htmlContent || '<div class="p-12 text-center text-foreground">\n  <h2 class="text-3xl font-black uppercase tracking-tighter">Custom Section</h2>\n</div>'
  };

  const [formData, setFormData] = useState<Partial<ICustomSection>>({
    name: initData.name || "",
    pageSlug: initData.pageSlug || "home",
    order: initData.order || 0,
    blockType: initialBlockType,
    blockData: initialBlockData,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let res;
    if (initialData?._id) {
      res = await updateCustomSectionAction(String(initialData._id), formData);
    } else {
      res = await createCustomSectionAction(formData);
    }

    setLoading(false);
    if (res.success) {
      router.push("/admin/cms/custom-sections");
      router.refresh();
    } else {
      alert("Error: " + res.error);
    }
  };

  const updateBlockData = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      blockData: {
        ...(prev.blockData || {}),
        [key]: value
      }
    }));
  };

  const handleTypeChange = (newType: string) => {
    setFormData(prev => ({
      ...prev,
      blockType: newType,
      // Keep old block data just in case they switch back, 
      // or initialize with safe defaults
      blockData: {
        ...(prev.blockData || {}),
        // Add minimal defaults if switching
        ...(newType === "image" && !prev.blockData?.url ? { url: "" } : {}),
        ...(newType === "video" && !prev.blockData?.videoUrl ? { videoUrl: "" } : {}),
      }
    }));
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/admin/cms/custom-sections" className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
            <ArrowLeft size={20} /> Back to Sections
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            <Save size={20} /> {loading ? "Saving..." : "Save Custom Section"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Section Name (Admin Only)</label>
                <input 
                  type="text" 
                  required
                  value={formData.name || ""} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full border border-border bg-background rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="e.g., Summer Promo Banner"
                />
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Target Page</label>
                <select 
                  value={formData.pageSlug || "home"} 
                  onChange={(e) => setFormData({ ...formData, pageSlug: e.target.value })} 
                  className="w-full border border-border bg-background rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                >
                  <option value="home">home (Home Page)</option>
                  {pages.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.slug} ({p.title})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Order</label>
                <input 
                  type="number" 
                  value={formData.order || 0} 
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} 
                  className="w-full border border-border bg-background rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                />
                <p className="text-xs text-muted-foreground mt-2">Lower numbers appear higher on the page (e.g., 0 is at the top).</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Section Type</label>
                <select 
                  value={formData.blockType || "custom-html"} 
                  onChange={(e) => handleTypeChange(e.target.value)} 
                  className="w-full border border-border bg-background rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                >
                  <option value="custom-html">Custom HTML</option>
                  <option value="image">Image Only</option>
                  <option value="image-text">Image with Text</option>
                  <option value="video">Video Only</option>
                  <option value="video-text">Video with Text</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                {formData.blockType === "custom-html" && (
                  <>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Theme Wrapper</label>
                      <select 
                        value={formData.blockData?.themeWrapper || "none"} 
                        onChange={(e) => updateBlockData("themeWrapper", e.target.value)} 
                        className="w-full border border-border bg-background rounded-xl p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      >
                        <option value="none">None (Transparent Container)</option>
                        <option value="aurora">Aurora Ethereal Container</option>
                        <option value="cyberpunk">Cyberpunk Glitch Container</option>
                        <option value="glassmorphism">Glassmorphism Parallax Container</option>
                        <option value="minimalist">Minimalist Kinetic Container</option>
                        <option value="grid-matrix">Interactive Grid Matrix Container</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">HTML Content (Tailwind Supported)</label>
                      <textarea 
                        rows={10}
                        required
                        value={formData.blockData?.htmlContent || ""} 
                        onChange={(e) => updateBlockData("htmlContent", e.target.value)} 
                        className="w-full border border-border bg-background rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm whitespace-pre shadow-inner text-foreground"
                      />
                    </div>
                  </>
                )}

                {formData.blockType === "image" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Image Upload</label>
                      <ImageUploader 
                        images={formData.blockData?.url ? [formData.blockData.url] : []}
                        onChange={(urls) => updateBlockData("url", urls[0] || "")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Alt Text</label>
                      <input type="text" value={formData.blockData?.altText || ""} onChange={e => updateBlockData("altText", e.target.value)} className="w-full border border-border bg-background rounded-xl p-3" />
                    </div>
                    <div className="flex items-center gap-3">
                      <ToggleSwitch checked={formData.blockData?.fullWidth || false} onChange={(checked) => updateBlockData("fullWidth", checked)} />
                      <label className="text-sm font-bold text-foreground">Full Width</label>
                    </div>
                  </>
                )}

                {formData.blockType === "image-text" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Heading</label>
                      <input type="text" value={formData.blockData?.heading || ""} onChange={e => updateBlockData("heading", e.target.value)} className="w-full border border-border bg-background rounded-xl p-3" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Content / Paragraph</label>
                      <textarea rows={4} value={formData.blockData?.content || ""} onChange={e => updateBlockData("content", e.target.value)} className="w-full border border-border bg-background rounded-xl p-3" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Image Upload</label>
                      <ImageUploader 
                        images={formData.blockData?.image ? [formData.blockData.image] : []}
                        onChange={(urls) => updateBlockData("image", urls[0] || "")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Image Position</label>
                      <select value={formData.blockData?.imagePosition || "left"} onChange={e => updateBlockData("imagePosition", e.target.value)} className="w-full border border-border bg-background rounded-xl p-3">
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </>
                )}

                {formData.blockType === "video" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Heading (Optional)</label>
                      <input type="text" value={formData.blockData?.heading || ""} onChange={e => updateBlockData("heading", e.target.value)} className="w-full border border-border bg-background rounded-xl p-3" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Video Embedded URL (YouTube embed, MP4, etc)</label>
                      <input type="text" value={formData.blockData?.videoUrl || ""} onChange={e => updateBlockData("videoUrl", e.target.value)} className="w-full border border-border bg-background rounded-xl p-3" required />
                    </div>
                    <div className="flex items-center gap-3">
                      <ToggleSwitch checked={formData.blockData?.fullWidth || false} onChange={(checked) => updateBlockData("fullWidth", checked)} />
                      <label className="text-sm font-bold text-foreground">Full Width</label>
                    </div>
                  </>
                )}

                {formData.blockType === "video-text" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Heading</label>
                      <input type="text" value={formData.blockData?.heading || ""} onChange={e => updateBlockData("heading", e.target.value)} className="w-full border border-border bg-background rounded-xl p-3" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Content / Paragraph</label>
                      <textarea rows={4} value={formData.blockData?.content || ""} onChange={e => updateBlockData("content", e.target.value)} className="w-full border border-border bg-background rounded-xl p-3" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Video Embedded URL</label>
                      <input type="text" value={formData.blockData?.videoUrl || ""} onChange={e => updateBlockData("videoUrl", e.target.value)} className="w-full border border-border bg-background rounded-xl p-3" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Video Position</label>
                      <select value={formData.blockData?.videoPosition || "left"} onChange={e => updateBlockData("videoPosition", e.target.value)} className="w-full border border-border bg-background rounded-xl p-3">
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Live Preview Panel */}
      <div className="mt-16 pt-8 border-t border-border">
        <div className="flex items-center gap-2 mb-6 text-muted-foreground">
          <Eye size={24} />
          <h3 className="text-xl font-black uppercase tracking-widest">Live Preview</h3>
        </div>
        <div className="border-[4px] border-dashed border-border rounded-3xl overflow-hidden bg-background relative min-h-[400px]">
          {/* We wrap the preview renderer in a standard flex column to mimic storefront context */}
          <div className="flex-1 w-full relative z-10 pointer-events-none">
             <PreviewSectionRenderer 
               blockType={formData.blockType || "custom-html"} 
               data={formData.blockData || {}} 
             />
          </div>
        </div>
      </div>
    </div>
  );
}

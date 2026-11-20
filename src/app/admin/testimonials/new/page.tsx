"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTestimonialAction } from "@/server/actions/testimonialActions";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function NewTestimonialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    authorName: "",
    role: "",
    content: "",
    avatarImage: "",
    rating: 5,
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createTestimonialAction(formData);
    setLoading(false);
    if (res.success) {
      router.push("/admin/testimonials");
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/testimonials" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Add Testimonial</h1>
          <p className="text-muted-foreground mt-1">Create a new customer testimonial for the storefront.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card rounded-xl border border-border shadow-sm p-6 space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Author Name</label>
            <input 
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono"
              placeholder="e.g. Jane Doe"
              value={formData.authorName}
              onChange={(e) => setFormData({...formData, authorName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Role / Title (Optional)</label>
            <input 
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono"
              placeholder="e.g. Fragrance Enthusiast"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground block">
              Avatar / Profile Image (Upload or Paste Image URL)
            </label>
            
            <ImageUploader 
              images={formData.avatarImage ? [formData.avatarImage] : []}
              onChange={(urls) => setFormData({...formData, avatarImage: urls[0] || ""})}
            />

            <div className="pt-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">
                Or Paste Direct Image URL:
              </span>
              <input 
                type="url"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-mono"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatarImage}
                onChange={(e) => setFormData({...formData, avatarImage: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Quote / Content</label>
            <textarea 
              required
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors font-serif italic text-lg resize-none"
              placeholder="Their review..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Rating (1-5)</label>
              <input 
                type="number"
                min="1"
                max="5"
                required
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono"
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2 flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer mt-6">
                <input 
                  type="checkbox"
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <span className="font-bold uppercase tracking-wider text-sm">Active (Visible)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/testimonials" className="px-6 py-3 rounded-lg font-bold hover:bg-muted transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><Save size={20} /> Save Testimonial</>}
          </button>
        </div>
      </form>
    </div>
  );
}

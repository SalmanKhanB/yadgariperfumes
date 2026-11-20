"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCelebrityReviewAction } from "@/server/actions/celebrityReviewActions";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewCelebrityReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    celebrityName: "",
    videoIframe: "",
    quote: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveCelebrityReviewAction(null, formData);
    setLoading(false);
    if (res.success) {
      router.push("/admin/celebrity-reviews");
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/celebrity-reviews" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Add Celebrity Review</h1>
          <p className="text-muted-foreground mt-1">Add a new celebrity video review to the storefront.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card rounded-xl border border-border shadow-sm p-6 space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Celebrity Name</label>
            <input 
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono"
              placeholder="e.g. Zendaya"
              value={formData.celebrityName}
              onChange={(e) => setFormData({...formData, celebrityName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Video iframe HTML</label>
            <textarea 
              required
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono text-sm resize-none"
              placeholder={`<iframe width="100%" height="100%" src="..."></iframe>`}
              value={formData.videoIframe}
              onChange={(e) => setFormData({...formData, videoIframe: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">Paste embed code from YouTube, Vimeo, or TikTok here.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Short Quote (Optional)</label>
            <input 
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors font-serif italic"
              placeholder="e.g. This is my signature scent..."
              value={formData.quote}
              onChange={(e) => setFormData({...formData, quote: e.target.value})}
            />
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <label className="flex items-center gap-3 cursor-pointer">
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

        <div className="flex justify-end gap-4">
          <Link href="/admin/celebrity-reviews" className="px-6 py-3 rounded-lg font-bold hover:bg-muted transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><Save size={20} /> Save Review</>}
          </button>
        </div>
      </form>
    </div>
  );
}

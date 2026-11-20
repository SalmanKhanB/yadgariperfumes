"use client";

import { useEffect, useState } from "react";
import { fetchPagesAction, updatePageAction, createPageAction } from "@/server/actions/pageActions";
import { Save, FileText } from "lucide-react";
import { ThemePreview } from "@/components/admin/ThemePreview";

export default function ProductsPageCMS() {
  const [loading, setLoading] = useState(true);
  const [pageId, setPageId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("All Products");
  const [themeConfig, setThemeConfig] = useState<{theme?: string, backgroundColor?: string, textColor?: string, subheading?: string}>({
    theme: "", backgroundColor: "", textColor: "", subheading: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      const res = await fetchPagesAction();
      if (res.success && res.data) {
        const p = res.data.find((page: any) => page.slug === "all");
        if (p) {
          setPageId(String(p._id));
          setTitle(p.title);
          setThemeConfig(p.themeConfig || { theme: "", backgroundColor: "", textColor: "", subheading: "" });
        }
      }
      setLoading(false);
    }
    loadPage();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      slug: "all",
      blocks: [],
      themeConfig
    };

    let res;
    if (pageId) {
      res = await updatePageAction(pageId, payload);
    } else {
      res = await createPageAction(payload);
    }

    if (res.success) {
      alert("Products Page saved successfully!");
    } else {
      alert("Failed to save: " + res.error);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      
      <div className="flex justify-between items-center border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <FileText className="text-primary" /> Products Page CMS
          </h1>
          <p className="text-muted-foreground mt-1">Configure the design and layout of the main products listing page.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 disabled:opacity-50"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Page"}
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-border shadow-sm space-y-6">
        <h2 className="text-xl font-bold border-b border-border pb-4">Page Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Theme Style</label>
            <select 
              value={themeConfig.theme}
              onChange={(e) => setThemeConfig({ ...themeConfig, theme: e.target.value })}
              className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-bold"
            >
              <option value="aurora">Flagship Premium (Dynamic Glows)</option>
              <option value="cyberpunk">Cyberpunk (Neon & Glitch)</option>
              <option value="glassmorphism">Glassmorphism (Frosted Glass)</option>
              <option value="minimalist">Minimalist (Clean & Typographic)</option>
              <option value="editorial">Editorial (Split Screen Style)</option>
              <option value="grid-matrix">Grid Matrix (Dark Tech Borders)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Heading</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-bold"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Subheading</label>
            <input 
              type="text" 
              value={themeConfig.subheading || ""}
              onChange={(e) => setThemeConfig({ ...themeConfig, subheading: e.target.value })}
              className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Background Color Override</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={themeConfig.backgroundColor || "#000000"}
                onChange={(e) => setThemeConfig({ ...themeConfig, backgroundColor: e.target.value })}
                className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
              />
              <input 
                type="text" 
                value={themeConfig.backgroundColor || ""}
                onChange={(e) => setThemeConfig({ ...themeConfig, backgroundColor: e.target.value })}
                placeholder="e.g. #000000 or empty for default"
                className="flex-1 border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Text Color Override</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={themeConfig.textColor || "#ffffff"}
                onChange={(e) => setThemeConfig({ ...themeConfig, textColor: e.target.value })}
                className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
              />
              <input 
                type="text" 
                value={themeConfig.textColor || ""}
                onChange={(e) => setThemeConfig({ ...themeConfig, textColor: e.target.value })}
                placeholder="e.g. #ffffff or empty for default"
                className="flex-1 border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-mono text-sm"
              />
            </div>
          </div>

        </div>
      </div>

      {!loading && (
        <div className="glass-panel p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Live Preview</h3>
          <div className="border border-border rounded-2xl overflow-hidden relative" style={{ height: '400px' }}>
            <div className="absolute inset-0 pointer-events-none origin-top" style={{ transform: 'scale(0.8)', width: '125%' }}>
              <ThemePreview config={{ ...themeConfig, heading: title }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchSiteSettingsAction, updateSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { fetchCategoriesAction } from "@/server/actions/categoryActions";
import { Star } from "lucide-react";
import { ThemePreview } from "@/components/admin/ThemePreview";

export default function FeaturedProducts3AdminPage() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [config, setConfig] = useState({
    theme: "minimalist",
    heading: "Customize",
    subheading: "Fresh drops you don't want to miss.",
    limit: 8,
    backgroundColor: "",
    textColor: "",
    category: ""
  });

  const loadSettings = async () => {
    setLoading(true);
    const res = await fetchSiteSettingsAction();
    if (res.success && res.data) {
      if (res.data.featuredProductsSection3) {
        setConfig({
          theme: res.data.featuredProductsSection3.theme || "minimalist",
          heading: res.data.featuredProductsSection3.heading || "Customize",
          subheading: res.data.featuredProductsSection3.subheading || "",
          limit: res.data.featuredProductsSection3.limit || 8,
          backgroundColor: res.data.featuredProductsSection3.backgroundColor || "",
          textColor: res.data.featuredProductsSection3.textColor || "",
          category: res.data.featuredProductsSection3.category || ""
        });
      }
    }
    
    const catRes = await fetchCategoriesAction();
    if (catRes.success && catRes.data) {
      setCategories(catRes.data);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    const res = await updateSiteSettingsAction({ featuredProductsSection3: config });
    if (res.success) {
      alert("Home Page Customize 2 settings saved successfully!");
    } else {
      alert("Failed to save settings.");
    }
    setSavingSettings(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Star className="text-primary" /> Customize 2
          </h1>
          <p className="text-muted-foreground mt-1">Configure the second "Customize" section displayed on your storefront's home page.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl border border-border shadow-sm space-y-6 max-w-4xl">
          <h2 className="text-xl font-bold uppercase tracking-tight border-b border-border pb-4">Home Page "Customize 2" Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Theme Style</label>
              <select 
                value={config.theme}
                onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary"
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
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Category Filter</label>
              <select 
                value={config.category}
                onChange={(e) => setConfig({ ...config, category: e.target.value })}
                className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary"
              >
                <option value="">All Categories (Default)</option>
                {categories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Maximum Products to Show</label>
              <input 
                type="number" 
                value={config.limit}
                onChange={(e) => setConfig({ ...config, limit: Number(e.target.value) })}
                className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Heading</label>
              <input 
                type="text" 
                value={config.heading}
                onChange={(e) => setConfig({ ...config, heading: e.target.value })}
                className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Subheading</label>
              <input 
                type="text" 
                value={config.subheading}
                onChange={(e) => setConfig({ ...config, subheading: e.target.value })}
                className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Background Color Override</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={config.backgroundColor || "#000000"}
                  onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
                />
                <input 
                  type="text" 
                  value={config.backgroundColor}
                  onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
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
                  value={config.textColor || "#ffffff"}
                  onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
                />
                <input 
                  type="text" 
                  value={config.textColor}
                  onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                  placeholder="e.g. #ffffff or empty for default"
                  className="flex-1 border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-mono text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-border">
            <button 
              onClick={saveSettings} 
              disabled={savingSettings}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {savingSettings ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      )}

      {/* Theme Preview Section */}
      {!loading && (
        <div className="space-y-4 max-w-4xl">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Live Preview</h3>
          <div className="border border-border rounded-2xl overflow-hidden relative" style={{ height: '400px' }}>
            <div className="absolute inset-0 pointer-events-none origin-top" style={{ transform: 'scale(0.8)', width: '125%' }}>
              <ThemePreview config={config} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

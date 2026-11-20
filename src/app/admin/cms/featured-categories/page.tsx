"use client";

import { useState, useEffect } from "react";
import { fetchSiteSettingsAction, updateSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { Star, Tags } from "lucide-react";
import { ThemePreview } from "@/components/admin/ThemePreview";

export default function FeaturedCategoriesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [featuredCategoriesConfig, setFeaturedCategoriesConfig] = useState({
    theme: "glassmorphism",
    heading: "Shop by Category",
    subheading: "Find exactly what you need.",
    limit: 6,
    backgroundColor: "",
    textColor: ""
  });

  const loadSettings = async () => {
    setLoading(true);
    const res = await fetchSiteSettingsAction();
    if (res.success && res.data) {
      if (res.data.featuredCategoriesSection) {
        setFeaturedCategoriesConfig({
          theme: res.data.featuredCategoriesSection.theme || "glassmorphism",
          heading: res.data.featuredCategoriesSection.heading || "Shop by Category",
          subheading: res.data.featuredCategoriesSection.subheading || "Find exactly what you need.",
          limit: res.data.featuredCategoriesSection.limit || 6,
          backgroundColor: res.data.featuredCategoriesSection.backgroundColor || "",
          textColor: res.data.featuredCategoriesSection.textColor || ""
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    const res = await updateSiteSettingsAction({
      featuredCategoriesSection: featuredCategoriesConfig
    });
    if (res.success) {
      alert("Settings saved successfully.");
    } else {
      alert("Failed to save settings.");
    }
    setSavingSettings(false);
  };

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <Tags className="text-primary" size={32} /> Featured Categories
        </h1>
        <p className="text-muted-foreground mt-1">Configure the design and layout of the home page featured categories section.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6 max-w-4xl">
          <h2 className="text-xl font-bold border-b border-border pb-2">Section Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Theme Style</label>
              <select 
                value={featuredCategoriesConfig.theme}
                onChange={(e) => setFeaturedCategoriesConfig({ ...featuredCategoriesConfig, theme: e.target.value })}
                className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-semibold"
              >
                <option value="aurora">Flagship Premium (Dynamic Glows)</option>
                <option value="cyberpunk">Cyberpunk (Neon Borders)</option>
                <option value="glassmorphism">Glassmorphism (Frosted Cards)</option>
                <option value="minimalist">Minimalist (Clean Typography)</option>
                <option value="editorial">Editorial (Magazine Style)</option>
                <option value="grid-matrix">Grid Matrix (Tech/Data Structure)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Maximum Categories to Show</label>
              <input 
                type="number" 
                value={featuredCategoriesConfig.limit}
                onChange={(e) => setFeaturedCategoriesConfig({ ...featuredCategoriesConfig, limit: parseInt(e.target.value) || 6 })}
                className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary"
                min="1" max="24"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Heading</label>
              <input 
                type="text" 
                value={featuredCategoriesConfig.heading}
                onChange={(e) => setFeaturedCategoriesConfig({ ...featuredCategoriesConfig, heading: e.target.value })}
                className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Subheading</label>
              <input 
                type="text" 
                value={featuredCategoriesConfig.subheading}
                onChange={(e) => setFeaturedCategoriesConfig({ ...featuredCategoriesConfig, subheading: e.target.value })}
                className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Background Color Override</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={featuredCategoriesConfig.backgroundColor || "#000000"}
                  onChange={(e) => setFeaturedCategoriesConfig({ ...featuredCategoriesConfig, backgroundColor: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
                />
                <input 
                  type="text" 
                  value={featuredCategoriesConfig.backgroundColor}
                  onChange={(e) => setFeaturedCategoriesConfig({ ...featuredCategoriesConfig, backgroundColor: e.target.value })}
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
                  value={featuredCategoriesConfig.textColor || "#ffffff"}
                  onChange={(e) => setFeaturedCategoriesConfig({ ...featuredCategoriesConfig, textColor: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
                />
                <input 
                  type="text" 
                  value={featuredCategoriesConfig.textColor}
                  onChange={(e) => setFeaturedCategoriesConfig({ ...featuredCategoriesConfig, textColor: e.target.value })}
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
              <ThemePreview config={featuredCategoriesConfig} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


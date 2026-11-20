"use client";

import { useState, useEffect } from "react";
import { fetchSiteSettingsAction, updateSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { Star } from "lucide-react";
import { ThemePreview } from "@/components/admin/ThemePreview";

export default function CelebrityReviewsCMSPage() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [celebrityReviewsConfig, setCelebrityReviewsConfig] = useState({
    theme: "glassmorphism",
    heading: "Reviews by Celebrities",
    subheading: "See what the biggest names are saying about our exclusive collection.",
    backgroundColor: "",
    textColor: ""
  });

  const loadSettings = async () => {
    setLoading(true);
    const res = await fetchSiteSettingsAction();
    if (res.success && res.data) {
      if (res.data.celebrityReviewsSection) {
        setCelebrityReviewsConfig({
          theme: res.data.celebrityReviewsSection.theme || "glassmorphism",
          heading: res.data.celebrityReviewsSection.heading || "Reviews by Celebrities",
          subheading: res.data.celebrityReviewsSection.subheading || "See what the biggest names are saying about our exclusive collection.",
          backgroundColor: res.data.celebrityReviewsSection.backgroundColor || "",
          textColor: res.data.celebrityReviewsSection.textColor || ""
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
      celebrityReviewsSection: celebrityReviewsConfig
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
          <Star className="text-primary" size={32} /> Celebrity Reviews CMS
        </h1>
        <p className="text-muted-foreground mt-1">Configure the design and layout of the celebrity reviews section on the storefront.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        <div className="space-y-8">
          <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6 max-w-4xl">
            <h2 className="text-xl font-bold border-b border-border pb-2">Section Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Theme Style</label>
                <select 
                  value={celebrityReviewsConfig.theme}
                  onChange={(e) => setCelebrityReviewsConfig({ ...celebrityReviewsConfig, theme: e.target.value })}
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
              
              <div className="md:col-start-1">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Heading</label>
                <input 
                  type="text" 
                  value={celebrityReviewsConfig.heading}
                  onChange={(e) => setCelebrityReviewsConfig({ ...celebrityReviewsConfig, heading: e.target.value })}
                  className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-bold"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Subheading</label>
                <input 
                  type="text" 
                  value={celebrityReviewsConfig.subheading}
                  onChange={(e) => setCelebrityReviewsConfig({ ...celebrityReviewsConfig, subheading: e.target.value })}
                  className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Background Color Override</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={celebrityReviewsConfig.backgroundColor || "#000000"}
                    onChange={(e) => setCelebrityReviewsConfig({ ...celebrityReviewsConfig, backgroundColor: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
                  />
                  <input 
                    type="text" 
                    placeholder="e.g. #000000 or leave empty"
                    value={celebrityReviewsConfig.backgroundColor}
                    onChange={(e) => setCelebrityReviewsConfig({ ...celebrityReviewsConfig, backgroundColor: e.target.value })}
                    className="flex-1 border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Leave empty to use the default theme background.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Text Color Override</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={celebrityReviewsConfig.textColor || "#ffffff"}
                    onChange={(e) => setCelebrityReviewsConfig({ ...celebrityReviewsConfig, textColor: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
                  />
                  <input 
                    type="text" 
                    placeholder="e.g. #FFFFFF or leave empty"
                    value={celebrityReviewsConfig.textColor}
                    onChange={(e) => setCelebrityReviewsConfig({ ...celebrityReviewsConfig, textColor: e.target.value })}
                    className="flex-1 border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
               Theme Preview 
            </h2>
            <ThemePreview config={celebrityReviewsConfig} defaultHeading="Reviews by Celebrities" />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-64 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border flex justify-end z-40">
        <button 
          onClick={saveSettings}
          disabled={savingSettings || loading}
          className="bg-primary text-primary-foreground px-8 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {savingSettings ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { fetchSiteSettingsAction, updateSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { MessageSquareQuote } from "lucide-react";
import { ThemePreview } from "@/components/admin/ThemePreview";

export default function TestimonialsCMSPage() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [testimonialsConfig, setTestimonialsConfig] = useState({
    theme: "glassmorphism",
    heading: "What Our Customers Say",
    subheading: "Read the stories and experiences of people who love our brand.",
    backgroundColor: "",
    textColor: "",
  });

  useEffect(() => {
    async function load() {
      const res = await fetchSiteSettingsAction();
      if (res.success && res.data) {
        if (res.data.testimonialsSection) {
          setTestimonialsConfig({
            theme: res.data.testimonialsSection.theme || "glassmorphism",
            heading: res.data.testimonialsSection.heading || "What Our Customers Say",
            subheading: res.data.testimonialsSection.subheading || "Read the stories and experiences of people who love our brand.",
            backgroundColor: res.data.testimonialsSection.backgroundColor || "",
            textColor: res.data.testimonialsSection.textColor || "",
          });
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    await updateSiteSettingsAction({ testimonialsSection: testimonialsConfig });
    setSavingSettings(false);
  };

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <MessageSquareQuote className="text-primary" size={32} /> Testimonials CMS
        </h1>
        <p className="text-muted-foreground mt-1">Configure the design and layout of the testimonials slider on the storefront.</p>
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
                  value={testimonialsConfig.theme}
                  onChange={(e) => setTestimonialsConfig({ ...testimonialsConfig, theme: e.target.value })}
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
                  value={testimonialsConfig.heading}
                  onChange={(e) => setTestimonialsConfig({ ...testimonialsConfig, heading: e.target.value })}
                  className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-bold"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Subheading</label>
                <input 
                  type="text" 
                  value={testimonialsConfig.subheading}
                  onChange={(e) => setTestimonialsConfig({ ...testimonialsConfig, subheading: e.target.value })}
                  className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Background Color Override</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={testimonialsConfig.backgroundColor || "#000000"}
                    onChange={(e) => setTestimonialsConfig({ ...testimonialsConfig, backgroundColor: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
                  />
                  <input 
                    type="text" 
                    placeholder="e.g. #000000 or leave empty"
                    value={testimonialsConfig.backgroundColor}
                    onChange={(e) => setTestimonialsConfig({ ...testimonialsConfig, backgroundColor: e.target.value })}
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
                    value={testimonialsConfig.textColor || "#ffffff"}
                    onChange={(e) => setTestimonialsConfig({ ...testimonialsConfig, textColor: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer border border-border bg-background p-1"
                  />
                  <input 
                    type="text" 
                    placeholder="e.g. #FFFFFF or leave empty"
                    value={testimonialsConfig.textColor}
                    onChange={(e) => setTestimonialsConfig({ ...testimonialsConfig, textColor: e.target.value })}
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
            <ThemePreview config={testimonialsConfig} defaultHeading="What Our Customers Say" />
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

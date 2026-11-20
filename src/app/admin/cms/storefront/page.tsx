"use client";

import { useEffect, useState } from "react";
import { fetchSiteSettingsAction, updateSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { toast } from "sonner";
import { Save, LayoutGrid, Monitor, CreditCard } from "lucide-react";

export default function StorefrontSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [layout, setLayout] = useState<{
    productGridColumns: "2" | "3" | "4";
    productCardStyle: "standard" | "minimal";
    productPageLayout: "split" | "standard";
    showSoldOutBadge?: boolean;
  }>({
    productGridColumns: "4",
    productCardStyle: "standard",
    productPageLayout: "standard",
    showSoldOutBadge: true,
  });

  useEffect(() => {
    async function load() {
      const res = await fetchSiteSettingsAction();
      if (res.success && res.data?.storefrontLayout) {
        setLayout({
          productGridColumns: (res.data.storefrontLayout.productGridColumns || "4") as "2" | "3" | "4",
          productCardStyle: (res.data.storefrontLayout.productCardStyle || "standard") as "standard" | "minimal",
          productPageLayout: (res.data.storefrontLayout.productPageLayout || "standard") as "split" | "standard",
          showSoldOutBadge: res.data.storefrontLayout.showSoldOutBadge !== false,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateSiteSettingsAction({ storefrontLayout: layout });
    setSaving(false);
    
    if (res.success) {
      toast.success("Storefront Layout Updated!");
    } else {
      toast.error(res.error || "Failed to update layout");
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse">Loading layout settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Storefront Appearance</h1>
        <p className="text-muted-foreground mt-2">Control the exact layout and visual design of your public shop pages.</p>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-8">
        
        {/* Product Grid Columns */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <LayoutGrid size={20} className="text-primary" />
              Product Grid Columns
            </h3>
            <p className="text-sm text-muted-foreground">How many products should display per row on desktop screens.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {(["2", "3", "4"] as const).map((cols) => (
              <button
                key={cols}
                onClick={() => setLayout({ ...layout, productGridColumns: cols })}
                className={`p-4 rounded-xl border transition-all ${
                  layout.productGridColumns === cols 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-border hover:border-primary/50 text-muted-foreground"
                }`}
              >
                <div className="text-2xl font-black mb-1">{cols}</div>
                <div className="text-xs uppercase tracking-wider">Columns</div>
              </button>
            ))}
          </div>
        </div>

        <hr className="border-border" />

        {/* Product Card Style */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              Product Card Style
            </h3>
            <p className="text-sm text-muted-foreground">Choose the visual aesthetic for your product cards in the grid.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLayout({ ...layout, productCardStyle: "standard" })}
              className={`p-4 rounded-xl border text-left transition-all ${
                layout.productCardStyle === "standard" 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border hover:border-primary/50 text-muted-foreground"
              }`}
            >
              <div className="font-bold mb-1">Standard (Glass)</div>
              <div className="text-xs">Rounded borders, glass-card background, hover shadows.</div>
            </button>
            
            <button
              onClick={() => setLayout({ ...layout, productCardStyle: "minimal" })}
              className={`p-4 rounded-xl border text-left transition-all ${
                layout.productCardStyle === "minimal" 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border hover:border-primary/50 text-muted-foreground"
              }`}
            >
              <div className="font-bold mb-1">Minimal & Bold</div>
              <div className="text-xs">Borderless, full-width images, clean typography.</div>
            </button>
          </div>
        </div>

        <hr className="border-border" />

        {/* Badges Layout */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              Card Badges & Tags
            </h3>
            <p className="text-sm text-muted-foreground">Control which badges appear on product cards across the site.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-muted/20 p-4 rounded-xl border border-border">
            <input 
              type="checkbox" 
              id="showSoldOutBadge2"
              checked={layout.showSoldOutBadge}
              onChange={(e) => setLayout({ ...layout, showSoldOutBadge: e.target.checked })}
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="showSoldOutBadge2" className="text-sm font-semibold cursor-pointer">
              Show "Sold Out" Tag on Product Cards
            </label>
          </div>
        </div>

        <hr className="border-border" />

        {/* Product Page Layout */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Monitor size={20} className="text-primary" />
              Product Page Layout
            </h3>
            <p className="text-sm text-muted-foreground">The structural layout of the individual product details page.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLayout({ ...layout, productPageLayout: "standard" })}
              className={`p-4 rounded-xl border text-left transition-all ${
                layout.productPageLayout === "standard" 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border hover:border-primary/50 text-muted-foreground"
              }`}
            >
              <div className="font-bold mb-1">Standard</div>
              <div className="text-xs">Image carousel on the left, sticky details on the right.</div>
            </button>
            
            <button
              onClick={() => setLayout({ ...layout, productPageLayout: "split" })}
              className={`p-4 rounded-xl border text-left transition-all ${
                layout.productPageLayout === "split" 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border hover:border-primary/50 text-muted-foreground"
              }`}
            >
              <div className="font-bold mb-1">50/50 Split</div>
              <div className="text-xs">Modern half-screen edge-to-edge images, half-screen details.</div>
            </button>
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
        >
          {saving ? "Saving..." : "Save Storefront"}
          <Save size={18} />
        </button>
      </div>

    </div>
  );
}

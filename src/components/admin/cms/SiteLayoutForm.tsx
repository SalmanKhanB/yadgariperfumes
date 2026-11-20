"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateSiteSettingsAction } from "@/server/actions/siteSettingsActions";

export default function SiteLayoutForm({ initialSettings }: { initialSettings: any }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      headerStyle: {
        layout: initialSettings.headerStyle?.layout || "ecommerce-pro",
        backgroundColor: initialSettings.headerStyle?.backgroundColor || "",
        textColor: initialSettings.headerStyle?.textColor || "",
        activeColor: initialSettings.headerStyle?.activeColor || "",
      },
      footerStyle: {
        layout: initialSettings.footerStyle?.layout || "ecommerce-pro",
        backgroundColor: initialSettings.footerStyle?.backgroundColor || "",
        textColor: initialSettings.footerStyle?.textColor || "",
        headingColor: initialSettings.footerStyle?.headingColor || "",
      },
      storefrontLayout: {
        productGridColumns: initialSettings.storefrontLayout?.productGridColumns || "4",
        productCardStyle: initialSettings.storefrontLayout?.productCardStyle || "standard",
        productPageLayout: initialSettings.storefrontLayout?.productPageLayout || "standard",
        showSoldOutBadge: initialSettings.storefrontLayout?.showSoldOutBadge !== false,
      }
    }
  });

  const onSubmit = async (data: any) => {
    setSaving(true);
    const res = await updateSiteSettingsAction(data);
    setSaving(false);
    if (res.success) {
      alert("Site Layout updated successfully!");
    } else {
      alert("Failed to update layout: " + res.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Header Layout */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-border pb-2">Header Configuration</h3>
          <div>
            <label className="block text-sm font-semibold mb-1">Header Style</label>
            <select 
              {...register("headerStyle.layout")} 
              className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary"
            >
              <option value="ecommerce-pro">E-commerce Pro</option>
              <option value="minimal">Minimal</option>
              <option value="centered">Centered</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Background Color</label>
              <input type="color" {...register("headerStyle.backgroundColor")} className="w-full h-10 border border-border rounded-md cursor-pointer bg-background" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Text Color</label>
              <input type="color" {...register("headerStyle.textColor")} className="w-full h-10 border border-border rounded-md cursor-pointer bg-background" />
            </div>
          </div>
        </div>

        {/* Footer Layout */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-border pb-2">Footer Configuration</h3>
          <div>
            <label className="block text-sm font-semibold mb-1">Footer Style</label>
            <select 
              {...register("footerStyle.layout")} 
              className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary"
            >
              <option value="ecommerce-pro">E-commerce Pro</option>
              <option value="simple">Simple</option>
              <option value="newsletter-focused">Newsletter Focused</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Background Color</label>
              <input type="color" {...register("footerStyle.backgroundColor")} className="w-full h-10 border border-border rounded-md cursor-pointer bg-background" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Text Color</label>
              <input type="color" {...register("footerStyle.textColor")} className="w-full h-10 border border-border rounded-md cursor-pointer bg-background" />
            </div>
          </div>
        </div>

        {/* Storefront Layout */}
        <div className="space-y-4 md:col-span-2 border-t border-border pt-6">
          <h3 className="text-lg font-bold border-b border-border pb-2">Storefront Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1">Product Grid Columns</label>
              <select 
                {...register("storefrontLayout.productGridColumns")} 
                className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary"
              >
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Product Card Style</label>
              <select 
                {...register("storefrontLayout.productCardStyle")} 
                className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary"
              >
                <option value="standard">Standard</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Product Page Layout</label>
              <select 
                {...register("storefrontLayout.productPageLayout")} 
                className="w-full border border-border rounded-md p-2 bg-background focus:ring-2 focus:ring-primary"
              >
                <option value="standard">Standard</option>
                <option value="split">Split</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <input 
              type="checkbox" 
              id="showSoldOutBadge"
              {...register("storefrontLayout.showSoldOutBadge")} 
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
            />
            <label htmlFor="showSoldOutBadge" className="text-sm font-semibold">
              Show "Sold Out" Tag on Product Cards
            </label>
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={saving}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md"
        >
          {saving ? "Saving..." : "Save Layout Configuration"}
        </button>
      </div>
    </form>
  );
}

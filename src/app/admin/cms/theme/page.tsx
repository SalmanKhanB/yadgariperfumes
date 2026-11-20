"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchSiteSettingsAction, updateSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { ISiteSettings } from "@/server/db/models/SiteSettings";

interface IThemeSettingsInput {
  name: string;
  activeTheme: string;
  themeColors?: {
    primary: string;
    secondary: string;
  };
}

export default function ThemeEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const { register, handleSubmit, reset } = useForm<IThemeSettingsInput>();

  useEffect(() => {
    async function load() {
      const res = await fetchSiteSettingsAction();
      if (res.success && res.data) {
        setFormData({
          ...res.data,
          headerLinks: JSON.stringify(res.data.headerLinks || [{label: "Home", url: "/"}], null, 2),
          footerLinks: JSON.stringify(res.data.footerLinks || [], null, 2),
        });
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const parsedData = {
        ...data,
        ...formData,
        headerLinks: JSON.parse(formData.headerLinks as any),
        footerLinks: JSON.parse(formData.footerLinks as any),
      };
      const res = await updateSiteSettingsAction(parsedData);
      if (res.success) {
        alert("Settings saved!");
      } else {
        alert("Error saving: " + res.error);
      }
    } catch (e) {
      alert("Invalid JSON format for links.");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8">Loading theme...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Theme & Global Settings</h1>
        <p className="text-muted-foreground mt-1">Manage global theme variables and layout.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Store Name</label>
            <input
              {...register("name")}
              className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Active Global Theme</label>
            <select
              {...register("activeTheme")}
              className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-foreground"
            >
              <option value="aurora">Aurora (Default Glassmorphic)</option>
              <option value="cyber">Cyber (Liquid Neon)</option>
              <option value="swiss">Swiss (Brutalist Monochrome)</option>
              <option value="organic">Organic (Warm Neumorphic)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Primary Color (Hex)</label>
            <input
              {...register("themeColors.primary")}
              type="color"
              className="w-full h-12 cursor-pointer rounded-md border border-border bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Secondary Color (Hex)</label>
            <input
              {...register("themeColors.secondary")}
              type="color"
              className="w-full h-12 cursor-pointer rounded-md border border-border bg-background"
            />
          </div>
        </div>

        <div className="space-y-6 border-t border-border pt-6">
          <h3 className="font-bold text-xl text-foreground">Navigation Links (JSON)</h3>
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Header Links</label>
            <textarea
              className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-foreground font-mono text-sm h-32"
              value={formData.headerLinks as any || ""}
              onChange={(e) => setFormData({ ...formData, headerLinks: e.target.value as any })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Footer Links</label>
            <textarea
              className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-foreground font-mono text-sm h-32"
              value={formData.footerLinks as any || ""}
              onChange={(e) => setFormData({ ...formData, footerLinks: e.target.value as any })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-bold text-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchSiteSettingsAction, updateSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import toast from "react-hot-toast";
import { Search, BarChart3, Radio, Save, Activity } from "lucide-react";

export default function SeoAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    async function load() {
      const res = await fetchSiteSettingsAction();
      if (res.success && res.data) {
        reset({
          title: res.data.seoDefaults?.title || "",
          description: res.data.seoDefaults?.description || "",
          googleSearchConsoleTag: res.data.integrations?.googleSearchConsoleTag || "",
          metaPixelId: res.data.integrations?.metaPixelId || "",
          googleAnalyticsId: res.data.integrations?.googleAnalyticsId || "",
        });
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  const onSubmit = async (formData: any) => {
    setSaving(true);
    const payload = {
      seoDefaults: {
        title: formData.title,
        description: formData.description,
      },
      integrations: {
        googleSearchConsoleTag: formData.googleSearchConsoleTag,
        metaPixelId: formData.metaPixelId,
        googleAnalyticsId: formData.googleAnalyticsId,
      },
    };

    const res = await updateSiteSettingsAction(payload);
    setSaving(false);
    if (res.success) {
      toast.success("SEO & Integrations saved successfully!");
    } else {
      toast.error(res.error || "Failed to save settings");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm font-medium text-muted-foreground">
        Loading SEO & Integrations...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl font-sans pb-12">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          SEO & Analytics Integrations
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure search engine verification, default meta tags, and advertising tracking pixels.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Global Meta Section */}
        <div className="glass-card p-6 md:p-8 rounded-xl shadow-xs border border-border space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Search className="text-primary" size={20} />
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
              Search Engine Optimization (SEO)
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-foreground">
              Default Title Tag
            </label>
            <input
              {...register("title", { required: true })}
              className="w-full border border-border rounded-md p-3 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-foreground"
              placeholder="e.g. My Store | Premium Collection"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-foreground">
              Default Meta Description
            </label>
            <textarea
              {...register("description", { required: true })}
              className="w-full border border-border rounded-md p-3 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-sm text-foreground h-28"
              placeholder="e.g. Explore our curated collections designed for the modern individual."
            />
          </div>
        </div>

        {/* Google Search Console */}
        <div className="glass-card p-6 md:p-8 rounded-xl shadow-xs border border-blue-500/30 bg-blue-500/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Radio className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                Google Search Console
              </h2>
              <p className="text-xs text-muted-foreground">
                Verify domain ownership to index pages and track search rankings.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-foreground">
              Google Site Verification Code / Tag
            </label>
            <input
              {...register("googleSearchConsoleTag")}
              className="w-full border border-border rounded-md p-3 bg-background focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-xs font-mono text-foreground"
              placeholder='e.g. abc123xyz or <meta name="google-site-verification" content="..." />'
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Paste your Google site verification code or the full HTML meta tag from Google Search Console. It will be automatically injected into your storefront&apos;s &lt;head&gt;.
            </p>
          </div>
        </div>

        {/* Meta Pixel & GA4 */}
        <div className="glass-card p-6 md:p-8 rounded-xl shadow-xs border border-border space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Activity className="text-emerald-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                Tracking & Conversion Pixels
              </h2>
              <p className="text-xs text-muted-foreground">
                Track visitors, pageviews, and e-commerce conversions across advertising platforms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta Pixel */}
            <div className="p-5 border border-indigo-500/20 bg-indigo-500/5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <h3 className="font-bold text-sm text-foreground">Meta Pixel (Facebook Pixel)</h3>
              </div>
              <input
                {...register("metaPixelId")}
                className="w-full border border-border rounded-md p-3 bg-background focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-xs font-mono text-foreground"
                placeholder="e.g. 123456789012345"
              />
              <p className="text-[11px] text-muted-foreground">
                Automatically tracks PageView, ViewContent, AddToCart, InitiateCheckout, AddPaymentInfo, and Purchase events.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">PageView ✓</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">ViewContent ✓</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">AddToCart ✓</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">InitiateCheckout ✓</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">AddPaymentInfo ✓</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">Purchase ✓</span>
              </div>
            </div>

            {/* Google Analytics GA4 */}
            <div className="p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.84 2.9v18.2c0 .5-.4.9-.9.9h-3c-.5 0-.9-.4-.9-.9V2.9c0-.5.4-.9.9-.9h3c.5 0 .9.4.9.9zM14.4 8.5v12.6c0 .5-.4.9-.9.9h-3c-.5 0-.9-.4-.9-.9V8.5c0-.5.4-.9.9-.9h3c.5 0 .9.4.9.9zM5.96 14.1v7c0 .5-.4.9-.9.9h-3c-.5 0-.9-.4-.9-.9v-7c0-.5.4-.9.9-.9h3c.5 0 .9.4.9.9z" />
                </svg>
                <h3 className="font-bold text-sm text-foreground">Google Analytics (GA4)</h3>
              </div>
              <input
                {...register("googleAnalyticsId")}
                className="w-full border border-border rounded-md p-3 bg-background focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none text-xs font-mono text-foreground"
                placeholder="e.g. G-XXXXXXXXXX"
              />
              <p className="text-[11px] text-muted-foreground">
                Tracks visitor metrics, page performance, and user engagement in GA4.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 cursor-pointer w-full sm:w-auto"
        >
          <Save size={16} />
          {saving ? "Saving Changes..." : "Save SEO & Integrations"}
        </button>
      </form>
    </div>
  );
}

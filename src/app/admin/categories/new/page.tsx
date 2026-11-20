"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { fetchCategoriesAction, createCategoryAction } from "@/server/actions/categoryActions";
import { fetchSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { uploadImageAction, uploadVideoAction } from "@/server/actions/uploadActions";
import { ICategory } from "@/server/db/models/Category";
import { ArrowLeft, Save } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import Link from "next/link";

interface ICategoryInput {
  name: string;
  slug?: string;
  type?: string;
  parent?: string;
  metaTitle?: string;
  metaDescription?: string;
  bannerImage?: string;
  bannerVideo?: string;
  ogImage?: string;
  isFeatured?: boolean;
  isCustomize2?: boolean;
  isCustomize3?: boolean;
  themeConfig?: {
    theme?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

export default function CreateCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);
  const [uploadingBannerVideo, setUploadingBannerVideo] = useState(false);
  const [sectionNames, setSectionNames] = useState({
    featured: "Shop by Category",
    sec2: "Customize",
    sec3: "Top Selling",
  });
  
  const { register, handleSubmit, setValue, watch, control } = useForm<ICategoryInput>({
    defaultValues: {
      name: "",
      parent: "",
      metaTitle: "",
      metaDescription: "",
      bannerImage: undefined,
      bannerVideo: "",
      ogImage: undefined,
      isFeatured: false,
      isCustomize2: false,
      isCustomize3: false,
      themeConfig: {
        theme: "",
        backgroundColor: "",
        textColor: ""
      }
    }
  });

  const bannerImage = watch("bannerImage");
  const bannerVideo = watch("bannerVideo");
  const ogImage = watch("ogImage");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "bannerImage" | "ogImage") => {
    if (!e.target.files || e.target.files.length === 0) return;
    field === "bannerImage" ? setUploadingBanner(true) : setUploadingOg(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    
    const res = await uploadImageAction(formData);
    if (res.success && res.url) {
      setValue(field, res.url);
    } else {
      alert("Failed to upload image: " + res.error);
    }
    field === "bannerImage" ? setUploadingBanner(false) : setUploadingOg(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingBannerVideo(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    
    const res = await uploadVideoAction(formData);
    if (res.success && res.url) {
      setValue("bannerVideo", res.url);
    } else {
      alert("Failed to upload video: " + res.error);
    }
    setUploadingBannerVideo(false);
  };

  useEffect(() => {
    fetchSiteSettingsAction(true).then((sRes) => {
      if (sRes.success && sRes.data) {
        setSectionNames({
          featured: sRes.data.featuredCategoriesSection?.heading?.trim() || "Shop by Category",
          sec2: sRes.data.featuredProductsSection2?.heading?.trim() || "Customize",
          sec3: sRes.data.featuredProductsSection3?.heading?.trim() || "Top Selling",
        });
      }
    });

    const loadCategories = async () => {
      const res = await fetchCategoriesAction();
      if (res.success) setCategories(res.data);
      setLoading(false);
    };
    loadCategories();

    const params = new URLSearchParams(window.location.search);
    const parentParam = params.get("parent");
    if (parentParam) {
      setValue("parent", parentParam);
    }
  }, [setValue]);

  const onSubmit = async (data: ICategoryInput) => {
    setSaving(true);
    const payload = { ...data, type: data.type || "standard" } as any;
    if (!payload.parent) delete payload.parent;
    
    const res = await createCategoryAction(payload);
    if (res.success) {
      router.push("/admin/categories");
    } else {
      alert("Error creating category: " + res.error);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse">Loading form...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-20 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="text-muted-foreground hover:text-foreground transition-colors bg-muted/50 p-2 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Create Category</h1>
            <p className="text-muted-foreground mt-1">Add a new category or collection</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Creating..." : "Create Category"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="glass-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Name</label>
              <input {...register("name", { required: true })} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="e.g. Summer Collection" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Parent Category</label>
              <select {...register("parent" as any)} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none">
                <option value="">None (Top Level)</option>
                {categories.map((cat) => (
                  <option key={String(cat._id)} value={String(cat._id)}>
                    {cat.parent ? "— " : ""}{cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Homepage & Layout Visibility Sections */}
        <div className="glass-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h2 className="text-xl font-bold mb-4">Homepage Visibility & Displays</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
              <div>
                <p className="font-bold text-sm text-foreground">
                  Feature on {sectionNames.featured}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Primary section (Featured Categories)</p>
              </div>
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <ToggleSwitch checked={field.value || false} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
              <div>
                <p className="font-bold text-sm text-foreground">
                  Feature on {sectionNames.sec2}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Secondary section (Customize 2)</p>
              </div>
              <Controller
                name="isCustomize2"
                control={control}
                render={({ field }) => (
                  <ToggleSwitch checked={field.value || false} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
              <div>
                <p className="font-bold text-sm text-foreground">
                  Feature on {sectionNames.sec3}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Tertiary section (Customize 3)</p>
              </div>
              <Controller
                name="isCustomize3"
                control={control}
                render={({ field }) => (
                  <ToggleSwitch checked={field.value || false} onChange={field.onChange} />
                )}
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-6">SEO & Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Meta Title</label>
              <input {...register("metaTitle")} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Meta Description</label>
              <input {...register("metaDescription")} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Banner Image</label>
              {bannerImage ? (
                <div className="relative group rounded-md border border-border overflow-hidden aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bannerImage} alt="Banner" className="object-cover w-full h-full" />
                  <button type="button" onClick={() => setValue("bannerImage", undefined)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">&times;</button>
                </div>
              ) : (
                <label className="cursor-pointer block text-center border-2 border-dashed border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                  {uploadingBanner ? "Uploading..." : "Click to upload Banner"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "bannerImage")} disabled={uploadingBanner} />
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Banner Video</label>
              {bannerVideo ? (
                <div className="relative group rounded-md border border-border overflow-hidden aspect-video bg-muted flex items-center justify-center">
                  <video src={bannerVideo} className="w-full h-full object-cover" controls muted />
                  <button type="button" onClick={() => setValue("bannerVideo", "")} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs z-10">&times;</button>
                </div>
              ) : (
                <label className="cursor-pointer block text-center border-2 border-dashed border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                  {uploadingBannerVideo ? "Uploading..." : "Click to upload Banner Video"}
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoUpload} disabled={uploadingBannerVideo} />
                </label>
              )}
              <p className="text-xs text-muted-foreground mt-1">Used as background in Hero section.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-foreground">OG Image</label>
              {ogImage ? (
                <div className="relative group rounded-md border border-border overflow-hidden aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ogImage} alt="OG Image" className="object-cover w-full h-32 md:w-64" />
                  <button type="button" onClick={() => setValue("ogImage", undefined)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">&times;</button>
                </div>
              ) : (
                <label className="cursor-pointer block text-center border-2 border-dashed border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                  {uploadingOg ? "Uploading..." : "Click to upload OG Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "ogImage")} disabled={uploadingOg} />
                </label>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

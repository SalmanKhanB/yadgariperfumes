"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { fetchCategoryByIdAction, fetchCategoriesAction, updateCategoryAction } from "@/server/actions/categoryActions";
import { fetchSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { uploadImageAction, uploadVideoAction } from "@/server/actions/uploadActions";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ICategory } from "@/server/db/models/Category";

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

export default function CategoryEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);
  const [uploadingBannerVideo, setUploadingBannerVideo] = useState(false);
  const [sectionNames, setSectionNames] = useState({
    featured: "Shop by Category",
    sec2: "Featured Collection 1",
    sec3: "Featured Collection 2",
  });

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm<ICategoryInput>({
    defaultValues: {
      name: "",
      slug: "",
      type: "standard",
      parent: "",
      metaTitle: "",
      metaDescription: "",
      bannerImage: "",
      bannerVideo: "",
      ogImage: "",
      isFeatured: false,
      isCustomize2: false,
      isCustomize3: false,
      themeConfig: { theme: "", backgroundColor: "", textColor: "" }
    }
  });

  const bannerImage = watch("bannerImage");
  const bannerVideo = watch("bannerVideo");
  const ogImage = watch("ogImage");

  useEffect(() => {
    async function loadData() {
      fetchSiteSettingsAction(true).then((sRes) => {
        if (sRes.success && sRes.data) {
          setSectionNames({
            featured: sRes.data.featuredCategoriesSection?.heading?.trim() || "Shop by Category",
            sec2: sRes.data.featuredProductsSection2?.heading?.trim() || "Featured Collection 1",
            sec3: sRes.data.featuredProductsSection3?.heading?.trim() || "Featured Collection 2",
          });
        }
      });

      const [categoryRes, allCategoriesRes] = await Promise.all([
        fetchCategoryByIdAction(resolvedParams.id),
        fetchCategoriesAction()
      ]);

      if (allCategoriesRes.success && allCategoriesRes.data) {
        // Filter out current category from parent list to prevent self-referencing
        setCategories(allCategoriesRes.data.filter((c: any) => String(c._id) !== resolvedParams.id));
      }

      if (categoryRes.success && categoryRes.data) {
        const cat = categoryRes.data;
        reset({
          name: cat.name || "",
          slug: cat.slug || "",
          type: cat.type || "standard",
          parent: cat.parent ? (typeof cat.parent === "object" ? String((cat.parent as any)._id) : String(cat.parent)) : "",
          metaTitle: cat.metaTitle || "",
          metaDescription: cat.metaDescription || "",
          bannerImage: cat.bannerImage || "",
          bannerVideo: cat.bannerVideo || "",
          ogImage: cat.ogImage || "",
          isFeatured: cat.isFeatured || false,
          isCustomize2: cat.isCustomize2 || false,
          isCustomize3: cat.isCustomize3 || false,
          themeConfig: cat.themeConfig || { theme: "", backgroundColor: "", textColor: "" }
        });
      } else {
        alert("Category not found");
        router.push("/admin/categories");
      }
      setLoading(false);
    }
    loadData();
  }, [resolvedParams.id, reset, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "bannerImage" | "ogImage") => {
    if (!e.target.files || e.target.files.length === 0) return;
    field === "bannerImage" ? setUploadingBanner(true) : setUploadingOg(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    
    const res = await uploadImageAction(formData);
    if (res.success && res.url) {
      setValue(field, res.url, { shouldDirty: true });
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
      setValue("bannerVideo", res.url, { shouldDirty: true });
    } else {
      alert("Failed to upload video: " + res.error);
    }
    setUploadingBannerVideo(false);
  };

  const onSubmit = async (data: ICategoryInput) => {
    setSaving(true);
    const payload = { ...data } as any;
    if (!payload.parent) payload.parent = null;

    const res = await updateCategoryAction(resolvedParams.id, payload);
    if (res.success) {
      alert("Category updated successfully!");
      router.push("/admin/categories");
    } else {
      alert("Error updating category: " + res.error);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse">Loading category settings...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      {/* Top Bar / Header */}
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-20 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="text-muted-foreground hover:text-foreground transition-colors bg-muted/50 p-2 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Edit Category</h1>
            <p className="text-muted-foreground mt-1">Configure category details, parent category, SEO and media</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Category"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Details */}
        <div className="glass-card p-6 rounded-xl border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Name *</label>
              <input 
                {...register("name", { required: "Category name is required" })} 
                className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
                placeholder="e.g. Summer Collection" 
              />
              {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Slug</label>
              <input 
                {...register("slug")} 
                className="w-full border border-border rounded-md p-2.5 bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Parent Category</label>
              <select {...register("parent" as any)} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none">
                <option value="">None (Top Level Category)</option>
                {categories.map((cat) => (
                  <option key={String(cat._id)} value={String(cat._id)}>
                    {cat.parent ? "— " : ""}{cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Category Type</label>
              <select {...register("type")} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none">
                <option value="standard">Standard</option>
                <option value="collection">Collection</option>
                <option value="featured">Featured</option>
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

        {/* Media & Banners */}
        <div className="glass-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <h2 className="text-xl font-bold mb-2">Media & Hero Banners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Banner Image</label>
              {bannerImage ? (
                <div className="relative group rounded-md border border-border overflow-hidden aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bannerImage} alt="Banner" className="object-cover w-full h-full" />
                  <button type="button" onClick={() => setValue("bannerImage", "", { shouldDirty: true })} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer">&times;</button>
                </div>
              ) : (
                <label className="cursor-pointer block text-center border-2 border-dashed border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                  {uploadingBanner ? "Uploading..." : "Click to upload Banner Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "bannerImage")} disabled={uploadingBanner} />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Banner Video</label>
              {bannerVideo ? (
                <div className="relative group rounded-md border border-border overflow-hidden aspect-video bg-muted flex items-center justify-center">
                  <video src={bannerVideo} className="w-full h-full object-cover" controls muted />
                  <button type="button" onClick={() => setValue("bannerVideo", "", { shouldDirty: true })} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs z-10 cursor-pointer">&times;</button>
                </div>
              ) : (
                <label className="cursor-pointer block text-center border-2 border-dashed border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                  {uploadingBannerVideo ? "Uploading..." : "Click to upload Banner Video"}
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoUpload} disabled={uploadingBannerVideo} />
                </label>
              )}
              <p className="text-xs text-muted-foreground mt-1">Used as a background video in the Hero section.</p>
            </div>
          </div>
        </div>

        {/* SEO & Open Graph */}
        <div className="glass-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <h2 className="text-xl font-bold mb-2">SEO & Social Sharing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Meta Title</label>
              <input {...register("metaTitle")} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Search engine title..." />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Meta Description</label>
              <input {...register("metaDescription")} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Search engine description..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-foreground">Social Share Image (OG Image)</label>
              {ogImage ? (
                <div className="relative group rounded-md border border-border overflow-hidden aspect-video bg-muted max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ogImage} alt="OG Image" className="object-cover w-full h-full" />
                  <button type="button" onClick={() => setValue("ogImage", "", { shouldDirty: true })} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer">&times;</button>
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

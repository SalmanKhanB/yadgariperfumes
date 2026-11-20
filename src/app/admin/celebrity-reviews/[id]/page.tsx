"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { fetchCelebrityReviewByIdAction, saveCelebrityReviewAction } from "@/server/actions/celebrityReviewActions";
import { fetchProductsAction } from "@/server/actions/productActions";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Play, ChevronDown, Check, Search } from "lucide-react";

interface ICelebrityReviewInput {
  celebrityName: string;
  videoIframe: string;
  isActive: boolean;
  order: number;
  productId: string | null;
}

export default function EditCelebrityReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [iframePreview, setIframePreview] = useState("");

  const [products, setProducts] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ICelebrityReviewInput>({
    defaultValues: {
      celebrityName: "",
      videoIframe: "",
      isActive: true,
      order: 0,
      productId: ""
    }
  });

  const watchIframe = watch("videoIframe");

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    async function load() {
      if (!resolvedParams) return;
      const productsRes = await fetchProductsAction({ status: "active" });
      if (productsRes.success) setProducts(productsRes.data);

      if (resolvedParams.id !== "new") {
        const res = await fetchCelebrityReviewByIdAction(resolvedParams.id);
        if (res.success && res.data) {
          reset({
            celebrityName: res.data.celebrityName,
            videoIframe: res.data.videoIframe,
            isActive: res.data.isActive,
            order: res.data.order,
            productId: res.data.productId || ""
          });
          setIframePreview(res.data.videoIframe);
        } else {
          alert("Review not found");
          router.push("/admin/celebrity-reviews");
        }
      }
      setLoading(false);
    }
    load();
  }, [resolvedParams, reset, router]);

  // Update preview 1 second after typing stops
  useEffect(() => {
    const timeoutId = setTimeout(() => setIframePreview(watchIframe), 1000);
    return () => clearTimeout(timeoutId);
  }, [watchIframe]);

  const onSubmit = async (data: ICelebrityReviewInput) => {
    if (!resolvedParams) return;
    setSaving(true);
    const payload = {
      ...data,
      productId: data.productId === "" ? null : data.productId
    } as any;
    const res = await saveCelebrityReviewAction(
      resolvedParams.id === "new" ? null : resolvedParams.id, 
      payload
    );
    if (res.success) {
      router.push("/admin/celebrity-reviews");
      router.refresh();
    } else {
      alert("Failed to save: " + res.error);
      setSaving(false);
    }
  };

  if (loading || !resolvedParams) {
    return <div className="p-8 flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  const isNew = resolvedParams.id === "new";

  return (
    <div className="p-8 max-w-[60rem] mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/celebrity-reviews" className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-black tracking-tight">{isNew ? "Add Celebrity Review" : "Edit Celebrity Review"}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="glass-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Celebrity Name</label>
              <input 
                type="text"
                {...register("celebrityName", { required: "Name is required" })}
                placeholder="e.g. Gordon Ramsay"
                className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              />
              {errors.celebrityName && <span className="text-red-500 text-sm mt-1">{errors.celebrityName.message}</span>}
              </div>

              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Display Location</label>
                <div 
                  className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary font-bold flex items-center justify-between cursor-pointer"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="truncate">
                    {watch("productId") === "" || watch("productId") === null 
                      ? "General (Homepage)" 
                      : products.find(p => p._id === watch("productId"))?.name || "Unknown Product"}
                  </span>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </div>
                
                {dropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-background border border-border rounded-xl shadow-xl max-h-64 overflow-y-auto overflow-hidden">
                    <div className="sticky top-0 bg-background border-b border-border p-2 z-10">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-muted border-none rounded-md py-2 pl-9 pr-3 text-sm outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div 
                      className={`px-4 py-3 hover:bg-muted cursor-pointer flex items-center justify-between transition-colors ${!watch("productId") ? 'bg-primary/10 text-primary' : ''}`}
                      onClick={() => {
                        setValue("productId", "");
                        setDropdownOpen(false);
                      }}
                    >
                      <span className="font-bold">General (Homepage)</span>
                      {!watch("productId") && <Check size={16} />}
                    </div>
                    {products.filter(p => (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                      <div 
                        key={p._id}
                        className={`px-4 py-3 hover:bg-muted cursor-pointer flex items-center justify-between transition-colors ${watch("productId") === p._id ? 'bg-primary/10 text-primary' : ''}`}
                        onClick={() => {
                          setValue("productId", p._id);
                          setDropdownOpen(false);
                        }}
                      >
                        <span className="truncate pr-4 text-sm font-semibold">{p.name || "Untitled Product"}</span>
                        {watch("productId") === p._id && <Check size={16} className="shrink-0" />}
                      </div>
                    ))}
                    {products.filter(p => (p.name || "").toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="p-4 text-center text-muted-foreground text-sm">No products found.</div>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">Choose whether this review displays generally on the homepage or is linked to a specific product.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Display Order</label>
              <input 
                type="number"
                {...register("order", { valueAsNumber: true })}
                placeholder="0"
                className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Video Iframe Code</label>
            <textarea 
              {...register("videoIframe", { required: "Iframe code is required" })}
              rows={4}
              placeholder='<iframe width="560" height="315" src="..." frameborder="0" allowfullscreen></iframe>'
              className="w-full border border-border rounded-md p-2.5 bg-background font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
            />
            {errors.videoIframe && <span className="text-red-500 text-sm mt-1">{errors.videoIframe.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-4 text-foreground">Live Preview</label>
            <div className="max-w-[300px] mx-auto">
              {iframePreview ? (
                <div 
                  className="w-full aspect-[9/16] bg-black rounded-lg overflow-hidden border border-border flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: iframePreview }}
                />
              ) : (
                <div className="w-full aspect-[9/16] bg-muted/50 rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                  <Play size={48} className="mb-4 opacity-50" />
                  <p className="text-center px-4">Paste an iframe to preview</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <label className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors">
              <input 
                type="checkbox" 
                {...register("isActive")}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <div className="font-bold">Active Status</div>
                <div className="text-sm text-muted-foreground">Show this video review on the storefront</div>
              </div>
            </label>
          </div>
        </div>

        <div className="fixed bottom-0 left-64 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border flex justify-end gap-4 z-40">
          <button 
            type="button"
            onClick={() => router.push("/admin/celebrity-reviews")}
            className="px-6 py-2.5 font-bold rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="bg-primary text-primary-foreground px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

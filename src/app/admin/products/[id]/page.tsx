"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { fetchProductByIdAction, createProductAction, updateProductAction, fetchProductsAction, fetchProductsByIdsAction } from "@/server/actions/productActions";
import { fetchCategoriesAction } from "@/server/actions/categoryActions";
import { fetchSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { fetchAllReviewsByProductIdAction, updateReviewStatusAction, deleteReviewAction, adminSubmitReviewAction } from "@/server/actions/reviewActions";
import { uploadImageAction } from "@/server/actions/uploadActions";
import { ICategory } from "@/server/db/models/Category";
import { LiveSerpPreview } from "@/components/seo/LiveSerpPreview";
import { SocialCardPreview } from "@/components/seo/SocialCardPreview";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ThemePreview } from "@/components/admin/ThemePreview";
import { Save, Plus, Trash2, ShieldAlert, Sparkles, Sliders, X, Search, Check, Layers, Loader2, ChevronUp, ChevronDown, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";

function TabPointsEditor({ points, onChange }: { points: string[], onChange: (pts: string[]) => void }) {
  const movePoint = (from: number, to: number) => {
    if (to < 0 || to >= points.length || from === to) return;
    const newPts = [...points];
    const [removed] = newPts.splice(from, 1);
    newPts.splice(to, 0, removed);
    onChange(newPts);
  };

  return (
    <div className="space-y-2">
      {points.map((pt, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-muted/40 rounded border border-border/60 p-0.5">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => movePoint(i, i - 1)}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition"
              title="Move Point Up"
            >
              <ChevronUp size={13} />
            </button>
            <button
              type="button"
              disabled={i === points.length - 1}
              onClick={() => movePoint(i, i + 1)}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition"
              title="Move Point Down"
            >
              <ChevronDown size={13} />
            </button>
          </div>
          <input 
            value={pt || ""} 
            onChange={(e) => {
              const newPts = [...points];
              newPts[i] = e.target.value;
              onChange(newPts);
            }}
            className="flex-1 border border-border rounded-md p-2 text-sm bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
            placeholder={`Point ${i + 1}`}
          />
          <button type="button" onClick={() => {
            const newPts = [...points];
            newPts.splice(i, 1);
            onChange(newPts);
          }} className="p-2 text-muted-foreground hover:text-red-500 transition">
            <X size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...points, ""])} className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition cursor-pointer">
        <Plus size={14} /> Add Point
      </button>
    </div>
  );
}

function RelatedProductsSelector({ 
  value, 
  onChange,
  currentProductId
}: { 
  value: string[], 
  onChange: (val: string[]) => void,
  currentProductId?: string
}) {
  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [pendingSelectedIds, setPendingSelectedIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const MAX_RELATED = 4;
  const remainingSlots = Math.max(0, MAX_RELATED - value.length);

  // Load selected products initially and keep in sync
  useEffect(() => {
    if (!value || value.length === 0) {
      if (selectedProducts.length > 0) setSelectedProducts([]);
      return;
    }
    const currentSelectedIds = selectedProducts.map(p => String(p._id));
    const valueIds = value.map(v => String(v));
    const isSame = currentSelectedIds.length === valueIds.length && valueIds.every(id => currentSelectedIds.includes(id));
    if (!isSame) {
      fetchProductsByIdsAction(valueIds).then(res => {
        if (res.success && res.data) {
          setSelectedProducts(res.data);
        }
      });
    }
  }, [value]);

  // Load all available catalog products on mount or on focus
  const loadCatalog = async () => {
    if (catalog.length > 0) return;
    setLoading(true);
    try {
      const res = await fetchProductsAction({});
      if (res.success && res.data) {
        setCatalog(res.data);
      }
    } catch (err) {
      console.error("Failed to load catalog products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products by search term (instant on 1st character as well as browse all)
  const availableProducts = catalog.filter((p: any) => {
    if (currentProductId && String(p._id) === String(currentProductId)) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const nameMatch = (p.name || "").toLowerCase().includes(term);
    const skuMatch = (p.sku || "").toLowerCase().includes(term);
    return nameMatch || skuMatch;
  });

  const addSingleProduct = (product: any) => {
    if (value.includes(product._id)) return;
    if (value.length >= MAX_RELATED) {
      alert(`You can only add up to ${MAX_RELATED} related products.`);
      return;
    }
    const newVals = [...value, product._id];
    onChange(newVals);
    setSelectedProducts([...selectedProducts, product]);
    setPendingSelectedIds(prev => prev.filter(id => id !== product._id));
  };

  const removeProduct = (id: string) => {
    onChange(value.filter(v => v !== id));
    setSelectedProducts(selectedProducts.filter(p => p._id !== id));
  };

  const togglePendingSelect = (productId: string) => {
    if (value.includes(productId)) return; // already added

    setPendingSelectedIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        if (prev.length >= remainingSlots) {
          alert(`You can only select up to ${remainingSlots} more product${remainingSlots === 1 ? '' : 's'} (maximum ${MAX_RELATED} related products).`);
          return prev;
        }
        return [...prev, productId];
      }
    });
  };

  const addAllPending = () => {
    if (pendingSelectedIds.length === 0) return;
    const toAddIds = pendingSelectedIds.slice(0, remainingSlots);
    const productsToAdd = catalog.filter(p => toAddIds.includes(p._id));
    const newVals = [...value, ...toAddIds];
    onChange(newVals);
    setSelectedProducts([...selectedProducts, ...productsToAdd]);
    setPendingSelectedIds([]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectAllFiltered = () => {
    const unaddedFiltered = availableProducts.filter(p => !value.includes(p._id));
    const idsToSelect = unaddedFiltered.slice(0, remainingSlots).map(p => p._id);
    setPendingSelectedIds(idsToSelect);
  };

  return (
    <div className="space-y-4">
      {/* Counter & Status Header */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Selected: <strong className="text-foreground">{value.length}</strong> / {MAX_RELATED}
        </span>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onChange([]);
              setSelectedProducts([]);
            }}
            className="text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Selected Products Cards Grid */}
      {selectedProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {selectedProducts.map((p, index) => {
            const imgUrl = typeof p.images?.[0] === 'string' ? p.images[0] : p.images?.[0]?.url;
            return (
              <div key={p._id} className="relative bg-background rounded-xl border border-border overflow-hidden shadow-xs group transition-all hover:border-foreground/30">
                <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                  #{index + 1}
                </div>
                <button 
                  type="button" 
                  onClick={() => removeProduct(p._id)} 
                  title="Remove from related products"
                  className="absolute top-2 right-2 bg-background/90 hover:bg-red-500 hover:text-white text-muted-foreground p-1.5 rounded-full z-10 opacity-80 group-hover:opacity-100 transition-all border border-border shadow-xs cursor-pointer"
                >
                  <X size={14} />
                </button>
                <div className="aspect-[4/5] bg-muted relative w-full overflow-hidden">
                  {imgUrl ? (
                    <img src={imgUrl} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground font-mono">No image</div>
                  )}
                </div>
                <div className="p-3 bg-card">
                  <h3 className="text-xs sm:text-sm font-bold truncate text-foreground" title={p.name}>{p.name}</h3>
                  <p className="text-xs font-mono font-semibold text-primary mt-0.5">{formatPrice(p.price)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Search Input, Browse All Button, and Dropdown Popover */}
      {remainingSlots > 0 ? (
        <div className="relative" ref={dropdownRef}>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => {
                  loadCatalog();
                  setIsOpen(true);
                }}
                placeholder="Search products to add (or browse all)..."
                className="w-full border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                loadCatalog();
                setIsOpen(!isOpen);
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
                isOpen
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/40 hover:bg-muted text-foreground border-border"
              }`}
            >
              <Layers size={14} />
              {isOpen ? "Close List" : `Browse All (${catalog.length})`}
            </button>
          </div>

          {/* DROPDOWN LIST WITH MULTI-SELECT */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header inside dropdown */}
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono uppercase tracking-wider font-bold text-muted-foreground">
                    Available Products ({availableProducts.length})
                  </span>
                  {searchTerm && (
                    <span className="text-[11px] bg-background px-2 py-0.5 rounded-full border border-border text-foreground">
                      filter: &quot;{searchTerm}&quot;
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {pendingSelectedIds.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setPendingSelectedIds([])}
                      className="text-primary hover:underline font-mono text-[11px] cursor-pointer"
                    >
                      Deselect all
                    </button>
                  ) : (
                    availableProducts.filter(p => !value.includes(p._id)).length > 0 && remainingSlots > 1 && (
                      <button
                        type="button"
                        onClick={selectAllFiltered}
                        className="text-primary hover:underline font-mono text-[11px] cursor-pointer"
                      >
                        Select up to {remainingSlots}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Product List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                {loading && catalog.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary" /> Loading products...
                  </div>
                ) : availableProducts.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No products found matching &quot;{searchTerm}&quot;.
                  </div>
                ) : (
                  availableProducts.map(p => {
                    const isAlreadyAdded = value.includes(p._id);
                    const isPending = pendingSelectedIds.includes(p._id);
                    const imgUrl = typeof p.images?.[0] === 'string' ? p.images[0] : p.images?.[0]?.url;

                    return (
                      <div
                        key={p._id}
                        onClick={() => {
                          if (!isAlreadyAdded) togglePendingSelect(p._id);
                        }}
                        className={`p-3 flex items-center justify-between gap-3 transition-colors select-none ${
                          isAlreadyAdded
                            ? "bg-muted/20 opacity-60 cursor-not-allowed"
                            : isPending
                            ? "bg-primary/10 hover:bg-primary/15 cursor-pointer"
                            : "hover:bg-muted/50 cursor-pointer"
                        }`}
                      >
                        {/* Checkbox + Thumbnail + Details */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            disabled={isAlreadyAdded}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePendingSelect(p._id);
                            }}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                              isAlreadyAdded
                                ? "bg-muted border-border text-muted-foreground cursor-not-allowed"
                                : isPending
                                ? "bg-primary border-primary text-primary-foreground shadow-2xs cursor-pointer"
                                : "border-muted-foreground/40 bg-background hover:border-foreground cursor-pointer"
                            }`}
                          >
                            {(isAlreadyAdded || isPending) && <Check size={12} strokeWidth={3} />}
                          </button>

                          <div className="w-10 h-10 rounded-lg bg-muted relative overflow-hidden shrink-0 border border-border/40">
                            {imgUrl ? (
                              <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                            <p className="text-[11px] font-mono text-muted-foreground">{formatPrice(p.price)}</p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="shrink-0 flex items-center gap-2">
                          {isAlreadyAdded ? (
                            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border">
                              Added
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addSingleProduct(p);
                              }}
                              className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-background hover:bg-primary hover:text-primary-foreground text-foreground border border-border transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={12} /> Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-between gap-3">
                <span className="text-xs font-mono text-muted-foreground">
                  {pendingSelectedIds.length > 0 ? (
                    <>
                      <strong className="text-foreground">{pendingSelectedIds.length}</strong> product{pendingSelectedIds.length > 1 ? 's' : ''} selected
                    </>
                  ) : (
                    <span>Tip: Click any product or checkbox to select multiple</span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-mono uppercase hover:bg-muted transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  {pendingSelectedIds.length > 0 && (
                    <button
                      type="button"
                      onClick={addAllPending}
                      className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider font-bold hover:bg-primary/90 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Plus size={14} />
                      Add Selected ({pendingSelectedIds.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="font-semibold text-foreground">Maximum limit reached (4 of 4 related products selected).</span>
          <span className="text-[11px]">Remove an item above to add a different product.</span>
        </div>
      )}
    </div>
  );
}

interface IProductInput {
  name: string;
  pageTitle?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  nativeDescription?: string;
  descriptionTabs?: { title: string; points: string[] }[];
  price: string | number;
  compareAtPrice?: string | number;
  unitQuantity?: string | number;
  unitType?: string;
  inventory: string | number;
  status: "active" | "draft" | "archived";
  categories?: string[];
  relatedProducts?: string[];
  iframeEmbeds?: string[];
  faqs?: { question: string; answer: string }[];
  productType: "physical" | "digital";
  hasVariants?: boolean;
  variants?: any[];
  isFeatured?: boolean;
  isCustomize2?: boolean;
  isCustomize3?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
  themeConfig?: {
    theme?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

export default function ProductEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const isNew = resolvedParams.id === "new";
  const router = useRouter();
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { formatPrice, currency } = useCurrency();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [activeTab, setActiveTab] = useState<"general" | "content">("general");
  const [reviews, setReviews] = useState<any[]>([]);
  
  // Manual Testimonial Form State
  const [newReview, setNewReview] = useState({ authorName: "", authorEmail: "", rating: 5, body: "" });

  // Custom Variants State
  const [variantsList, setVariantsList] = useState<{
    name: string;
    sku?: string;
    priceOverride?: number;
    inventory: number;
    options: { name: string; value: string }[];
  }[]>([]);

  // Manual Variant State Form
  const [newVarName, setNewVarName] = useState("");
  const [newVarSku, setNewVarSku] = useState("");
  const [newVarPrice, setNewVarPrice] = useState("");
  const [newVarInventory, setNewVarInventory] = useState("0");

  // Auto Combo Generator State
  const [opt1Name, setOpt1Name] = useState("");
  const [opt1Values, setOpt1Values] = useState("");
  const [opt2Name, setOpt2Name] = useState("");
  const [opt2Values, setOpt2Values] = useState("");

  const { register, handleSubmit, reset, watch, setValue, control } = useForm<IProductInput>({
    defaultValues: {
      productType: "physical",
      variants: variantsList,
      relatedProducts: [],
      themeConfig: {
        theme: "",
        backgroundColor: "",
        textColor: ""
      },
      descriptionTabs: [],
      iframeEmbeds: []
    }
  });

  const { fields: tabFields, append: appendTab, remove: removeTab, move: moveTab } = useFieldArray({
    control,
    name: "descriptionTabs"
  });

  const { fields: iframeFields, append: appendIframe, remove: removeIframe, move: moveIframe } = useFieldArray({
    control,
    name: "iframeEmbeds" as never // react-hook-form type issue with array of strings
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq, move: moveFaq } = useFieldArray({
    control,
    name: "faqs"
  });

  const formValues = watch();
  const previewTitle = formValues?.seo?.metaTitle || formValues?.pageTitle || formValues?.name;
  const previewDesc = formValues?.seo?.metaDescription || formValues?.shortDescription || formValues?.nativeDescription;
  const previewImage = formValues?.seo?.ogImage || (uploadedImages.length > 0 ? uploadedImages[0] : "");
  const previewSlug = formValues?.name ? formValues.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : "";
  const isVariable = watch("hasVariants");
  const selectedCategories = watch("categories") || [];
  const [sectionNames, setSectionNames] = useState({
    sec1: "Featured Products",
    sec2: "Featured Collection 1",
    sec3: "Featured Collection 2",
  });

  useEffect(() => {
    async function init() {
      fetchSiteSettingsAction(true).then((setRes) => {
        if (setRes.success && setRes.data) {
          setSectionNames({
            sec1: setRes.data.bestProductsSection?.heading?.trim() || "Featured Products",
            sec2: setRes.data.featuredProductsSection2?.heading?.trim() || "Customize",
            sec3: setRes.data.featuredProductsSection3?.heading?.trim() || "Top Selling",
          });
        }
      });

      const catRes = await fetchCategoriesAction();
      if (catRes.success) setCategories(catRes.data);

      if (!isNew) {
        const prodRes = await fetchProductByIdAction(resolvedParams.id);
        if (prodRes.success) {
          const prodData = { 
            ...prodRes.data,
            categories: prodRes.data.categories ? prodRes.data.categories.map((c: any) => c._id || c) : [],
            isFeatured: prodRes.data.isFeatured || false,
            isCustomize2: prodRes.data.isCustomize2 || false,
            isCustomize3: prodRes.data.isCustomize3 || false,
            relatedProducts: prodRes.data.relatedProducts
              ? prodRes.data.relatedProducts.map((rp: any) => typeof rp === "object" && rp !== null ? String(rp._id) : String(rp))
              : [],
          };
          const imgs = prodData.images ? prodData.images.map((img: any) => typeof img === 'string' ? img : img.url) : [];
          setUploadedImages(imgs);
          setVariantsList(prodData.variants || []);
          reset(prodData);
        }
        
        const revRes = await fetchAllReviewsByProductIdAction(resolvedParams.id);
        if (revRes.success) {
          setReviews(revRes.data);
        }
      }
      setLoading(false);
    }
    init();
  }, [isNew, resolvedParams.id, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    
    const res = await uploadImageAction(formData);
    if (res.success && res.url) {
      setUploadedImages(prev => [...prev, res.url!]);
    } else {
      alert("Failed to upload image: " + res.error);
    }
    setUploadingImage(false);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const parseOptions = (nameStr: string) => {
    const parts = nameStr.split(",");
    const options: { name: string; value: string }[] = [];
    parts.forEach(part => {
      const [k, v] = part.split(":");
      if (k && v) {
        options.push({ name: k.trim(), value: v.trim() });
      } else if (part.trim()) {
        options.push({ name: "Option", value: part.trim() });
      }
    });
    return options;
  };

  const handleAddVariant = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newVarName.trim()) {
      alert("Please enter a variant name (e.g. Size: M).");
      return;
    }
    const newVariant = {
      name: newVarName.trim(),
      sku: newVarSku.trim() || undefined,
      priceOverride: newVarPrice ? parseFloat(newVarPrice) : undefined,
      inventory: parseInt(newVarInventory || "0", 10),
      options: parseOptions(newVarName)
    };
    setVariantsList(prev => [...prev, newVariant]);
    setNewVarName("");
    setNewVarSku("");
    setNewVarPrice("");
    setNewVarInventory("0");
  };

  const handleAutoGenerate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!opt1Name.trim() || !opt1Values.trim()) {
      alert("Please enter Option 1 Name (e.g. Size) and Values (e.g. S, M, L).");
      return;
    }
    const vals1 = opt1Values.split(",").map(v => v.trim()).filter(Boolean);
    const vals2 = opt2Name.trim() && opt2Values.trim() ? opt2Values.split(",").map(v => v.trim()).filter(Boolean) : [];
    
    const generated: typeof variantsList = [];
    if (vals2.length > 0) {
      vals1.forEach(v1 => {
        vals2.forEach(v2 => {
          const name = `${opt1Name.trim()}: ${v1}, ${opt2Name.trim()}: ${v2}`;
          generated.push({
            name,
            inventory: 0,
            options: [
              { name: opt1Name.trim(), value: v1 },
              { name: opt2Name.trim(), value: v2 }
            ]
          });
        });
      });
    } else {
      vals1.forEach(v1 => {
        const name = `${opt1Name.trim()}: ${v1}`;
        generated.push({
          name,
          inventory: 0,
          options: [
            { name: opt1Name.trim(), value: v1 }
          ]
        });
      });
    }
    setVariantsList(prev => [...prev, ...generated]);
    setOpt1Name("");
    setOpt1Values("");
    setOpt2Name("");
    setOpt2Values("");
  };

  const handleRemoveVariant = (index: number) => {
    setVariantsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveVariant = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= variantsList.length || fromIndex === toIndex) return;
    setVariantsList(prev => {
      const copy = [...prev];
      const [removed] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, removed);
      return copy;
    });
  };

  const updateVariantField = (index: number, key: string, val: string) => {
    setVariantsList(prev => {
      const copy = [...prev];
      if (key === "priceOverride") {
        copy[index] = { ...copy[index], priceOverride: val ? parseFloat(val) : undefined };
      } else if (key === "inventory") {
        copy[index] = { ...copy[index], inventory: parseInt(val || "0", 10) };
      } else if (key === "sku") {
        copy[index] = { ...copy[index], sku: val || undefined };
      }
      return copy;
    });
  };

  const onSubmit = async (data: IProductInput) => {
    setSaving(true);
    const formattedData = {
      ...data,
      price: parseFloat(data.price as string),
      compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice as string) : undefined,
      unitQuantity: data.unitQuantity ? parseFloat(data.unitQuantity as string) : undefined,
      unitType: data.unitType || "ml",
      inventory: parseInt(data.inventory as string, 10),
      images: uploadedImages.map(url => ({ url })),
      relatedProducts: data.relatedProducts || [],
      variants: isVariable ? variantsList.map(v => ({
        name: v.name,
        sku: v.sku || undefined,
        priceOverride: v.priceOverride ? parseFloat(v.priceOverride as any) : undefined,
        inventory: parseInt(v.inventory as any, 10),
        options: v.options
      })) : []
    };

    let res;
    if (isNew) {
      res = await createProductAction(formattedData as any);
    } else {
      res = await updateProductAction(resolvedParams.id, formattedData as any);
    }

    if (res.success) {
      router.push("/admin/products");
    } else {
      alert("Error saving product: " + res.error);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse">Loading editor settings...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{isNew ? "Create Product" : "Edit Product"}</h1>
          <p className="text-muted-foreground mt-1">Configure product options, media galleries, pricing, and variants settings.</p>
        </div>
      </div>
      
      <div className="flex gap-6 border-b border-border">
        <button 
          type="button"
          onClick={() => setActiveTab("general")}
          className={`pb-3 font-bold transition-colors ${activeTab === 'general' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          General Data
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab("content")}
          className={`pb-3 font-bold transition-colors ${activeTab === 'content' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Content & Reviews
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        <div className={activeTab === 'general' ? 'space-y-8 block' : 'hidden'}>
          {/* GENERAL INFO */}
        <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6">
          <h2 className="text-xl font-bold border-b border-border pb-2 flex items-center gap-2"><Sliders size={20} className="text-primary" /> General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Name</label>
              <input {...register("name", { required: true })} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Page Title Override (SEO)</label>
              <input {...register("pageTitle")} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Leave empty to use base name" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-foreground">Short Description</label>
              <textarea {...register("shortDescription")} rows={2} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-foreground">Long Description</label>
              <textarea {...register("description")} rows={5} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Detailed product description..."></textarea>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-foreground">Native Language Description (e.g., Urdu Description)</label>
              <textarea {...register("nativeDescription")} rows={3} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Enter localized description here..."></textarea>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-foreground">Key Feature Tabs (Optional)</label>
                <button type="button" onClick={() => appendTab({ title: "", points: [""] })} className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition">
                  <Plus size={14} /> Add Tab
                </button>
              </div>
              
              {tabFields.length === 0 ? (
                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border border-border text-center">
                  No tabs added yet. Click "Add Tab" to create key features and details.
                </div>
              ) : (
                <div className="space-y-4">
                  {tabFields.map((field, index) => (
                    <div key={field.id} className="border border-border rounded-lg p-4 bg-muted/10 relative group">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-md">
                          Feature Tab #{index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveTab(index, index - 1)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Move Tab Up (Swap Order)"
                          >
                            <ChevronUp size={15} />
                          </button>
                          <button
                            type="button"
                            disabled={index === tabFields.length - 1}
                            onClick={() => moveTab(index, index + 1)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Move Tab Down (Swap Order)"
                          >
                            <ChevronDown size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTab(index)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-500 hover:text-red-700 transition cursor-pointer ml-1"
                            title="Remove Tab"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4 mb-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Tab Title (e.g. Key Benefits)</label>
                          <input {...register(`descriptionTabs.${index}.title` as const)} className="w-full md:w-1/2 border border-border rounded-md p-2 text-sm bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Tab Title" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Key Points</label>
                          <Controller
                            control={control}
                            name={`descriptionTabs.${index}.points` as const}
                            render={({ field }) => (
                              <TabPointsEditor points={field.value || []} onChange={field.onChange} />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Product Type</label>
              <select {...register("productType")} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none">
                <option value="physical">Physical Product (Requires Shipping)</option>
                <option value="digital">Digital Download (Instant Delivery)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Status</label>
              <select {...register("status")} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="space-y-3 mt-8">
              <div className="flex items-center gap-3">
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch checked={field.value || false} onChange={field.onChange} />
                  )}
                />
                <label className="text-sm font-bold select-none cursor-pointer text-foreground">
                  Feature on {sectionNames.sec1} <span className="text-xs font-normal text-muted-foreground">(Customize 1)</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Controller
                  name="isCustomize2"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch checked={field.value || false} onChange={field.onChange} />
                  )}
                />
                <label className="text-sm font-bold select-none cursor-pointer text-foreground">
                  Feature on {sectionNames.sec2} <span className="text-xs font-normal text-muted-foreground">(Customize 2)</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Controller
                  name="isCustomize3"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch checked={field.value || false} onChange={field.onChange} />
                  )}
                />
                <label className="text-sm font-bold select-none cursor-pointer text-foreground">
                  Feature on {sectionNames.sec3} <span className="text-xs font-normal text-muted-foreground">(Customize 3)</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Categories</label>
              
              {categories.length === 0 ? (
                <div className="w-full border border-border rounded-md p-4 bg-background">
                  <p className="text-sm text-muted-foreground">No categories available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Main Category Dropdown */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Main Category</label>
                    <select
                      className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary text-sm"
                      value={(() => {
                        const topLevel = categories.filter(c => !c.parent);
                        const selected = topLevel.find(p => selectedCategories.includes(String(p._id)));
                        return selected ? String(selected._id) : "";
                      })()}
                      onChange={(e) => {
                        const parentId = e.target.value;
                        if (!parentId) {
                          setValue("categories", [], { shouldDirty: true });
                        } else {
                          setValue("categories", [parentId], { shouldDirty: true });
                        }
                      }}
                    >
                      <option value="">Select Main Category</option>
                      {categories.filter(c => !c.parent).map(parentCat => (
                        <option key={String(parentCat._id)} value={String(parentCat._id)}>
                          {parentCat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Category Dropdown */}
                  {(() => {
                    const topLevel = categories.filter(c => !c.parent);
                    const selectedParent = topLevel.find(p => selectedCategories.includes(String(p._id)));
                    const parentId = selectedParent ? String(selectedParent._id) : "";
                    const availableSubs = parentId ? categories.filter(c => String(c.parent) === parentId) : [];
                    
                    if (availableSubs.length === 0 && !parentId) {
                      return null; // hide subcategory if no parent selected
                    }
                    
                    const selectedSub = availableSubs.find(s => selectedCategories.includes(String(s._id)));
                    const subId = selectedSub ? String(selectedSub._id) : "";

                    return (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Sub Category</label>
                        <select
                          className="w-full border border-border bg-background rounded-md p-3 outline-none focus:border-primary text-sm"
                          value={subId}
                          onChange={(e) => {
                            const newSubId = e.target.value;
                            if (!newSubId) {
                              if (parentId) setValue("categories", [parentId], { shouldDirty: true });
                              else setValue("categories", [], { shouldDirty: true });
                            } else {
                              if (parentId) setValue("categories", [parentId, newSubId], { shouldDirty: true });
                              else setValue("categories", [newSubId], { shouldDirty: true });
                            }
                          }}
                          disabled={!parentId || availableSubs.length === 0}
                        >
                          <option value="">{availableSubs.length > 0 ? "Select Sub Category" : "No subcategories"}</option>
                          {availableSubs.map(subCat => (
                            <option key={String(subCat._id)} value={String(subCat._id)}>
                              {subCat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* PRICING & INVENTORY */}
        <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6">
          <h2 className="text-xl font-bold border-b border-border pb-2">Base Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Original Price ({currency})</label>
              <input type="number" step="0.01" {...register("compareAtPrice")} placeholder="e.g. 150.00" className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Sell Price ({currency})</label>
              <input type="number" step="0.01" {...register("price", { required: true })} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" />
              {(() => {
                const orig = watch("compareAtPrice");
                const sell = watch("price");
                if (orig && sell) {
                  const origNum = parseFloat(orig as string);
                  const sellNum = parseFloat(sell as string);
                  if (origNum > sellNum) {
                    const discount = Math.round(((origNum - sellNum) / origNum) * 100);
                    return <p className="text-xs text-green-600 font-bold mt-1">Offer: {discount}% OFF</p>;
                  }
                }
                return <p className="text-xs text-muted-foreground mt-1">No offer</p>;
              })()}
              {isVariable && <p className="text-xs text-muted-foreground mt-1">Used as fallback if variants do not specify overrides.</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Unit Size / Weight</label>
              <div className="flex gap-2">
                <input type="number" step="any" {...register("unitQuantity")} placeholder="50" className="w-1/2 border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary outline-none" />
                <select {...register("unitType")} className="w-1/2 border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-semibold">
                  <option value="ml">ml</option>
                  <option value="l">L</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="oz">oz</option>
                  <option value="lbs">lbs</option>
                  <option value="pieces">pieces</option>
                  <option value="pack">pack</option>
                  <option value="items">items</option>
                  <option value="bottles">bottles</option>
                  <option value="boxes">boxes</option>
                  <option value="set">set</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">e.g. 50 ml, 1 kg, 6 pieces</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">Base Inventory Count</label>
              <input type="number" {...register("inventory")} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" disabled={isVariable} />
              {isVariable && <p className="text-xs text-amber-500 font-semibold mt-1">Managed on variant level.</p>}
            </div>
          </div>
        </div>

        {/* PRODUCT VARIATIONS BOX */}
        <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-2">
            <h2 className="text-xl font-bold">Product Variations (Variants)</h2>
            <div className="flex items-center gap-3">
              <Controller
                name="hasVariants"
                control={control}
                render={({ field }) => (
                  <ToggleSwitch checked={field.value || false} onChange={field.onChange} />
                )}
              />
              <label className="text-sm font-bold select-none cursor-pointer text-foreground">This product has variants</label>
            </div>
          </div>

          {isVariable ? (
            <div className="space-y-8">
              
              {/* Option Combinations Generator */}
              <div className="bg-muted/30 p-5 rounded-xl border border-border/60 space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-1.5"><Sparkles size={16} className="text-accent" /> Variations Combo Generator</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Instantly populate variants by entering options (e.g. Size & Colors). Separate values with commas.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Option 1 Name</label>
                    <input value={opt1Name} onChange={e => setOpt1Name(e.target.value)} placeholder="e.g. Size" className="w-full border border-border rounded p-2 bg-background text-sm" />
                  </div>
                  <div className="lg:col-span-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Option 1 Values</label>
                    <input value={opt1Values} onChange={e => setOpt1Values(e.target.value)} placeholder="e.g. S, M, L" className="w-full border border-border rounded p-2 bg-background text-sm" />
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Option 2 Name (Opt)</label>
                    <input value={opt2Name} onChange={e => setOpt2Name(e.target.value)} placeholder="e.g. Color" className="w-full border border-border rounded p-2 bg-background text-sm" />
                  </div>
                  <div className="lg:col-span-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Option 2 Values (Opt)</label>
                    <input value={opt2Values} onChange={e => setOpt2Values(e.target.value)} placeholder="e.g. Black, White" className="w-full border border-border rounded p-2 bg-background text-sm" />
                  </div>
                  <button onClick={handleAutoGenerate} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2 rounded text-sm w-full transition-colors flex items-center justify-center gap-1">
                    <Plus size={16} /> Generate
                  </button>
                </div>
              </div>

              {/* Manual Add Form */}
              <div className="bg-background/40 p-5 rounded-xl border border-dashed border-border/80 space-y-4">
                <h3 className="font-bold text-sm">Add Individual Variant</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Name (e.g. Size: M, Color: Blue)</label>
                    <input value={newVarName} onChange={e => setNewVarName(e.target.value)} placeholder="e.g. Size: M, Color: Blue" className="w-full border border-border rounded p-2 bg-background text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">SKU (Optional)</label>
                    <input value={newVarSku} onChange={e => setNewVarSku(e.target.value)} placeholder="e.g. SWEAT-BLU-M" className="w-full border border-border rounded p-2 bg-background text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Price Override (Optional)</label>
                    <input type="number" step="0.01" value={newVarPrice} onChange={e => setNewVarPrice(e.target.value)} placeholder="Leave blank to use base" className="w-full border border-border rounded p-2 bg-background text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Inventory</label>
                      <input type="number" value={newVarInventory} onChange={e => setNewVarInventory(e.target.value)} className="w-full border border-border rounded p-2 bg-background text-sm" />
                    </div>
                    <button onClick={handleAddVariant} className="bg-secondary text-secondary-foreground font-bold px-3 py-2 rounded text-sm w-1/2 flex items-center justify-center gap-1 hover:bg-secondary/90 transition-colors">
                      <Plus size={16} /> Add Variant
                    </button>
                  </div>
                </div>
              </div>

              {/* Variants List Table */}
              {variantsList.length > 0 ? (
                <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
                  <div className="px-4 py-2.5 bg-muted/30 border-b border-border text-xs text-muted-foreground font-mono flex items-center justify-between">
                    <span>
                      <strong>{variantsList.length}</strong> Variations &bull; Use ▲ ▼ arrows to swap position / ordering
                    </span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="p-4 font-bold w-24 text-center">Position</th>
                        <th className="p-4 font-bold">Variant Title</th>
                        <th className="p-4 font-bold">SKU</th>
                        <th className="p-4 font-bold">Price Override ({currency})</th>
                        <th className="p-4 font-bold">Inventory</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {variantsList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-muted-foreground w-6">
                                #{idx + 1}
                              </span>
                              <div className="flex flex-col gap-0.5 bg-muted/40 rounded border border-border/50 p-0.5">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveVariant(idx, idx - 1)}
                                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-muted transition cursor-pointer"
                                  title="Move Up"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === variantsList.length - 1}
                                  onClick={() => handleMoveVariant(idx, idx + 1)}
                                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-muted transition cursor-pointer"
                                  title="Move Down"
                                >
                                  <ChevronDown size={12} />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-foreground">
                            <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide inline-block">{item.name}</span>
                          </td>
                          <td className="p-4">
                            <input 
                              type="text" 
                              value={item.sku || ""} 
                              onChange={e => updateVariantField(idx, "sku", e.target.value)}
                              placeholder="Add SKU" 
                              className="border border-border rounded p-1 bg-background text-xs w-28 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              type="number" 
                              step="0.01" 
                              value={item.priceOverride !== undefined ? item.priceOverride : ""} 
                              onChange={e => updateVariantField(idx, "priceOverride", e.target.value)}
                              placeholder="Use Base" 
                              className="border border-border rounded p-1 bg-background text-xs w-24 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              type="number" 
                              value={item.inventory} 
                              onChange={e => updateVariantField(idx, "inventory", e.target.value)}
                              className="border border-border rounded p-1 bg-background text-xs w-20 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleRemoveVariant(idx)} className="text-red-500 hover:text-red-600 transition-colors p-1 cursor-pointer" title="Remove Variation">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed border-border/80 rounded-xl text-muted-foreground text-center">
                  <ShieldAlert size={36} className="text-amber-500 mb-2" />
                  <span className="font-bold text-sm">No variations generated yet.</span>
                  <span className="text-xs mt-1">Use the Auto Generator or the Individual form above to add variants for this product.</span>
                </div>
              )}

            </div>
          ) : (
            <div className="p-6 bg-muted/10 rounded-xl border border-border text-center text-xs text-muted-foreground">
              This product is configured as a standard single item. Enable options above to create customizable variants.
            </div>
          )}
        </div>

        {/* MEDIA */}
        <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6">
          <h2 className="text-xl font-bold border-b border-border pb-4">Media Gallery</h2>
          <ImageUploader images={uploadedImages} onChange={setUploadedImages} />
        </div>

        {/* SEO ENGINE */}
        <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6">
          <h2 className="text-xl font-bold border-b border-border pb-4">SEO Engine & Previews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Meta Title</label>
                <input {...register("seo.metaTitle" as any)} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="50-60 chars recommended" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Meta Description</label>
                <textarea {...register("seo.metaDescription" as any)} rows={3} className="w-full border border-border rounded-md p-2.5 bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="150-160 chars recommended" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">Open Graph Image (Social Sharing)</label>
                <input 
                  value={uploadedImages.length > 0 ? uploadedImages[0] : ""} 
                  readOnly 
                  disabled 
                  className="w-full border border-border rounded-md p-2.5 bg-background opacity-50 cursor-not-allowed" 
                  placeholder="Auto-populated from first product image" 
                />
              </div>
            </div>
            
            <div className="space-y-8 bg-muted/30 p-6 rounded-lg border border-border">
              <div>
                <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Search Engine Preview</h3>
                <LiveSerpPreview 
                  title={previewTitle || ""} 
                  description={previewDesc || ""} 
                  url={`https://sqodex.com/products/${previewSlug || 'example-product'}`} 
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Social Media Preview</h3>
                <SocialCardPreview 
                  title={previewTitle || ""} 
                  description={previewDesc || ""} 
                  image={previewImage || ""} 
                  url={`https://sqodex.com/products/${previewSlug || 'example-product'}`} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className={activeTab === 'general' ? 'block' : 'hidden'}>
          <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6 mt-8">
            <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center gap-2"><Sparkles size={20} className="text-primary" /> Related Products</h2>
            <p className="text-sm text-muted-foreground">Select up to 4 products to feature on this product's detail page.</p>
            <Controller
              control={control}
              name="relatedProducts"
              render={({ field }) => (
                <RelatedProductsSelector 
                  value={field.value || []} 
                  onChange={field.onChange} 
                  currentProductId={isNew ? undefined : resolvedParams.id}
                />
              )}
            />
          </div>
        </div>

        <div className={activeTab === 'content' ? 'space-y-8 block' : 'hidden'}>
          {/* Iframe Embeds */}
          <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6">
            <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center gap-2"><Sparkles size={20} className="text-primary" /> Product Video Embeds (Iframes)</h2>
            <p className="text-sm text-muted-foreground">Paste TikTok, YouTube, or Vimeo iframe codes here. These will show in a horizontal slider on the product page.</p>
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => appendIframe("")} 
                className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-primary/20 transition"
              >
                <Plus size={16} /> Add Iframe Embed
              </button>
            </div>

            {iframeFields.length > 0 && (
              <div className="space-y-4">
                {iframeFields.map((field, index) => (
                  <div key={field.id} className="relative bg-muted/30 p-4 rounded-lg border border-border group">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Video Embed #{index + 1}
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveIframe(index, index - 1)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === iframeFields.length - 1}
                          onClick={() => moveIframe(index, index + 1)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => removeIframe(index)} 
                          className="text-muted-foreground hover:text-red-500 transition p-1 rounded hover:bg-red-500/10 cursor-pointer ml-1"
                          title="Remove Embed"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      {...register(`iframeEmbeds.${index}` as const)} 
                      rows={3}
                      className="w-full border border-border rounded-md p-3 text-sm bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-mono" 
                      placeholder={'<iframe src="..."></iframe>'} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product FAQs */}
          <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6 mt-8">
            <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center gap-2"><Sparkles size={20} className="text-primary" /> Frequently Asked Questions (FAQs)</h2>
            <p className="text-sm text-muted-foreground">Add common questions and answers that will appear on the product page.</p>
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => appendFaq({ question: "", answer: "" })} 
                className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-primary/20 transition cursor-pointer"
              >
                <Plus size={16} /> Add FAQ
              </button>
            </div>

            {faqFields.length > 0 && (
              <div className="space-y-4">
                {faqFields.map((field, index) => (
                  <div key={field.id} className="relative bg-muted/30 p-4 rounded-lg border border-border group space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                        FAQ Item #{index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveFaq(index, index - 1)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Move FAQ Up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === faqFields.length - 1}
                          onClick={() => moveFaq(index, index + 1)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Move FAQ Down"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => removeFaq(index)} 
                          className="text-muted-foreground hover:text-red-500 transition p-1 rounded hover:bg-red-500/10 cursor-pointer ml-1"
                          title="Remove FAQ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Question</label>
                      <input 
                        {...register(`faqs.${index}.question` as const, { required: true })} 
                        className="w-full border border-border rounded-md p-2 text-sm bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-medium" 
                        placeholder="e.g. How long does shipping take?" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Answer</label>
                      <textarea 
                        {...register(`faqs.${index}.answer` as const, { required: true })} 
                        rows={3}
                        className="w-full border border-border rounded-md p-2 text-sm bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
                        placeholder="e.g. Shipping usually takes 3-5 business days." 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Testimonial Management */}
          {!isNew && (
            <div className="glass-card p-6 md:p-8 rounded-xl shadow-sm border border-border space-y-6 mt-8">
              <h2 className="text-xl font-bold border-b border-border pb-4 flex items-center gap-2">Customer Reviews & Testimonials</h2>
              
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">No reviews found for this product.</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {reviews.map((r, i) => (
                    <div key={r._id || i} className="border border-border rounded-lg p-4 bg-background shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold">{r.authorName} <span className="text-sm font-normal text-muted-foreground">({r.authorEmail})</span></p>
                          <p className="text-yellow-500 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {r.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground mt-2">{r.body}</p>
                      
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                        {r.status !== 'approved' && (
                          <button 
                            type="button" 
                            onClick={async () => {
                              await updateReviewStatusAction(r._id, 'approved');
                              const revRes = await fetchAllReviewsByProductIdAction(resolvedParams.id);
                              if (revRes.success) setReviews(revRes.data);
                            }}
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button 
                            type="button" 
                            onClick={async () => {
                              await updateReviewStatusAction(r._id, 'rejected');
                              const revRes = await fetchAllReviewsByProductIdAction(resolvedParams.id);
                              if (revRes.success) setReviews(revRes.data);
                            }}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition"
                          >
                            Reject
                          </button>
                        )}
                        <button 
                          type="button" 
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this review?")) {
                              await deleteReviewAction(r._id);
                              const revRes = await fetchAllReviewsByProductIdAction(resolvedParams.id);
                              if (revRes.success) setReviews(revRes.data);
                            }
                          }}
                          className="text-xs text-red-500 hover:text-red-700 underline ml-auto transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="font-bold mb-4">Manually Add a Testimonial</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Author Name" 
                      value={newReview.authorName}
                      onChange={e => setNewReview({...newReview, authorName: e.target.value})}
                      className="border border-border rounded p-2 text-sm"
                    />
                    <input 
                      type="email" 
                      placeholder="Author Email" 
                      value={newReview.authorEmail}
                      onChange={e => setNewReview({...newReview, authorEmail: e.target.value})}
                      className="border border-border rounded p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Rating</label>
                    <select 
                      value={newReview.rating}
                      onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                      className="border border-border rounded p-2 text-sm w-full"
                    >
                      {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                    </select>
                  </div>
                  <textarea 
                    placeholder="Testimonial Body" 
                    value={newReview.body}
                    onChange={e => setNewReview({...newReview, body: e.target.value})}
                    className="border border-border rounded p-2 text-sm w-full h-24"
                  />
                  <button 
                    type="button"
                    onClick={async () => {
                      if (!newReview.authorName || !newReview.body) return alert("Name and body are required");
                      setSaving(true);
                      await adminSubmitReviewAction({ ...newReview, productId: resolvedParams.id as any });
                      const revRes = await fetchAllReviewsByProductIdAction(resolvedParams.id);
                      if (revRes.success) {
                        setReviews(revRes.data);
                        setNewReview({ authorName: "", authorEmail: "", rating: 5, body: "" });
                      }
                      setSaving(false);
                    }}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-bold w-full"
                  >
                    Add Approved Testimonial
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-8">
          <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-lg hover:bg-primary/90 transition-transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-2 shadow-md">
            <span>{saving ? "Saving..." : "Save Product"}</span>
            <Save size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

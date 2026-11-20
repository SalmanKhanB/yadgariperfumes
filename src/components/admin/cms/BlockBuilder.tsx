"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { Trash2, ArrowUp, ArrowDown, Plus, X, Search, ChevronUp, ChevronDown } from "lucide-react";
import { ImageUploader } from "../ImageUploader";
import { IPageBlock } from "@/server/db/models/Page";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

import { fetchCategoriesAction } from "@/server/actions/categoryActions";
import { fetchProductsAction } from "@/server/actions/productActions";
import { useCurrency } from "@/components/providers/CurrencyProvider";

interface BlockBuilderProps {
  blocks: IPageBlock[];
  setBlocks: (blocks: IPageBlock[]) => void;
  isSidebar?: boolean;
  hideAdditions?: boolean;
  hideHeader?: boolean;
  hideToolbar?: boolean;
}

function ProductCategorySelector({
  idx,
  blockData,
  updateBlockData,
  categories,
  allProducts
}: {
  idx: number;
  blockData: any;
  updateBlockData: (index: number, field: string, value: any) => void;
  categories: any[];
  allProducts: any[];
}) {
  const { formatPrice } = useCurrency();
  const mode = blockData.selectionMode || "category";
  const selectedProductIds: string[] = blockData.productIds || [];
  const [search, setSearch] = useState("");

  const toggleProductSelect = (productId: string) => {
    const exists = selectedProductIds.includes(productId);
    const updated = exists
      ? selectedProductIds.filter(id => id !== productId)
      : [...selectedProductIds, productId];
    updateBlockData(idx, "productIds", updated);
  };

  const filteredProducts = allProducts.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 bg-muted/40 p-4 rounded-2xl border border-border">
      {/* Mode Selection Tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border border-border">
        <button
          type="button"
          onClick={() => updateBlockData(idx, "selectionMode", "category")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${mode === "category"
            ? "bg-card text-foreground shadow-xs border border-border"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          📁 Filter by Category
        </button>
        <button
          type="button"
          onClick={() => updateBlockData(idx, "selectionMode", "specific")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${mode === "specific"
            ? "bg-card text-foreground shadow-xs border border-border"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          ✨ Hand-Pick Products ({selectedProductIds.length})
        </button>
      </div>

      {mode === "category" ? (
        <div className="space-y-2">
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
            Select Category Filter
          </label>
          <select
            value={blockData.categorySlug || ""}
            onChange={(e) => updateBlockData(idx, "categorySlug", e.target.value)}
            className="w-full border border-border bg-background rounded-xl p-2.5 text-xs text-foreground font-bold outline-none cursor-pointer"
          >
            <option value="">All Categories (No Filter)</option>
            {categories.map((cat) => (
              <option key={String(cat._id)} value={cat.slug}>
                {cat.name} ({cat.slug})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground">
            Automatically displays products belonging to this category.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Hand-Pick Specific Products ({selectedProductIds.length} Selected)
            </label>
            {selectedProductIds.length > 0 && (
              <button
                type="button"
                onClick={() => updateBlockData(idx, "productIds", [])}
                className="text-[10px] font-mono font-bold text-rose-500 hover:underline cursor-pointer"
              >
                Clear All ({selectedProductIds.length})
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-border bg-background rounded-xl p-2 text-xs outline-none"
          />

          <div className="max-h-56 overflow-y-auto space-y-1.5 border border-border rounded-xl p-2 bg-background">
            {filteredProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 italic">No products found.</p>
            ) : (
              filteredProducts.map((p) => {
                const idStr = String(p._id);
                const isSelected = selectedProductIds.includes(idStr);
                const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image;
                return (
                  <div
                    key={idStr}
                    onClick={() => toggleProductSelect(idStr)}
                    className={`flex items-center gap-3 p-2 rounded-lg border text-xs cursor-pointer transition-all ${isSelected
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-bold"
                      : "border-border/50 hover:bg-muted text-foreground"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded text-emerald-600 cursor-pointer"
                    />
                    {img && (
                      <img src={img} alt={p.name} className="w-8 h-8 rounded object-cover border border-border/50 shrink-0" />
                    )}
                    <div className="flex-1 truncate">
                      <p className="truncate font-semibold">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono">{p.category || 'General'}</p>
                    </div>
                    {p.price !== undefined && (
                      <span className="font-mono text-[11px] font-bold text-foreground shrink-0">{formatPrice(p.price)}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function BlockBuilder({ blocks: rawBlocks, setBlocks, isSidebar = false, hideAdditions = false, hideHeader = false, hideToolbar = false }: BlockBuilderProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [sectionSearchQuery, setSectionSearchQuery] = useState("");
  const blocks = (rawBlocks || []).map(b => ({ ...b, blockData: b.blockData || {} }));

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      try {
        const catRes = await fetchCategoriesAction();
        if (catRes.success) setCategories(catRes.data || []);

        const prodRes = await fetchProductsAction();
        if (prodRes.success) setAllProducts(prodRes.data || []);
      } catch (e) {
        console.error("Failed to load block builder data:", e);
      }
    }
    loadData();
  }, []);

  const addBlock = (blockType: string) => {
    let initialData = {};
    if (blockType === "hero") {
      initialData = { heading: "Welcome to Our Page", subheading: "Premium quality guaranteed.", buttonText: "Shop Now", buttonUrl: "/all" };
    } else if (blockType === "rich-text") {
      initialData = { heading: "Our Mission", content: "<p>We strive to bring you the best designs with the finest craftsmanship.</p>" };
    } else if (blockType === "features") {
      initialData = {
        heading: "Why Choose Us",
        items: [
          { title: "Worldwide Shipping", desc: "Fast and reliable shipping to your door.", icon: "Truck" },
          { title: "Secure Checkout", desc: "Your details are encrypted and safe.", icon: "Shield" }
        ]
      };
    } else if (blockType === "faq") {
      initialData = {
        heading: "Frequently Asked Questions",
        items: [
          { question: "What is the delivery timeline?", answer: "Orders ship within 3-5 business days." },
          { question: "How do I return my item?", answer: "We offer a 30-day return policy." }
        ]
      };
    } else if (blockType === "testimonials") {
      initialData = {
        heading: "What Our Customers Say",
        items: [{ name: "John Doe", role: "CEO", review: "Absolutely phenomenal quality and design. It transformed our entire workflow.", stars: 5 }]
      };
    } else if (blockType === "cta-banner") {
      initialData = { heading: "Ready to Elevate Your Brand?", subheading: "Join thousands of satisfied customers today.", buttonText: "Get Started", buttonUrl: "/collections", background: "" };
    } else if (blockType === "video-banner") {
      initialData = { heading: "Watch Our Story", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" };
    } else if (blockType === "newsletter") {
      initialData = { heading: "Join the Club", subheading: "Subscribe for exclusive drops and early access." };
    } else if (blockType === "stats") {
      initialData = {
        items: [
          { label: "Happy Customers", value: "10K+" },
          { label: "Products Sold", value: "500K" },
          { label: "Countries Served", value: "50+" }
        ]
      };
    } else if (blockType === "team") {
      initialData = {
        heading: "Meet the Creators",
        items: [{ name: "Jane Doe", role: "Creative Director", image: "https://i.pravatar.cc/300" }]
      };
    } else if (blockType === "gallery") {
      initialData = {
        heading: "Lookbook",
        items: [{ image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800" }]
      };
    } else if (blockType === "split-content") {
      initialData = { heading: "The Art of Design", content: "We believe in minimalism that speaks volumes. Every pixel is crafted with intention.", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800", reverse: false };
    } else if (blockType === "featured-products") {
      initialData = { heading: "Featured Collection", categorySlug: "", limit: 4 };
    } else if (blockType === "categories-grid") {
      initialData = { heading: "Shop by Category", items: [{ name: "New Arrivals", slug: "new-arrivals", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800" }] };
    } else if (blockType === "promo-banner") {
      initialData = { heading: "Summer Sale", text: "Use code SUMMER20 for 20% off!", url: "/all", background: "bg-red-500 text-white" };
    } else if (blockType === "brand-logos") {
      initialData = { heading: "Trusted Brands", items: [{ image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" }] };
    } else if (blockType === "image") {
      initialData = { url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop", altText: "Featured Image", fullWidth: false };
    } else if (blockType === "image-text") {
      initialData = { image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop", heading: "Discover the Details", content: "A deep dive into what makes our collection unique. Experience the standard of quality.", imagePosition: "left" };
    } else if (blockType === "video") {
      initialData = { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", heading: "Watch the Video", fullWidth: false };
    } else if (blockType === "video-text") {
      initialData = { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", heading: "See it in action", content: "Watch the demonstration to understand how our product fits into your daily routine.", videoPosition: "left" };
    } else if (blockType === "pharmacy-catalog") {
      initialData = { heading: "Catalog", bgImage: "", categorySlug: "", limit: 5 };
    } else if (blockType === "contact-form" || blockType === "contact") {
      initialData = {
        heading: "Contact Our Team",
        subheading: "Have questions about our perfumes, custom requests, or orders? We are here to assist you 24/7.",
        email: "",
        phone: "",
        address: "",
        showDirectChannels: true
      };
    }


    const newBlock: IPageBlock = {
      blockType,
      blockData: initialData
    };
    setBlocks([...blocks, newBlock]);
    setIsAddModalOpen(false);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[swapIndex];
    newBlocks[swapIndex] = temp;
    setBlocks(newBlocks);
  };

  const updateBlockData = (index: number, field: string, value: any) => {
    const newBlocks = [...blocks];
    newBlocks[index].blockData = {
      ...newBlocks[index].blockData,
      [field]: value
    };
    setBlocks(newBlocks);
  };

  const updateBlockListItem = (blockIndex: number, itemIndex: number, field: string, value: any) => {
    const newBlocks = [...blocks];
    const items = [...(newBlocks[blockIndex].blockData.items || [])];
    items[itemIndex] = {
      ...items[itemIndex],
      [field]: value
    };
    newBlocks[blockIndex].blockData = {
      ...newBlocks[blockIndex].blockData,
      items
    };
    setBlocks(newBlocks);
  };

  const addBlockListItem = (blockIndex: number, defaultItem: any) => {
    const newBlocks = [...blocks];
    const items = [...(newBlocks[blockIndex].blockData.items || [])];
    newBlocks[blockIndex].blockData = {
      ...newBlocks[blockIndex].blockData,
      items: [...items, defaultItem]
    };
    setBlocks(newBlocks);
  };

  const removeBlockListItem = (blockIndex: number, itemIndex: number) => {
    const newBlocks = [...blocks];
    const items = [...(newBlocks[blockIndex].blockData.items || [])];
    newBlocks[blockIndex].blockData = {
      ...newBlocks[blockIndex].blockData,
      items: items.filter((_, i) => i !== itemIndex)
    };
    setBlocks(newBlocks);
  };

  const moveBlockListItem = (blockIndex: number, fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const items = [...(newBlocks[blockIndex].blockData.items || [])];
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return;
    const [removed] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, removed);
    newBlocks[blockIndex].blockData = {
      ...newBlocks[blockIndex].blockData,
      items
    };
    setBlocks(newBlocks);
  };

  return (
    <div className={isSidebar ? "space-y-6 flex flex-col" : "grid grid-cols-1 lg:grid-cols-12 gap-8"}>
      {/* Block Addition Drawer / Modal */}
      {!hideAdditions && (
        <div className={isSidebar ? "w-full order-2" : "lg:col-span-12 space-y-6"}>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-4 bg-muted hover:bg-primary/10 hover:text-primary transition-all border border-dashed border-border rounded-2xl text-sm font-bold uppercase tracking-widest text-muted-foreground"
          >
            <Plus size={18} /> Additions
          </button>

          {mounted && isAddModalOpen && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <div className="bg-card w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border shadow-2xl p-6 sm:p-8 relative space-y-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-muted hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>

                <div className="border-b border-border pb-4 mb-4">
                  <h3 className="text-2xl font-serif font-black uppercase tracking-tight text-foreground">Add Block Section</h3>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-1">Select a section category or search below to insert into your page layout.</p>
                </div>

                {/* Instant Section Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    value={sectionSearchQuery}
                    onChange={(e) => setSectionSearchQuery(e.target.value)}
                    placeholder="Search sections (e.g. contact form, hero, products, faq, gallery, testimonials)..."
                    className="w-full pl-10 pr-12 py-3 bg-muted/40 border border-border rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground/70"
                    autoFocus
                  />
                  {sectionSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setSectionSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-muted-foreground hover:text-foreground cursor-pointer px-1.5 py-0.5 rounded bg-muted"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {[
                    {
                      category: "Banners & Heroes",
                      icon: "🎯",
                      color: "border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400",
                      items: [
                        { type: "hero", label: "Hero Banner", desc: "Full hero header with CTA" },
                        { type: "cta-banner", label: "CTA Banner", desc: "Call to action box" },
                        { type: "video-banner", label: "Video Banner", desc: "Video header overlay" },
                        { type: "promo-banner", label: "Promo Banner", desc: "Discount promo banner" },
                      ]
                    },
                    {
                      category: "Media & Images",
                      icon: "🖼️",
                      color: "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400",
                      items: [
                        { type: "image", label: "Image Only", desc: "Clean responsive image (original ratio)" },
                        { type: "image-text", label: "Image w/ Text", desc: "Image alongside custom text" },
                        { type: "split-content", label: "Split Image & Text", desc: "Half image half text layout" },
                        { type: "gallery", label: "Image Gallery", desc: "Multi-photo grid" },
                        { type: "video", label: "Video Only", desc: "Embedded video player" },
                        { type: "video-text", label: "Video w/ Text", desc: "Video with side text" },
                      ]
                    },
                    {
                      category: "Products & Commerce",
                      icon: "🛍️",
                      color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
                      items: [
                        { type: "pharmacy-catalog", label: "Product / Pharmacy Showcase", desc: "Top banner + product/category carousel" },
                        { type: "featured-products", label: "Featured Products Grid", desc: "Products grid from category" },
                        { type: "categories-grid", label: "Categories Grid", desc: "Collection category cards" },
                        { type: "brand-logos", label: "Brand Logos", desc: "Partner brand logo bar" },
                      ]
                    },
                    {
                      category: "Content & Text",
                      icon: "📝",
                      color: "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
                      items: [
                        { type: "rich-text", label: "Rich Text / HTML", desc: "Formatted text & headings" },
                        { type: "features", label: "Features List", desc: "Feature icon grid" },
                        { type: "faq", label: "FAQ Accordion", desc: "Expandable questions & answers" },
                        { type: "contact-form", label: "Contact Form", desc: "Interactive customer inquiry form with direct channels" },
                      ]
                    },
                    {
                      category: "Social & Trust",
                      icon: "⭐",
                      color: "border-border bg-muted/40 text-foreground",
                      items: [
                        { type: "testimonials", label: "Testimonials", desc: "Customer review star cards" },
                        { type: "stats", label: "Stats Counter", desc: "Key metric counter numbers" },
                        { type: "team", label: "Team Members", desc: "Staff bio profiles" },
                        { type: "newsletter", label: "Newsletter Signup", desc: "Email subscription box" },
                      ]
                    }
                  ]
                    .map((catGroup) => ({
                      ...catGroup,
                      items: catGroup.items.filter(
                        (item) =>
                          item.label.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                          item.desc.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                          item.type.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                          catGroup.category.toLowerCase().includes(sectionSearchQuery.toLowerCase())
                      )
                    }))
                    .filter((catGroup) => catGroup.items.length > 0)
                    .map((catGroup, cIdx) => (
                    <div key={cIdx} className="space-y-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <span>{catGroup.icon}</span> {catGroup.category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {catGroup.items.map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => {
                              addBlock(item.type);
                              setSectionSearchQuery("");
                            }}
                            className={`p-3.5 border rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col justify-between group shadow-xs ${catGroup.color}`}
                          >
                            <span className="font-bold text-xs uppercase tracking-wider block mb-1 group-hover:underline">
                              {item.label}
                            </span>
                            <span className="text-[10px] font-sans text-muted-foreground line-clamp-2 leading-tight">
                              {item.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {sectionSearchQuery && [
                    {
                      category: "Banners & Heroes",
                      items: [
                        { type: "hero", label: "Hero Banner", desc: "Full hero header with CTA" },
                        { type: "cta-banner", label: "CTA Banner", desc: "Call to action box" },
                        { type: "video-banner", label: "Video Banner", desc: "Video header overlay" },
                        { type: "promo-banner", label: "Promo Banner", desc: "Discount promo banner" },
                      ]
                    },
                    {
                      category: "Media & Images",
                      items: [
                        { type: "image", label: "Image Only", desc: "Clean responsive image (original ratio)" },
                        { type: "image-text", label: "Image w/ Text", desc: "Image alongside custom text" },
                        { type: "split-content", label: "Split Image & Text", desc: "Half image half text layout" },
                        { type: "gallery", label: "Image Gallery", desc: "Multi-photo grid" },
                        { type: "video", label: "Video Only", desc: "Embedded video player" },
                        { type: "video-text", label: "Video w/ Text", desc: "Video with side text" },
                      ]
                    },
                    {
                      category: "Products & Commerce",
                      items: [
                        { type: "pharmacy-catalog", label: "Product / Pharmacy Showcase", desc: "Top banner + product/category carousel" },
                        { type: "featured-products", label: "Featured Products Grid", desc: "Products grid from category" },
                        { type: "categories-grid", label: "Categories Grid", desc: "Collection category cards" },
                        { type: "brand-logos", label: "Brand Logos", desc: "Partner brand logo bar" },
                      ]
                    },
                    {
                      category: "Content & Text",
                      items: [
                        { type: "rich-text", label: "Rich Text / HTML", desc: "Formatted text & headings" },
                        { type: "features", label: "Features List", desc: "Feature icon grid" },
                        { type: "faq", label: "FAQ Accordion", desc: "Expandable questions & answers" },
                        { type: "contact-form", label: "Contact Form", desc: "Interactive customer inquiry form with direct channels" },
                      ]
                    },
                    {
                      category: "Social & Trust",
                      items: [
                        { type: "testimonials", label: "Testimonials", desc: "Customer review star cards" },
                        { type: "stats", label: "Stats Counter", desc: "Key metric counter numbers" },
                        { type: "team", label: "Team Members", desc: "Staff bio profiles" },
                        { type: "newsletter", label: "Newsletter Signup", desc: "Email subscription box" },
                      ]
                    }
                  ].flatMap(g => g.items).filter(item =>
                    item.label.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                    item.desc.toLowerCase().includes(sectionSearchQuery.toLowerCase()) ||
                    item.type.toLowerCase().includes(sectionSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="py-12 text-center space-y-2 bg-muted/20 border border-dashed border-border rounded-2xl">
                      <p className="text-sm font-bold text-foreground">No sections match &ldquo;{sectionSearchQuery}&rdquo;</p>
                      <p className="text-xs text-muted-foreground">Try searching for keywords like &ldquo;contact&rdquo;, &ldquo;hero&rdquo;, &ldquo;product&rdquo;, or &ldquo;faq&rdquo;.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
            , document.body)}
        </div>
      )}

      {/* Block Configuration Panel (Right Column) */}
      <div className={isSidebar ? "w-full order-1 space-y-6" : "lg:col-span-12 space-y-6"}>
        {!hideHeader && (
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xl uppercase tracking-tighter">Layout Blocks ({blocks.length})</h3>
            {blocks.length === 0 && <span className="text-sm text-muted-foreground italic">Add your first block on the left</span>}
          </div>
        )}

        <div className="space-y-6">
          {blocks.map((block, idx) => (
            <div key={idx} id={`block-${idx}`} className="glass-panel rounded-2xl border border-border shadow-sm overflow-hidden border-l-4 border-l-primary/60 transition-all duration-300">

              {/* Block Toolbar */}
              {!hideToolbar && (
                <div className="bg-muted/50 px-6 py-3.5 border-b border-border flex justify-between items-center">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-black uppercase tracking-wider text-xs text-primary truncate max-w-[280px]">
                      {block.blockData?.heading || block.blockData?.title || `${block.blockType} Block`}
                    </span>
                    {(block.blockData?.heading || block.blockData?.title) && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-background/80 text-muted-foreground uppercase border border-border shrink-0">
                        {block.blockType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => moveBlock(idx, "up")} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowUp size={16} />
                    </button>
                    <button type="button" onClick={() => moveBlock(idx, "down")} disabled={idx === blocks.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
                      <ArrowDown size={16} />
                    </button>
                    <button type="button" onClick={() => removeBlock(idx)} className="text-red-500 hover:text-red-600 ml-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Block Inputs */}
              <div className="p-6 space-y-6">
                {block.blockType === "hero" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Heading</label>
                      <input
                        type="text"
                        value={block.blockData.heading || ""}
                        onChange={(e) => updateBlockData(idx, "heading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Subheading</label>
                      <input
                        type="text"
                        value={block.blockData.subheading || ""}
                        onChange={(e) => updateBlockData(idx, "subheading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Button Text</label>
                      <input
                        type="text"
                        value={block.blockData.buttonText || ""}
                        onChange={(e) => updateBlockData(idx, "buttonText", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Button URL</label>
                      <input
                        type="text"
                        value={block.blockData.buttonUrl || ""}
                        onChange={(e) => updateBlockData(idx, "buttonUrl", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Theme / Style</label>
                      <select
                        value={block.blockData.theme || "aurora"}
                        onChange={(e) => updateBlockData(idx, "theme", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      >
                        <option value="aurora">Aurora Ethereal</option>
                        <option value="cyberpunk">Cyberpunk Glitch</option>
                        <option value="glassmorphism">Glassmorphism Parallax</option>
                        <option value="minimalist">Minimalist Kinetic</option>
                        <option value="split-screen">Cinematic Split-Screen</option>
                        <option value="grid-matrix">Interactive Grid Matrix</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Title Size</label>
                      <select
                        value={block.blockData.titleSize || "normal"}
                        onChange={(e) => updateBlockData(idx, "titleSize", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none font-semibold"
                      >
                        <option value="small">Small (24px / 36px)</option>
                        <option value="normal">Normal / Balanced (Recommended)</option>
                        <option value="large">Large (36px / 60px)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 mt-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Background Image</label>
                      <ImageUploader
                        images={block.blockData.bgImage ? [block.blockData.bgImage] : []}
                        onChange={(urls) => updateBlockData(idx, "bgImage", urls.length > 0 ? urls[urls.length - 1] : "")}
                      />
                    </div>

                    {/* Live Preview of Hero Theme */}
                    <div className="md:col-span-2 mt-4 p-4 border border-border rounded-xl bg-muted/30">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Theme Live Preview</label>
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border bg-background shadow-inner pointer-events-none select-none flex items-center justify-center transform scale-100 origin-top-left" style={{ zoom: 0.5 }}>

                        {(block.blockData.theme || 'aurora') === 'aurora' && (
                          <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-8 w-[200%] h-[200%] left-[-50%] top-[-50%] scale-50">
                            <div className="absolute top-0 right-0 w-50 h-50 bg-accent/30 rounded-full blur-[60px]" />
                            <div className="absolute bottom-0 left-0 w-50 h-50 bg-primary/30 rounded-full blur-[60px]" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3 text-center">{block.blockData.heading || 'Hero Heading'}</h2>
                            <button className="px-6 py-2 bg-white text-black font-bold rounded-full uppercase text-xs">{block.blockData.buttonText || 'Button'}</button>
                          </div>
                        )}

                        {(block.blockData.theme) === 'cyberpunk' && (
                          <div className="absolute inset-0 bg-black flex flex-col items-start justify-center p-8 w-[200%] h-[200%] left-[-50%] top-[-50%] scale-50 border-b-2 border-[#0f0]">
                            <div className="border-l-4 border-[#0f0] pl-6 w-full max-w-xl mx-auto">
                              <h2 className="text-4xl font-bold text-white uppercase tracking-tighter mb-4">
                                <span className="absolute -left-1 text-[#f0f] opacity-50">{block.blockData.heading || 'Hero Heading'}</span>
                                <span className="relative z-10">{block.blockData.heading || 'Hero Heading'}</span>
                              </h2>
                              <button className="px-6 py-2 bg-[#0f0] text-black font-bold uppercase text-xs">{block.blockData.buttonText || 'Button'}</button>
                            </div>
                          </div>
                        )}

                        {(block.blockData.theme) === 'glassmorphism' && (
                          <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-8 w-[200%] h-[200%] left-[-50%] top-[-50%] scale-50">
                            <div className="bg-background/40 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-center shadow-2xl">
                              <h2 className="text-4xl font-black text-foreground uppercase tracking-tight mb-4">{block.blockData.heading || 'Hero Heading'}</h2>
                              <button className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl uppercase text-xs">{block.blockData.buttonText || 'Button'}</button>
                            </div>
                          </div>
                        )}

                        {(block.blockData.theme) === 'minimalist' && (
                          <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-8 w-[200%] h-[200%] left-[-50%] top-[-50%] scale-50">
                            <h2 className="text-6xl font-black text-foreground uppercase tracking-tighter mb-8 text-center">{block.blockData.heading || 'Hero Heading'}</h2>
                            <button className="text-foreground font-bold uppercase text-sm border-b-2 border-foreground pb-1">{block.blockData.buttonText || 'Button'}</button>
                          </div>
                        )}

                        {(block.blockData.theme) === 'split-screen' && (
                          <div className="absolute inset-0 bg-background flex flex-row w-[200%] h-[200%] left-[-50%] top-[-50%] scale-50">
                            <div className="flex-1 flex flex-col justify-center px-12 border-r border-border">
                              <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter mb-6">{block.blockData.heading || 'Hero Heading'}</h2>
                              <button className="text-foreground font-bold uppercase text-xs border-b border-foreground pb-1 self-start">{block.blockData.buttonText || 'Button'}</button>
                            </div>
                            <div className="flex-1 bg-muted flex items-center justify-center text-muted-foreground font-bold uppercase tracking-widest text-sm">Media Area</div>
                          </div>
                        )}

                        {(block.blockData.theme) === 'grid-matrix' && (
                          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8 w-[200%] h-[200%] left-[-50%] top-[-50%] scale-50">
                            <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-20">
                              {Array.from({ length: 18 }).map((_, i) => <div key={i} className="border border-neutral-700" />)}
                            </div>
                            <h2 className="text-5xl font-black text-white uppercase tracking-[0.2em] mb-6 relative z-10 text-center">{block.blockData.heading || 'Hero Heading'}</h2>
                            <button className="px-8 py-3 border border-primary text-primary font-bold uppercase text-xs relative z-10">{block.blockData.buttonText || 'Button'}</button>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )}

                {block.blockType === "cta-banner" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Heading</label>
                      <input
                        type="text"
                        value={block.blockData.heading || ""}
                        onChange={(e) => updateBlockData(idx, "heading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Subheading</label>
                      <input
                        type="text"
                        value={block.blockData.subheading || ""}
                        onChange={(e) => updateBlockData(idx, "subheading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Button Text</label>
                      <input
                        type="text"
                        value={block.blockData.buttonText || ""}
                        onChange={(e) => updateBlockData(idx, "buttonText", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Button URL</label>
                      <input
                        type="text"
                        value={block.blockData.buttonUrl || ""}
                        onChange={(e) => updateBlockData(idx, "buttonUrl", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 mt-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Background Image</label>
                      <ImageUploader
                        images={block.blockData.bgImage ? [block.blockData.bgImage] : []}
                        onChange={(urls) => updateBlockData(idx, "bgImage", urls.length > 0 ? urls[urls.length - 1] : "")}
                      />
                    </div>
                  </div>
                )}

                {block.blockType === "rich-text" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Section Title</label>
                      <input
                        type="text"
                        value={block.blockData.heading || ""}
                        onChange={(e) => updateBlockData(idx, "heading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">HTML / Text Content</label>
                      <textarea
                        rows={5}
                        value={block.blockData.content || ""}
                        onChange={(e) => updateBlockData(idx, "content", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-xs"
                      />
                    </div>
                  </div>
                )}

                {block.blockType === "features" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Section Title</label>
                      <input
                        type="text"
                        value={block.blockData.heading || ""}
                        onChange={(e) => updateBlockData(idx, "heading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Features Grid Items</label>
                      {(block.blockData.items || []).map((item: any, fIdx: number) => (
                        <div key={fIdx} className="bg-muted p-4 rounded-xl border border-border space-y-3 relative group">
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <button
                              type="button"
                              disabled={fIdx === 0}
                              onClick={() => moveBlockListItem(idx, fIdx, fIdx - 1)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={fIdx === (block.blockData.items?.length || 1) - 1}
                              onClick={() => moveBlockListItem(idx, fIdx, fIdx + 1)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button type="button" onClick={() => removeBlockListItem(idx, fIdx)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition cursor-pointer" title="Remove Item">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Title</label>
                              <input
                                type="text"
                                value={item.title || ""}
                                onChange={(e) => updateBlockListItem(idx, fIdx, "title", e.target.value)}
                                className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Icon (Lucide name)</label>
                              <input
                                type="text"
                                value={item.icon || "Truck"}
                                onChange={(e) => updateBlockListItem(idx, fIdx, "icon", e.target.value)}
                                className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Description</label>
                              <textarea
                                rows={2}
                                value={item.desc || ""}
                                onChange={(e) => updateBlockListItem(idx, fIdx, "desc", e.target.value)}
                                className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addBlockListItem(idx, { title: "New Feature", desc: "Feature details go here.", icon: "Check" })}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        + Add Feature Item
                      </button>
                    </div>
                  </div>
                )}

                {block.blockType === "faq" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Section Title</label>
                      <input
                        type="text"
                        value={block.blockData.heading || ""}
                        onChange={(e) => updateBlockData(idx, "heading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">FAQ Q&A List</label>
                      {(block.blockData.items || []).map((item: any, qIdx: number) => (
                        <div key={qIdx} className="bg-muted p-4 rounded-xl border border-border space-y-3 relative group">
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <button
                              type="button"
                              disabled={qIdx === 0}
                              onClick={() => moveBlockListItem(idx, qIdx, qIdx - 1)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={qIdx === (block.blockData.items?.length || 1) - 1}
                              onClick={() => moveBlockListItem(idx, qIdx, qIdx + 1)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button type="button" onClick={() => removeBlockListItem(idx, qIdx)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition cursor-pointer" title="Remove FAQ">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-muted-foreground">Question</label>
                            <input
                              type="text"
                              value={item.question || ""}
                              onChange={(e) => updateBlockListItem(idx, qIdx, "question", e.target.value)}
                              className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-muted-foreground">Answer</label>
                            <textarea
                              rows={2}
                              value={item.answer || ""}
                              onChange={(e) => updateBlockListItem(idx, qIdx, "answer", e.target.value)}
                              className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addBlockListItem(idx, { question: "New Question?", answer: "Answer here." })}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        + Add Q&A Item
                      </button>
                    </div>
                  </div>
                )}

                {block.blockType === "testimonials" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Section Title</label>
                      <input
                        type="text"
                        value={block.blockData.heading || ""}
                        onChange={(e) => updateBlockData(idx, "heading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Reviews List</label>
                      {(block.blockData.items || []).map((item: any, tIdx: number) => (
                        <div key={tIdx} className="bg-muted p-4 rounded-xl border border-border space-y-3 relative group">
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <button
                              type="button"
                              disabled={tIdx === 0}
                              onClick={() => moveBlockListItem(idx, tIdx, tIdx - 1)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={tIdx === (block.blockData.items?.length || 1) - 1}
                              onClick={() => moveBlockListItem(idx, tIdx, tIdx + 1)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button type="button" onClick={() => removeBlockListItem(idx, tIdx)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition cursor-pointer" title="Remove Review">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Reviewer Name</label>
                              <input
                                type="text"
                                value={item.name || ""}
                                onChange={(e) => updateBlockListItem(idx, tIdx, "name", e.target.value)}
                                className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Role / Detail</label>
                              <input
                                type="text"
                                value={item.role || ""}
                                onChange={(e) => updateBlockListItem(idx, tIdx, "role", e.target.value)}
                                className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Stars (1-5)</label>
                              <input
                                type="number" min="1" max="5"
                                value={item.stars || 5}
                                onChange={(e) => updateBlockListItem(idx, tIdx, "stars", Number(e.target.value))}
                                className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground">Review Text</label>
                              <textarea
                                rows={2}
                                value={item.review || ""}
                                onChange={(e) => updateBlockListItem(idx, tIdx, "review", e.target.value)}
                                className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addBlockListItem(idx, { name: "New Reviewer", role: "Customer", review: "Great!", stars: 5 })}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        + Add Review Item
                      </button>
                    </div>
                  </div>
                )}

                {block.blockType === "cta-banner" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Heading</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Subheading</label>
                      <input type="text" value={block.blockData.subheading || ""} onChange={(e) => updateBlockData(idx, "subheading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Button Text</label>
                      <input type="text" value={block.blockData.buttonText || ""} onChange={(e) => updateBlockData(idx, "buttonText", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Button URL</label>
                      <input type="text" value={block.blockData.buttonUrl || ""} onChange={(e) => updateBlockData(idx, "buttonUrl", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Background Image URL (Optional)</label>
                      <input type="text" value={block.blockData.background || ""} onChange={(e) => updateBlockData(idx, "background", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" placeholder="https://..." />
                    </div>
                  </div>
                )}

                {block.blockType === "video-banner" && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Overlay Heading</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Video Embed URL (e.g. YouTube/Vimeo)</label>
                      <input type="text" value={block.blockData.videoUrl || ""} onChange={(e) => updateBlockData(idx, "videoUrl", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" placeholder="https://www.youtube.com/embed/..." />
                    </div>
                  </div>
                )}

                {block.blockType === "image" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Image URL</label>
                      <input type="text" value={block.blockData.url || ""} onChange={(e) => updateBlockData(idx, "url", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Or Upload Image</label>
                      <ImageUploader
                        images={block.blockData.url ? [block.blockData.url] : []}
                        onChange={(urls) => updateBlockData(idx, "url", urls.length > 0 ? urls[urls.length - 1] : "")}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Alt Text</label>
                      <input type="text" value={block.blockData.altText || ""} onChange={(e) => updateBlockData(idx, "altText", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Aspect Ratio</label>
                      <select
                        value={block.blockData.aspectRatio || "auto"}
                        onChange={(e) => updateBlockData(idx, "aspectRatio", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      >
                        <option value="auto">Auto (natural image size)</option>
                        <option value="16/9">16:9 (Widescreen / Banner)</option>
                        <option value="21/9">21:9 (Ultra-wide / Cinematic)</option>
                        <option value="4/3">4:3 (Standard)</option>
                        <option value="3/2">3:2 (Photo)</option>
                        <option value="1/1">1:1 (Square)</option>
                        <option value="3/4">3:4 (Portrait)</option>
                        <option value="9/16">9:16 (Tall / Mobile)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Object Fit</label>
                      <select
                        value={block.blockData.objectFit || "cover"}
                        onChange={(e) => updateBlockData(idx, "objectFit", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      >
                        <option value="cover">Cover (crop to fill)</option>
                        <option value="contain">Contain (show full image)</option>
                        <option value="fill">Fill (stretch)</option>
                        <option value="none">None (original size)</option>
                      </select>
                    </div>
                    {block.blockData.url && (
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Preview</label>
                        <div
                          className="w-full rounded-lg overflow-hidden border border-border bg-muted"
                          style={{ aspectRatio: block.blockData.aspectRatio === "auto" ? "unset" : block.blockData.aspectRatio || "16/9" }}
                        >
                          <img
                            src={block.blockData.url}
                            alt={block.blockData.altText || "Preview"}
                            className="w-full h-full"
                            style={{ objectFit: block.blockData.objectFit || "cover", display: "block" }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <ToggleSwitch checked={block.blockData.fullWidth || false} onChange={(checked) => updateBlockData(idx, "fullWidth", checked)} />
                      <label htmlFor={`fullWidth-${idx}`} className="text-sm font-bold text-foreground">Full Width</label>
                    </div>
                  </div>
                )}

                {block.blockType === "image-text" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Heading</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Text Content</label>
                      <textarea rows={4} value={block.blockData.content || ""} onChange={(e) => updateBlockData(idx, "content", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Image URL</label>
                      <input type="text" value={block.blockData.image || ""} onChange={(e) => updateBlockData(idx, "image", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Image Position</label>
                      <select value={block.blockData.imagePosition || "left"} onChange={(e) => updateBlockData(idx, "imagePosition", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none">
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                )}

                {block.blockType === "video" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Heading (Optional)</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none font-bold" placeholder="e.g. Watch Our Story" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Video URL or Embed Code (YouTube, TikTok, Facebook, Reels, Vimeo, MP4)</label>
                      <input type="text" value={block.blockData.videoUrl || ""} onChange={(e) => updateBlockData(idx, "videoUrl", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-xs outline-none" placeholder="Paste YouTube, TikTok, Facebook, Instagram, or MP4 URL" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Aspect Ratio / Size</label>
                        <select
                          value={block.blockData.aspectRatio || "16/9"}
                          onChange={(e) => updateBlockData(idx, "aspectRatio", e.target.value)}
                          className="w-full border border-border bg-background rounded p-2 text-xs outline-none font-bold cursor-pointer"
                        >
                          <option value="auto">Auto (Responsive / Natural Fit)</option>
                          <option value="16/9">16:9 Widescreen (YouTube / Standard)</option>
                          <option value="9/16">9:16 Vertical (TikTok / Reels / Shorts)</option>
                          <option value="4/3">4:3 Standard (Classic)</option>
                          <option value="1/1">1:1 Square (Feed)</option>
                          <option value="21/9">21:9 Cinematic (Ultrawide)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Video Fit Mode</label>
                        <select
                          value={block.blockData.objectFit || "contain"}
                          onChange={(e) => updateBlockData(idx, "objectFit", e.target.value)}
                          className="w-full border border-border bg-background rounded p-2 text-xs outline-none font-bold cursor-pointer"
                        >
                          <option value="contain">Contain (No Crop / Full Video)</option>
                          <option value="cover">Cover (Fill Container / Crop)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Max Player Height</label>
                        <select
                          value={block.blockData.maxHeight || "75vh"}
                          onChange={(e) => updateBlockData(idx, "maxHeight", e.target.value)}
                          className="w-full border border-border bg-background rounded p-2 text-xs outline-none font-bold cursor-pointer"
                        >
                          <option value="450px">Compact (450px)</option>
                          <option value="600px">Medium (600px)</option>
                          <option value="75vh">Standard Height (75vh)</option>
                          <option value="85vh">Large (85vh)</option>
                          <option value="none">No Max Height Limit</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Cover / Poster Image (Optional)</label>
                        <input
                          type="text"
                          value={block.blockData.posterImage || ""}
                          onChange={(e) => updateBlockData(idx, "posterImage", e.target.value)}
                          className="w-full border border-border bg-background rounded p-2 text-xs outline-none"
                          placeholder="https://... cover thumbnail"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor={`videoPlayBtn-${idx}`} className="text-xs font-bold text-foreground cursor-pointer">
                          Luxury Animated Play Button Overlay
                        </label>
                        <ToggleSwitch checked={block.blockData.showPlayButton !== false} onChange={(checked) => updateBlockData(idx, "showPlayButton", checked)} />
                      </div>

                      <div className="flex items-center justify-between">
                        <label htmlFor={`videoFullWidth-${idx}`} className="text-xs font-bold text-foreground cursor-pointer">
                          Full Screen Width
                        </label>
                        <ToggleSwitch checked={block.blockData.fullWidth || false} onChange={(checked) => updateBlockData(idx, "fullWidth", checked)} />
                      </div>

                      <div className="flex items-center justify-between">
                        <label htmlFor={`videoAutoplay-${idx}`} className="text-xs font-bold text-foreground cursor-pointer">
                          Autoplay (Muted)
                        </label>
                        <ToggleSwitch checked={block.blockData.autoPlay || false} onChange={(checked) => updateBlockData(idx, "autoPlay", checked)} />
                      </div>
                    </div>
                  </div>
                )}

                {block.blockType === "video-text" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Heading</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Text Content</label>
                      <textarea rows={4} value={block.blockData.content || ""} onChange={(e) => updateBlockData(idx, "content", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Video URL or Embed Code (YouTube, TikTok, Facebook, Vimeo, MP4)</label>
                      <input type="text" value={block.blockData.videoUrl || ""} onChange={(e) => updateBlockData(idx, "videoUrl", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" placeholder="Paste YouTube link, TikTok, Facebook, or MP4 URL" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Video Position</label>
                      <select value={block.blockData.videoPosition || "left"} onChange={(e) => updateBlockData(idx, "videoPosition", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none">
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                )}

                {block.blockType === "newsletter" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Heading</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Subheading</label>
                      <input type="text" value={block.blockData.subheading || ""} onChange={(e) => updateBlockData(idx, "subheading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                  </div>
                )}

                {block.blockType === "stats" && (
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Statistics List</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(block.blockData.items || []).map((item: any, sIdx: number) => (
                        <div key={sIdx} className="bg-muted p-3 rounded-xl border border-border relative group flex flex-col gap-2">
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            <button
                              type="button"
                              disabled={sIdx === 0}
                              onClick={() => moveBlockListItem(idx, sIdx, sIdx - 1)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={sIdx === (block.blockData.items?.length || 1) - 1}
                              onClick={() => moveBlockListItem(idx, sIdx, sIdx + 1)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown size={13} />
                            </button>
                            <button type="button" onClick={() => removeBlockListItem(idx, sIdx)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition cursor-pointer"><Trash2 size={13} /></button>
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-muted-foreground">Large Value</label>
                            <input type="text" value={item.value || ""} onChange={(e) => updateBlockListItem(idx, sIdx, "value", e.target.value)} className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none" />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-muted-foreground">Label</label>
                            <input type="text" value={item.label || ""} onChange={(e) => updateBlockListItem(idx, sIdx, "label", e.target.value)} className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => addBlockListItem(idx, { label: "New Stat", value: "100" })} className="text-xs font-bold text-primary hover:underline">
                      + Add Stat
                    </button>
                  </div>
                )}

                {block.blockType === "team" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Section Title</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Team Members</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(block.blockData.items || []).map((item: any, tIdx: number) => (
                          <div key={tIdx} className="bg-muted p-4 rounded-xl border border-border space-y-3 relative group">
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              <button
                                type="button"
                                disabled={tIdx === 0}
                                onClick={() => moveBlockListItem(idx, tIdx, tIdx - 1)}
                                className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                                title="Move Up"
                              >
                                <ChevronUp size={13} />
                              </button>
                              <button
                                type="button"
                                disabled={tIdx === (block.blockData.items?.length || 1) - 1}
                                onClick={() => moveBlockListItem(idx, tIdx, tIdx + 1)}
                                className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                                title="Move Down"
                              >
                                <ChevronDown size={13} />
                              </button>
                              <button type="button" onClick={() => removeBlockListItem(idx, tIdx)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition cursor-pointer"><Trash2 size={13} /></button>
                            </div>
                            <div><label className="block text-[9px] uppercase font-bold text-muted-foreground">Name</label><input type="text" value={item.name || ""} onChange={(e) => updateBlockListItem(idx, tIdx, "name", e.target.value)} className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none" /></div>
                            <div><label className="block text-[9px] uppercase font-bold text-muted-foreground">Role</label><input type="text" value={item.role || ""} onChange={(e) => updateBlockListItem(idx, tIdx, "role", e.target.value)} className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none" /></div>
                            <div><label className="block text-[9px] uppercase font-bold text-muted-foreground">Image URL</label><input type="text" value={item.image || ""} onChange={(e) => updateBlockListItem(idx, tIdx, "image", e.target.value)} className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none" placeholder="https://..." /></div>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => addBlockListItem(idx, { name: "New Member", role: "Role", image: "" })} className="text-xs font-bold text-primary hover:underline">
                        + Add Team Member
                      </button>
                    </div>
                  </div>
                )}

                {block.blockType === "gallery" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Section Title</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Images</label>
                      <div className="grid grid-cols-1 gap-3">
                        {(block.blockData.items || []).map((item: any, gIdx: number) => (
                          <div key={gIdx} className="bg-muted p-3 rounded-xl border border-border relative group flex items-center gap-3">
                            <div className="flex-1">
                              <input type="text" value={item.image || ""} onChange={(e) => updateBlockListItem(idx, gIdx, "image", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-xs outline-none" placeholder="Image URL (https://...)" />
                            </div>
                            <button type="button" onClick={() => removeBlockListItem(idx, gIdx)} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => addBlockListItem(idx, { image: "" })} className="text-xs font-bold text-primary hover:underline">
                        + Add Image
                      </button>
                    </div>
                  </div>
                )}

                {block.blockType === "split-content" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Heading</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Text Content</label>
                      <textarea rows={3} value={block.blockData.content || ""} onChange={(e) => updateBlockData(idx, "content", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Image URL</label>
                      <input type="text" value={block.blockData.image || ""} onChange={(e) => updateBlockData(idx, "image", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" placeholder="https://..." />
                    </div>
                    <div className="flex items-center gap-3">
                      <ToggleSwitch checked={block.blockData.reverse || false} onChange={(checked) => updateBlockData(idx, "reverse", checked)} />
                      <label htmlFor={`reverse-${idx}`} className="text-sm font-bold text-foreground">Reverse Layout (Image on Right)</label>
                    </div>
                  </div>
                )}

                {block.blockType === "featured-products" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Featured Section Title</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" placeholder="e.g. Featured Fragrances" />
                    </div>

                    <ProductCategorySelector
                      idx={idx}
                      blockData={block.blockData}
                      updateBlockData={updateBlockData}
                      categories={categories}
                      allProducts={allProducts}
                    />

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Product Display Limit</label>
                      <input type="number" min="1" max="24" value={block.blockData.limit || 4} onChange={(e) => updateBlockData(idx, "limit", Number(e.target.value))} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                  </div>
                )}

                {block.blockType === "categories-grid" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Section Title</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" placeholder="e.g. Shop by Category" />
                    </div>

                    {categories.length > 0 && (
                      <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-2">
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                          Quick Insert Store Category
                        </label>
                        <select
                          onChange={(e) => {
                            const cat = categories.find(c => c.slug === e.target.value);
                            if (cat) {
                              addBlockListItem(idx, { name: cat.name, slug: cat.slug, image: cat.image || "" });
                            }
                          }}
                          className="w-full border border-border bg-background rounded-lg p-2 text-xs font-bold outline-none cursor-pointer"
                        >
                          <option value="">+ Choose category to add...</option>
                          {categories.map((c) => (
                            <option key={String(c._id)} value={c.slug}>
                              {c.name} ({c.slug})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Categories List ({(block.blockData.items || []).length})</label>
                      <div className="grid grid-cols-1 gap-3">
                        {(block.blockData.items || []).map((item: any, gIdx: number) => (
                          <div key={gIdx} className="bg-muted p-4 rounded-xl border border-border space-y-3 relative group">
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              <button
                                type="button"
                                disabled={gIdx === 0}
                                onClick={() => moveBlockListItem(idx, gIdx, gIdx - 1)}
                                className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                                title="Move Up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={gIdx === (block.blockData.items?.length || 1) - 1}
                                onClick={() => moveBlockListItem(idx, gIdx, gIdx + 1)}
                                className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background/80 transition cursor-pointer"
                                title="Move Down"
                              >
                                <ChevronDown size={14} />
                              </button>
                              <button type="button" onClick={() => removeBlockListItem(idx, gIdx)} className="p-1 text-red-500 hover:bg-red-500/10 rounded transition cursor-pointer" title="Remove Category"><Trash2 size={14} /></button>
                            </div>
                            <div><label className="block text-[9px] uppercase font-bold text-muted-foreground">Category Name</label><input type="text" value={item.name || ""} onChange={(e) => updateBlockListItem(idx, gIdx, "name", e.target.value)} className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none font-bold" /></div>
                            <div><label className="block text-[9px] uppercase font-bold text-muted-foreground">Category Slug (URL path)</label><input type="text" value={item.slug || ""} onChange={(e) => updateBlockListItem(idx, gIdx, "slug", e.target.value)} className="w-full border border-border bg-background rounded p-1.5 text-xs outline-none font-mono text-muted-foreground" /></div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-muted-foreground mb-1">Category Card Image</label>
                              <ImageUploader
                                images={item.image ? [item.image] : []}
                                onChange={(urls) => updateBlockListItem(idx, gIdx, "image", urls.length > 0 ? urls[urls.length - 1] : "")}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => addBlockListItem(idx, { name: "New Category", slug: "new-category", image: "" })} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                        + Add Custom Category Item
                      </button>
                    </div>
                  </div>
                )}

                {block.blockType === "promo-banner" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Heading</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Promo Text (e.g. Coupon Code)</label>
                      <input type="text" value={block.blockData.text || ""} onChange={(e) => updateBlockData(idx, "text", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Link URL</label>
                      <input type="text" value={block.blockData.url || ""} onChange={(e) => updateBlockData(idx, "url", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Background Colors (Tailwind classes)</label>
                      <input type="text" value={block.blockData.background || ""} onChange={(e) => updateBlockData(idx, "background", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" placeholder="bg-primary text-white" />
                    </div>
                  </div>
                )}

                {block.blockType === "brand-logos" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Section Title</label>
                      <input type="text" value={block.blockData.heading || ""} onChange={(e) => updateBlockData(idx, "heading", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-sm outline-none" />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Brand Logo Images</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(block.blockData.items || []).map((item: any, gIdx: number) => (
                          <div key={gIdx} className="bg-muted p-3 rounded-xl border border-border relative group flex items-center gap-3">
                            <div className="flex-1">
                              <input type="text" value={item.image || ""} onChange={(e) => updateBlockListItem(idx, gIdx, "image", e.target.value)} className="w-full border border-border bg-background rounded p-2 text-xs outline-none" placeholder="Logo Image URL (https://...)" />
                            </div>
                            <button type="button" onClick={() => removeBlockListItem(idx, gIdx)} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => addBlockListItem(idx, { image: "" })} className="text-xs font-bold text-primary hover:underline">
                        + Add Logo
                      </button>
                    </div>
                  </div>
                )}

                {block.blockType === "pharmacy-catalog" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Catalog Section Title</label>
                      <input
                        type="text"
                        value={block.blockData.heading || ""}
                        onChange={(e) => updateBlockData(idx, "heading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none font-bold"
                        placeholder="e.g. Wellness Showcase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Subtitle / Description</label>
                      <input
                        type="text"
                        value={block.blockData.subheading || ""}
                        onChange={(e) => updateBlockData(idx, "subheading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                        placeholder="e.g. Curated health & wellness essentials"
                      />
                    </div>

                    <ProductCategorySelector
                      idx={idx}
                      blockData={block.blockData}
                      updateBlockData={updateBlockData}
                      categories={categories}
                      allProducts={allProducts}
                    />

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Product Display Limit</label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={block.blockData.limit || 8}
                        onChange={(e) => updateBlockData(idx, "limit", Number(e.target.value))}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Top Banner Showcase Image (Optional)</label>
                      <ImageUploader
                        images={block.blockData.bgImage ? [block.blockData.bgImage] : []}
                        onChange={(urls) => updateBlockData(idx, "bgImage", urls.length > 0 ? urls[urls.length - 1] : "")}
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Upload a top banner image to display above the product carousel (preserves original aspect ratio).</p>
                    </div>
                  </div>
                )}

                {(block.blockType === "contact-form" || block.blockType === "contact") && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Form Heading</label>
                      <input
                        type="text"
                        value={block.blockData.heading || ""}
                        onChange={(e) => updateBlockData(idx, "heading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none font-bold"
                        placeholder="e.g. Contact Our Team"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Subheading / Description</label>
                      <textarea
                        rows={2}
                        value={block.blockData.subheading || ""}
                        onChange={(e) => updateBlockData(idx, "subheading", e.target.value)}
                        className="w-full border border-border bg-background rounded p-2 text-sm outline-none"
                        placeholder="e.g. Have questions about our products? We are here to assist you 24/7."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Custom Email (Optional Override)</label>
                        <input
                          type="email"
                          value={block.blockData.email || ""}
                          onChange={(e) => updateBlockData(idx, "email", e.target.value)}
                          className="w-full border border-border bg-background rounded p-2 text-xs outline-none"
                          placeholder="e.g. concierge@store.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Custom Phone / WhatsApp (Optional Override)</label>
                        <input
                          type="text"
                          value={block.blockData.phone || ""}
                          onChange={(e) => updateBlockData(idx, "phone", e.target.value)}
                          className="w-full border border-border bg-background rounded p-2 text-xs outline-none"
                          placeholder="e.g. +92 300 123 4567"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <ToggleSwitch
                        checked={block.blockData.showDirectChannels !== false}
                        onChange={(checked) => updateBlockData(idx, "showDirectChannels", checked)}
                      />
                      <label className="text-xs font-bold text-foreground cursor-pointer">
                        Display Direct Channel Cards (Email, Phone, Showroom)
                      </label>
                    </div>
                  </div>
                )}


              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

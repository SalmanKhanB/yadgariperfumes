"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export default function FilterSidebar({ 
  categories,
  currentCategorySlug,
  onCloseMobile,
}: { 
  categories: any[];
  currentCategorySlug?: string;
  onCloseMobile?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { currency } = useCurrency();
  const currencySymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency }).formatToParts(0).find(x => x.type === 'currency')?.value || currency;
  
  const currentQuery = searchParams.get("q") || "";

  // Compute active category with high fidelity:
  // 1. URL search param: ?category=slug
  // 2. Explicit prop: currentCategorySlug
  // 3. Extracted from pathname (/for-women, /collections/for-women, etc.)
  let pathCategory = "";
  if (pathname && pathname !== "/all" && pathname !== "/" && !pathname.startsWith("/admin")) {
    const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
    if (segments[0] === "collections" && segments[1]) {
      pathCategory = segments[1];
    } else if (segments[0] && segments[0] !== "collections" && segments[0] !== "search" && segments[0] !== "cart" && segments[0] !== "account") {
      pathCategory = segments[0];
    }
  }

  // Priority:
  // 1. Explicit prop passed from parent (e.g. category.slug on /for-women)
  // 2. Extracted from route pathname (/for-women, /collections/for-women)
  // 3. Query param ?category=slug (for /all, /search, etc.)
  const currentCategory = (
    currentCategorySlug ||
    pathCategory ||
    searchParams.get("category") ||
    ""
  ).toLowerCase().trim();

  const currentSort = searchParams.get("sort") || "newest";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [searchQuery, setSearchQuery] = useState(currentQuery);

  useEffect(() => {
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
    setSearchQuery(currentQuery);
  }, [currentMinPrice, currentMaxPrice, currentQuery]);

  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategorySelect = (catSlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.set("page", "1");
    const qs = params.toString() ? `?${params.toString()}` : "";

    if (pathname === "/all") {
      if (!catSlug || catSlug === "all") {
        router.push(`/all${qs}`);
      } else {
        params.set("category", catSlug);
        router.push(`/all?${params.toString()}`);
      }
    } else if (pathname.startsWith("/collections/")) {
      if (!catSlug || catSlug === "all") {
        router.push(`/all${qs}`);
      } else {
        router.push(`/collections/${catSlug}${qs}`);
      }
    } else {
      if (!catSlug || catSlug === "all") {
        router.push(`/all${qs}`);
      } else {
        router.push(`/${catSlug}${qs}`);
      }
    }
    if (onCloseMobile) onCloseMobile();
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ minPrice, maxPrice });
    if (onCloseMobile) onCloseMobile();
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q: searchQuery });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('sort');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('q');
    params.set('page', '1');
    const qs = params.toString() ? `?${params.toString()}` : "";
    router.push(`${pathname}${qs}`);
    if (onCloseMobile) onCloseMobile();
  };

  // Helper for custom radio button styling
  const RadioItem = ({ name, checked, onChange, label }: { name: string, checked: boolean, onChange: () => void, label: string }) => (
    <label className="flex items-center gap-4 cursor-pointer group py-1">
      <input 
        type="radio" 
        name={name} 
        checked={checked} 
        onChange={() => {
          onChange();
          if (onCloseMobile && name !== "search") onCloseMobile();
        }}
        className="hidden"
      />
      <div className={`w-4 h-4 rounded-full border transition-colors flex items-center justify-center ${checked ? 'border-foreground bg-foreground' : 'border-muted-foreground group-hover:border-foreground bg-transparent'}`}>
        {checked && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
      </div>
      <span className={`font-mono text-[11px] uppercase tracking-wider transition-colors ${checked ? 'text-foreground font-bold' : 'text-muted-foreground group-hover:text-foreground'}`}>
        {label}
      </span>
    </label>
  );

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border min-h-[44px]">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] font-bold flex items-center gap-2 text-foreground">
          <SlidersHorizontal size={14} strokeWidth={1.5} /> Filters
        </h2>
        <div className="flex items-center gap-3">
          {(currentCategory || currentSort !== "newest" || currentMinPrice || currentMaxPrice || currentQuery) && (
            <button 
              onClick={clearFilters}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors font-bold"
            >
              Clear All
            </button>
          )}
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 1. Search */}
      <div className="space-y-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">Search</h3>
        <form onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 font-mono text-[11px] outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground/60"
          />
        </form>
      </div>

      {/* 2. Sort By */}
      <div className="space-y-3 border-t border-border pt-5">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">Sort By</h3>
        <div className="flex flex-col gap-2.5">
          <RadioItem 
            name="sort" 
            checked={currentSort === "newest"} 
            onChange={() => applyFilters({ sort: "newest" })} 
            label="Newest Arrivals" 
          />
          <RadioItem 
            name="sort" 
            checked={currentSort === "price_asc"} 
            onChange={() => applyFilters({ sort: "price_asc" })} 
            label="Price: Low to High" 
          />
          <RadioItem 
            name="sort" 
            checked={currentSort === "price_desc"} 
            onChange={() => applyFilters({ sort: "price_desc" })} 
            label="Price: High to Low" 
          />
        </div>
      </div>

      {/* 3. Categories */}
      <div className="space-y-3 border-t border-border pt-5">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">Categories</h3>
        <div className="flex flex-col gap-2.5">
          {(() => {
            const isAnyCatSelected = categories.some((cat: any) => {
              const catSlug = (cat.slug || "").toLowerCase().trim();
              const catId = (cat._id || "").toString().toLowerCase().trim();
              return Boolean(currentCategory && currentCategory !== "all" && (catSlug === currentCategory || catId === currentCategory));
            });

            return (
              <>
                <RadioItem 
                  name="category" 
                  checked={!isAnyCatSelected || currentCategory === "all"} 
                  onChange={() => handleCategorySelect(null)} 
                  label="All Products" 
                />
                {categories.map(cat => {
                  const catSlug = (cat.slug || "").toLowerCase().trim();
                  const catId = (cat._id || "").toString().toLowerCase().trim();
                  const isChecked = Boolean(
                    currentCategory && 
                    currentCategory !== "all" && 
                    (catSlug === currentCategory || catId === currentCategory)
                  );
                  return (
                    <RadioItem 
                      key={cat._id}
                      name="category" 
                      checked={isChecked} 
                      onChange={() => handleCategorySelect(cat.slug)} 
                      label={cat.name} 
                    />
                  );
                })}
              </>
            );
          })()}
        </div>
      </div>

      {/* 4. Price Range */}
      <div className="space-y-4 border-t border-border pt-5">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">Price Range</h3>
        <form onSubmit={handlePriceSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">{currencySymbol}</span>
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl pl-7 pr-2 py-2 font-mono text-[11px] outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground/60"
              />
            </div>
            <span className="font-mono text-muted-foreground text-[10px]">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">{currencySymbol}</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-xl pl-7 pr-2 py-2 font-mono text-[11px] outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full px-4 py-2.5 rounded-xl bg-foreground text-background font-mono text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-foreground/90 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Mobile View Results & Cancel Action Buttons */}
      {onCloseMobile && (
        <div className="lg:hidden pt-4 border-t border-border mt-2 flex flex-col gap-2">
          <button 
            onClick={onCloseMobile}
            className="w-full px-4 py-3 rounded-xl bg-foreground text-background font-mono text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-foreground/90 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            View Results
          </button>
          <button 
            onClick={onCloseMobile}
            className="w-full px-4 py-2.5 rounded-xl border border-border text-foreground font-mono text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-muted transition-all active:scale-95 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

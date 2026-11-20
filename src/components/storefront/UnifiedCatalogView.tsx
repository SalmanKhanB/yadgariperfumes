"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, PackageSearch, X, ChevronRight, RefreshCw } from "lucide-react";
import ProductCard from "./ProductCard";
import FilterSidebar from "./FilterSidebar";

interface UnifiedCatalogProps {
  initialProducts: any[];
  categories: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  title?: string;
  subheading?: string;
  selectedCategorySlug?: string;
  searchQuery?: string;
}

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3 p-3 sm:p-4 rounded-2xl border border-border/60 bg-card shadow-xs">
          <div className="w-full aspect-square skeleton-shimmer rounded-xl" />
          <div className="h-3 w-1/3 skeleton-shimmer rounded-full" />
          <div className="h-4 w-3/4 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-1/2 skeleton-shimmer rounded-lg" />
          <div className="h-9 w-full skeleton-shimmer rounded-xl mt-2" />
        </div>
      ))}
    </div>
  );
}

export default function UnifiedCatalogView({
  initialProducts,
  categories,
  totalCount: initialTotalCount,
  totalPages: initialTotalPages,
  currentPage: initialCurrentPage,
  title = "Product Catalog",
  subheading = "Explore our complete collection of luxury fragrances and products.",
  selectedCategorySlug = "",
  searchQuery = "",
}: UnifiedCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [products, setProducts] = useState<any[]>(initialProducts);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const activeCategory = searchParams.get("category") || selectedCategorySlug || "";
  const activeSort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const currentQ = searchParams.get("q") || searchParams.get("search") || searchQuery || "";

  const [search, setSearch] = useState(currentQ);

  useEffect(() => {
    setSearch(currentQ);
  }, [currentQ]);

  // Fetch products directly from API when URL search parameters change
  const fetchProductsFromApi = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      if (selectedCategorySlug && !params.has("category")) {
        params.set("category", selectedCategorySlug);
      }
      if (!params.has("limit")) {
        params.set("limit", "12");
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      const result = await res.json();
      if (result.success) {
        setProducts(result.data || []);
        setTotalCount(result.pagination?.totalCount ?? 0);
        setTotalPages(result.pagination?.totalPages ?? 1);
        setCurrentPage(result.pagination?.page ?? 1);
      }
    } catch (error) {
      console.error("Failed to fetch products from API:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, selectedCategorySlug]);

  useEffect(() => {
    fetchProductsFromApi();
  }, [fetchProductsFromApi]);

  // Update URL search parameters
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (!newParams.hasOwnProperty("page")) {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: search.trim() || null, page: "1" });
  };

  const handleCategorySelect = (slug: string) => {
    updateParams({ category: slug === activeCategory ? null : slug, page: "1" });
  };

  const handleSortChange = (sort: string) => {
    updateParams({ sort, page: "1" });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const handleClearAll = () => {
    setSearch("");
    router.push(pathname, { scroll: false });
  };

  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    (currentQ ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (activeSort !== "newest" ? 1 : 0);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col pt-24 pb-20">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[95rem] mx-auto px-2 sm:px-2 md:px-2 w-full space-y-2">

        {/* Breadcrumb & Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-foreground">{title}</span>
          </div>

        </div>

        {/* ─── UNIFIED TOP SEARCH BAR ─── */}
        <div className="max-w-2xl mx-auto w-full">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-card/80 backdrop-blur-md border border-border/80 rounded-full overflow-hidden shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
          >
            {/* Category Dropdown inside Search Bar */}
            <div className="hidden sm:block border-r border-border/60 relative shrink-0">
              <select
                value={activeCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="pl-5 pr-8 py-3.5 bg-transparent outline-none text-xs font-mono font-bold uppercase tracking-wider text-foreground cursor-pointer appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat: any) => (
                  <option key={cat._id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, fragrance, notes..."
              className="flex-1 px-5 py-3.5 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground font-sans min-w-0"
            />

            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); updateParams({ q: null }); }}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

            <button
              type="submit"
              className="mx-2 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-transform active:scale-95 shrink-0"
              aria-label="Search button"
            >
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* ─── CATEGORY FILTER PILLS ─── */}
        {/* ─── CATEGORY FILTER PILLS (Single Row Horizontally Scrollable) ─── */}
        {categories.length > 0 && (
          <div className="w-full flex items-center justify-start sm:justify-center flex-nowrap overflow-x-auto scrollbar-none gap-2.5 pt-2 pb-2 px-1">
            <button
              onClick={() => handleCategorySelect("")}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all border shrink-0 whitespace-nowrap ${!activeCategory
                ? "bg-foreground text-background border-foreground font-bold shadow-xs"
                : "bg-card text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                }`}
            >
              All Products ({totalCount})
            </button>
            {categories.map((cat: any) => {
              const isSelected = activeCategory === cat.slug;
              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all border shrink-0 whitespace-nowrap ${isSelected
                    ? "bg-foreground text-background border-foreground font-bold shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                    }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Active Filter Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-muted/40 rounded-2xl border border-border/60 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] uppercase font-bold text-muted-foreground">Active Filters:</span>
              {activeCategory && (
                <span className="inline-flex items-center gap-1 bg-background px-3 py-1 rounded-full border border-border font-mono text-[11px] font-bold text-foreground">
                  Category: {activeCategory}
                  <button onClick={() => updateParams({ category: null })} className="hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              {currentQ && (
                <span className="inline-flex items-center gap-1 bg-background px-3 py-1 rounded-full border border-border font-mono text-[11px] font-bold text-foreground">
                  Search: "{currentQ}"
                  <button onClick={() => { setSearch(""); updateParams({ q: null }); }} className="hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              {minPrice && (
                <span className="inline-flex items-center gap-1 bg-background px-3 py-1 rounded-full border border-border font-mono text-[11px] font-bold text-foreground">
                  Min: ${minPrice}
                  <button onClick={() => updateParams({ minPrice: null })} className="hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              {maxPrice && (
                <span className="inline-flex items-center gap-1 bg-background px-3 py-1 rounded-full border border-border font-mono text-[11px] font-bold text-foreground">
                  Max: ${maxPrice}
                  <button onClick={() => updateParams({ maxPrice: null })} className="hover:text-red-500"><X size={12} /></button>
                </span>
              )}
            </div>

            <button
              onClick={handleClearAll}
              className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold hover:underline"
            >
              Clear All
            </button>
          </div>
        )}

        {/* ─── MAIN CONTENT AREA (Sidebar + Product Grid) ─── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start pt-4">

          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            <FilterSidebar categories={categories} currentCategorySlug={activeCategory} />
          </aside>

          {/* Product Grid Container */}
          <main className="flex-1 w-full min-w-0 space-y-6">

            {/* Toolbar Header (Results Count & Sort Selector) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 mb-6 border-b border-border min-h-[44px]">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
                {isLoading && <RefreshCw size={14} className="animate-spin text-primary" />}
                Showing <strong className="text-foreground">{products.length}</strong> of <strong className="text-foreground">{totalCount}</strong> Products
              </p>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Trigger */}
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3.5 py-1.5 bg-card border border-border rounded-full text-xs font-mono uppercase tracking-wider text-foreground font-bold hover:border-foreground whitespace-nowrap shrink-0"
                >
                  <SlidersHorizontal size={14} className="shrink-0" />
                  <span className="hidden min-[400px]:inline">Filter & Sort</span>
                  <span className="inline min-[400px]:hidden">Filter</span>
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground uppercase hidden sm:inline font-bold">Sort:</span>
                  <select
                    value={activeSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-foreground outline-none cursor-pointer hover:border-foreground"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid / Shimmer Skeleton */}
            {isLoading ? (
              <ProductSkeletonGrid />
            ) : products.length === 0 ? (
              <div className="py-20 px-6 text-center glass-card border border-border rounded-3xl space-y-4">
                <PackageSearch size={48} className="mx-auto text-muted-foreground/30" />
                <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">No Products Found</h3>
                <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                  We couldn't find any products matching your search criteria or category filter.
                </p>
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest font-bold rounded-full hover:scale-105 transition-transform"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {products.map((product: any) => (
                  <div key={String(product._id)} className="w-full flex">
                    <ProductCard product={product} searchQuery={currentQ} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Page <strong className="text-foreground">{currentPage}</strong> of <strong className="text-foreground">{totalPages}</strong>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    className="px-4 py-2 border border-border rounded-xl font-mono text-xs uppercase tracking-wider font-bold text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pNum = i + 1;
                    const isCurrent = pNum === currentPage;
                    return (
                      <button
                        key={pNum}
                        onClick={() => handlePageChange(pNum)}
                        disabled={isLoading}
                        className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all ${isCurrent
                          ? "bg-foreground text-background shadow-sm"
                          : "border border-border text-foreground hover:bg-muted"
                          }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                    className="px-4 py-2 border border-border rounded-xl font-mono text-xs uppercase tracking-wider font-bold text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* Mobile Filter Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-background/80 backdrop-blur-sm lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0" onClick={() => setIsMobileFilterOpen(false)} />

          <div className="relative z-10 w-full max-w-xs bg-card h-full p-6 shadow-2xl border-l border-border overflow-y-auto">
            <FilterSidebar
              categories={categories}
              currentCategorySlug={activeCategory}
              onCloseMobile={() => setIsMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

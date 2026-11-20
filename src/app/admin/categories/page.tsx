"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { fetchPaginatedCategoriesAction, deleteCategoryAction, toggleFeaturedCategoryAction, swapTwoCategoriesAction } from "@/server/actions/categoryActions";
import { fetchSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { ICategory } from "@/server/db/models/Category";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Plus, ChevronDown, ChevronRight, CornerDownRight, Search, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";
import React from "react";

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionNames, setSectionNames] = useState({
    featured: "Shop by Category",
    sec2: "Featured Collection 1",
    sec3: "Featured Collection 2",
  });

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    fetchSiteSettingsAction(true).then((res) => {
      if (res.success && res.data) {
        setSectionNames({
          featured: res.data.featuredCategoriesSection?.heading?.trim() || "Shop by Category",
          sec2: res.data.featuredProductsSection2?.heading?.trim() || "Customize",
          sec3: res.data.featuredProductsSection3?.heading?.trim() || "Top Selling",
        });
      }
    });
  }, []);

  const loadCategories = async () => {
    const res = await fetchPaginatedCategoriesAction({}, { page: pagination.pageIndex + 1, limit: pagination.pageSize });
    if (res.success && res.data) {
      setCategories(res.data.items || []);
      setPageCount(res.data.totalPages || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteCategoryAction(id);
    await loadCategories();
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean, section: "isFeatured" | "isCustomize2" | "isCustomize3" = "isFeatured") => {
    setCategories(categories.map(c => String(c._id) === id ? { ...c, [section]: !currentStatus } as ICategory : c));
    await toggleFeaturedCategoryAction(id, !currentStatus, section);
    await loadCategories();
  };

  const handleMoveCategory = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topLevelCategories.length) return;

    const catA = topLevelCategories[index];
    const catB = topLevelCategories[targetIndex];
    if (!catA?._id || !catB?._id) return;

    // Optimistic update
    const updated = [...categories];
    const idxA = updated.findIndex((c) => String(c._id) === String(catA._id));
    const idxB = updated.findIndex((c) => String(c._id) === String(catB._id));
    if (idxA !== -1 && idxB !== -1) {
      const temp = updated[idxA];
      updated[idxA] = updated[idxB];
      updated[idxB] = temp;
      setCategories(updated);
    }

    try {
      const res = await swapTwoCategoriesAction(String(catA._id), String(catB._id));
      if (!res.success) {
        toast.error("Failed to swap category order");
        loadCategories();
      } else {
        toast.success(`Position swapped with ${catB.name}`);
      }
    } catch {
      loadCategories();
    }
  };

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c =>
      c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const topLevelCategories = filteredCategories.filter(c => !c.parent);
  const getSubCategories = (parentId: string) =>
    filteredCategories.filter(c => {
      if (!c.parent) return false;
      const pId = typeof c.parent === "object" && "_id" in c.parent ? String(c.parent._id) : String(c.parent);
      return pId === parentId;
    });

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage product categories and collections.</p>
        </div>
        <Link 
          href="/admin/categories/new" 
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus size={18} />
          Add Category
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      
      <div className="glass-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-4 font-semibold text-muted-foreground text-center w-24 whitespace-nowrap">Position</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground whitespace-nowrap">Name</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground whitespace-nowrap">Slug</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-xs uppercase tracking-wider">{sectionNames.featured}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Featured</span>
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-muted-foreground whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-xs uppercase tracking-wider">{sectionNames.sec2}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Customize 2</span>
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-muted-foreground whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-xs uppercase tracking-wider">{sectionNames.sec3}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Customize 3</span>
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : topLevelCategories.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  {searchQuery ? `No categories matching "${searchQuery}"` : "No categories found."}
                </td></tr>
              ) : topLevelCategories.map((cat, catIdx) => {
                const subs = getSubCategories(String(cat._id));
                const isExpanded = !!expanded[String(cat._id)];
                
                return (
                  <React.Fragment key={String(cat._id)}>
                    <tr className="hover:bg-muted/50 transition-colors border-b border-border/50">
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-muted-foreground w-6">
                            #{catIdx + 1}
                          </span>
                          <div className="flex flex-col gap-0.5 bg-muted/60 rounded border border-border/80 p-0.5 shadow-2xs">
                            <button
                              type="button"
                              disabled={catIdx === 0}
                              onClick={() => handleMoveCategory(catIdx, "up")}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background rounded transition cursor-pointer"
                              title="Move Category Up"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={catIdx === topLevelCategories.length - 1}
                              onClick={() => handleMoveCategory(catIdx, "down")}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background rounded transition cursor-pointer"
                              title="Move Category Down"
                            >
                              <ChevronDown size={12} />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {subs.length > 0 ? (
                            <button onClick={() => toggleExpand(String(cat._id))} className="p-1 hover:bg-muted rounded-md text-muted-foreground">
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          ) : (
                            <span className="w-6 inline-block"></span>
                          )}
                          {cat.name}
                          {subs.length > 0 && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{subs.length}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-muted-foreground text-xs">{cat.slug}</td>
                      <td className="px-6 py-4">
                        <ToggleSwitch checked={!!cat.isFeatured} onChange={() => handleToggleFeatured(String(cat._id), !!cat.isFeatured, "isFeatured")} />
                      </td>
                      <td className="px-6 py-4">
                        <ToggleSwitch checked={!!cat.isCustomize2} onChange={() => handleToggleFeatured(String(cat._id), !!cat.isCustomize2, "isCustomize2")} />
                      </td>
                      <td className="px-6 py-4">
                        <ToggleSwitch checked={!!cat.isCustomize3} onChange={() => handleToggleFeatured(String(cat._id), !!cat.isCustomize3, "isCustomize3")} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 flex-wrap">
                          <Link href={`/admin/categories/new?parent=${cat._id}`} className="text-sm font-semibold text-blue-500 hover:underline whitespace-nowrap">
                            + Sub
                          </Link>
                          <Link href={`/admin/categories/${cat._id}`} className="text-sm font-semibold text-primary hover:underline">
                            Edit
                          </Link>
                          <button onClick={() => handleDelete(String(cat._id))} className="text-sm font-semibold text-red-500 hover:underline">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && subs.map(sub => (
                      <tr key={String(sub._id)} className="bg-muted/10 hover:bg-muted/50 transition-colors border-b border-border/50">
                        <td className="px-6 py-3 text-foreground pl-12">
                          <div className="flex items-center gap-2">
                            <CornerDownRight size={14} className="text-muted-foreground" />
                            {sub.name}
                          </div>
                        </td>
                        <td className="px-6 py-3 font-mono text-muted-foreground text-xs">{sub.slug}</td>
                        <td className="px-6 py-3">
                          <ToggleSwitch checked={!!sub.isFeatured} onChange={() => handleToggleFeatured(String(sub._id), !!sub.isFeatured, "isFeatured")} />
                        </td>
                        <td className="px-6 py-3">
                          <ToggleSwitch checked={!!sub.isCustomize2} onChange={() => handleToggleFeatured(String(sub._id), !!sub.isCustomize2, "isCustomize2")} />
                        </td>
                        <td className="px-6 py-3">
                          <ToggleSwitch checked={!!sub.isCustomize3} onChange={() => handleToggleFeatured(String(sub._id), !!sub.isCustomize3, "isCustomize3")} />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link href={`/admin/categories/${sub._id}`} className="text-sm font-semibold text-primary hover:underline">
                              Edit
                            </Link>
                            <button onClick={() => handleDelete(String(sub._id))} className="text-sm font-semibold text-red-500 hover:underline">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between py-4 px-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Page {pagination.pageIndex + 1} of {Math.max(1, pageCount)}
            {searchQuery && ` · ${topLevelCategories.length} results`}
          </div>
          <div className="space-x-2">
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border border-input bg-background disabled:opacity-50"
              onClick={() => setPagination(p => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))}
              disabled={pagination.pageIndex === 0}
            >
              Previous
            </button>
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border border-input bg-background disabled:opacity-50"
              onClick={() => setPagination(p => ({ ...p, pageIndex: Math.min(Math.max(0, pageCount - 1), p.pageIndex + 1) }))}
              disabled={pagination.pageIndex >= pageCount - 1 || pageCount === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


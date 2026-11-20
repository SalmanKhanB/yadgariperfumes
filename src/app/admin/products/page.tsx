"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  fetchPaginatedProductsAction,
  deleteProductAction,
  toggleFeaturedProductAction,
  swapTwoProductsAction,
} from "@/server/actions/productActions";
import { fetchSiteSettingsAction } from "@/server/actions/siteSettingsActions";
import { IProduct } from "@/server/db/models/Product";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  Sparkles,
  Sliders,
  Flame,
  Package,
  ArrowUpDown,
  Plus,
} from "lucide-react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { toast } from "react-hot-toast";

type BlockFilter = "all" | "isFeatured" | "isCustomize2" | "isCustomize3";

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [pageCount, setPageCount] = useState(0);
  const [activeBlock, setActiveBlock] = useState<BlockFilter>("all");
  const [sectionNames, setSectionNames] = useState({
    sec1: "Featured Products",
    sec2: "Customize",
    sec3: "Top Selling",
  });

  const loadData = async (
    block: BlockFilter = activeBlock,
    page: number = pagination.pageIndex,
    size: number = pagination.pageSize
  ) => {
    setLoading(true);
    const filter = block === "all" ? {} : { [block]: true };
    const res = await fetchPaginatedProductsAction(filter, {
      page: page + 1,
      limit: size,
    });
    if (res.success && res.data) {
      setProducts(res.data.items || []);
      setPageCount(res.data.totalPages || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(activeBlock, pagination.pageIndex, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize, activeBlock]);

  useEffect(() => {
    fetchSiteSettingsAction(true).then((res) => {
      if (res.success && res.data) {
        setSectionNames({
          sec1: res.data.bestProductsSection?.heading?.trim() || "Featured Products",
          sec2: res.data.featuredProductsSection2?.heading?.trim() || "Customize",
          sec3: res.data.featuredProductsSection3?.heading?.trim() || "Top Selling",
        });
      }
    });
  }, []);

  const handleBlockChange = (newBlock: BlockFilter) => {
    setActiveBlock(newBlock);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteProductAction(id);
    await loadData();
  };

  const handleToggleFeatured = async (
    id: string,
    currentStatus: boolean,
    section: "isFeatured" | "isCustomize2" | "isCustomize3" = "isFeatured"
  ) => {
    await toggleFeaturedProductAction(id, !currentStatus, section);
    await loadData();
  };

  const handleMoveProduct = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const prodA = products[index];
    const prodB = products[targetIndex];
    if (!prodA?._id || !prodB?._id) return;

    // Optimistic local state update for instant UI feedback
    const nextList = [...products];
    nextList[index] = prodB;
    nextList[targetIndex] = prodA;
    setProducts(nextList);

    try {
      const res = await swapTwoProductsAction(String(prodA._id), String(prodB._id));
      if (!res.success) {
        toast.error(res.error || "Failed to swap product order");
        loadData();
      } else {
        toast.success(`Position swapped with ${prodB.name}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to swap order");
      loadData();
    }
  };

  const columns = useMemo<ColumnDef<IProduct>[]>(
    () => [
      {
        id: "order",
        header: () => (
          <div className="text-center font-bold text-xs uppercase tracking-wider text-muted-foreground w-20">
            Position
          </div>
        ),
        cell: ({ row }) => {
          const idx = row.index;
          const pos = idx + 1 + pagination.pageIndex * pagination.pageSize;
          return (
            <div className="flex items-center justify-center gap-1.5">
              <span className="font-mono text-xs font-bold text-muted-foreground w-6 text-center">
                #{pos}
              </span>
              <div className="flex flex-col gap-0.5 bg-muted/60 rounded border border-border/80 p-0.5 shadow-2xs">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveProduct(idx, "up")}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background rounded transition cursor-pointer"
                  title="Move Up (Swap with Previous Product)"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  disabled={idx === products.length - 1}
                  onClick={() => handleMoveProduct(idx, "down")}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background rounded transition cursor-pointer"
                  title="Move Down (Swap with Next Product)"
                >
                  <ChevronDown size={13} />
                </button>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="font-medium text-foreground">{row.getValue("name")}</span>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => <span className="font-mono">{formatPrice(Number(row.getValue("price")))}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <span
              className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${
                status === "active" ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: "featured",
        header: () => (
          <div className="flex flex-col py-1">
            <span className="font-bold text-foreground text-xs uppercase tracking-wider whitespace-nowrap">
              {sectionNames.sec1}
            </span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Customize 1
            </span>
          </div>
        ),
        cell: ({ row }) => {
          const isFeatured = row.original.isFeatured;
          return (
            <ToggleSwitch
              checked={!!isFeatured}
              onChange={() =>
                handleToggleFeatured(String(row.original._id), !!isFeatured, "isFeatured")
              }
            />
          );
        },
      },
      {
        id: "customize2",
        header: () => (
          <div className="flex flex-col py-1">
            <span className="font-bold text-foreground text-xs uppercase tracking-wider whitespace-nowrap">
              {sectionNames.sec2}
            </span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Customize 2
            </span>
          </div>
        ),
        cell: ({ row }) => {
          const isCustomize2 = row.original.isCustomize2;
          return (
            <ToggleSwitch
              checked={!!isCustomize2}
              onChange={() =>
                handleToggleFeatured(String(row.original._id), !!isCustomize2, "isCustomize2")
              }
            />
          );
        },
      },
      {
        id: "customize3",
        header: () => (
          <div className="flex flex-col py-1">
            <span className="font-bold text-foreground text-xs uppercase tracking-wider whitespace-nowrap">
              {sectionNames.sec3}
            </span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Customize 3
            </span>
          </div>
        ),
        cell: ({ row }) => {
          const isCustomize3 = row.original.isCustomize3;
          return (
            <ToggleSwitch
              checked={!!isCustomize3}
              onChange={() =>
                handleToggleFeatured(String(row.original._id), !!isCustomize3, "isCustomize3")
              }
            />
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right space-x-4">
            <Link
              href={`/admin/products/${row.original._id}`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(String(row.original._id))}
              className="text-sm font-semibold text-red-500 hover:underline cursor-pointer"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [products, formatPrice, sectionNames, pagination]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your store catalog, position ordering, and featured homepage blocks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/products/reorder"
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-secondary/80 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <ArrowUpDown size={15} /> Drag & Drop Reorder
          </Link>
          <Link
            href="/admin/products/new"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      {/* Specific Block Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border/80">
        <button
          type="button"
          onClick={() => handleBlockChange("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeBlock === "all"
              ? "bg-foreground text-background shadow-xs font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          }`}
        >
          <Package size={14} /> All Products
        </button>

        <button
          type="button"
          onClick={() => handleBlockChange("isFeatured")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeBlock === "isFeatured"
              ? "bg-amber-500 text-black shadow-xs font-black ring-1 ring-amber-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          }`}
        >
          <Sparkles size={14} className={activeBlock === "isFeatured" ? "fill-current" : ""} />
          <span>{sectionNames.sec1} (Customize 1)</span>
        </button>

        <button
          type="button"
          onClick={() => handleBlockChange("isCustomize2")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeBlock === "isCustomize2"
              ? "bg-primary text-primary-foreground shadow-xs font-black ring-1 ring-primary/40"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          }`}
        >
          <Sliders size={14} />
          <span>{sectionNames.sec2} (Customize 2)</span>
        </button>

        <button
          type="button"
          onClick={() => handleBlockChange("isCustomize3")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeBlock === "isCustomize3"
              ? "bg-rose-500 text-white shadow-xs font-black ring-1 ring-rose-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          }`}
        >
          <Flame size={14} className={activeBlock === "isCustomize3" ? "fill-current" : ""} />
          <span>{sectionNames.sec3} (Customize 3)</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-background rounded-2xl border border-border shadow-xs p-4">
        {loading && products.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse font-mono text-xs uppercase tracking-wider">
            Loading products...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={products}
            searchKey="name"
            pageCount={pageCount}
            manualPagination={true}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        )}
      </div>
    </div>
  );
}

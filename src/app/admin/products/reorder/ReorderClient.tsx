"use client";

import { useState, useMemo } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { bulkUpdateProductOrderAction } from "@/server/actions/productActions";
import { toast } from "react-hot-toast";
import { 
  GripVertical, 
  Save, 
  Loader2, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Sliders, 
  Flame, 
  Package 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type BlockFilter = "all" | "isFeatured" | "isCustomize2" | "isCustomize3";

interface SortableItemProps {
  id: string;
  product: any;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SortableItem({ id, product, index, total, onMoveUp, onMoveDown }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const imgUrl = product.images?.[0]?.url || (typeof product.images?.[0] === "string" ? product.images[0] : null);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 sm:gap-4 p-3.5 mb-2.5 bg-card border ${
        isDragging
          ? "border-primary ring-2 ring-primary/40 shadow-xl scale-[1.01]"
          : "border-border hover:border-foreground/30 shadow-2xs"
      } rounded-2xl transition-all select-none`}
    >
      {/* Position # */}
      <span className="font-mono text-xs font-bold text-muted-foreground w-6 text-center shrink-0">
        #{index + 1}
      </span>

      {/* Drag Grip */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing hover:text-primary transition-colors touch-none p-1.5 rounded-lg hover:bg-muted shrink-0"
        title="Drag to swap / reorder"
      >
        <GripVertical size={18} className="text-muted-foreground" />
      </div>

      {/* Image */}
      <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden relative shrink-0 border border-border/80">
        {imgUrl ? (
          <Image src={imgUrl} alt={product.name} fill className="object-cover" sizes="48px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px] font-mono uppercase">
            No img
          </div>
        )}
      </div>

      {/* Name & Block Badges */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-foreground truncate">{product.name}</h4>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {product.isFeatured && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Featured 1
            </span>
          )}
          {product.isCustomize2 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Customize 2
            </span>
          )}
          {product.isCustomize3 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-500/20">
              Top Selling 3
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-xs font-mono font-bold text-muted-foreground bg-muted/40 border border-border/70 px-2.5 py-1 rounded-lg shrink-0 hidden sm:block">
        {product.price} AED
      </div>

      {/* 1-Click Move Up / Down Buttons */}
      <div className="flex flex-col gap-0.5 shrink-0 bg-muted/50 rounded border border-border/60 p-0.5">
        <button
          type="button"
          disabled={index === 0}
          onClick={onMoveUp}
          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background rounded transition cursor-pointer"
          title="Move Up"
        >
          <ChevronUp size={13} />
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={onMoveDown}
          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed hover:bg-background rounded transition cursor-pointer"
          title="Move Down"
        >
          <ChevronDown size={13} />
        </button>
      </div>
    </div>
  );
}

export default function ReorderClient({ initialProducts }: { initialProducts: any[] }) {
  const [activeTab, setActiveTab] = useState<BlockFilter>("all");
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtered view based on selected tab
  const displayedItems = useMemo(() => {
    if (activeTab === "all") return allProducts;
    return allProducts.filter((p) => !!p[activeTab]);
  }, [allProducts, activeTab]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (activeTab === "all") {
      setAllProducts((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    } else {
      // Reorder within the filtered subset while maintaining position sequence in allProducts
      const oldSubIndex = displayedItems.findIndex((item) => item._id === active.id);
      const newSubIndex = displayedItems.findIndex((item) => item._id === over.id);
      const reorderedSubset = arrayMove(displayedItems, oldSubIndex, newSubIndex);

      // Re-map back into allProducts
      let subIdx = 0;
      const updated = allProducts.map((p) => {
        if (p[activeTab]) {
          const replacement = reorderedSubset[subIdx];
          subIdx++;
          return replacement;
        }
        return p;
      });
      setAllProducts(updated);
    }
  };

  const handleMove = (indexInDisplayed: number, direction: "up" | "down") => {
    const targetSubIndex = direction === "up" ? indexInDisplayed - 1 : indexInDisplayed + 1;
    if (targetSubIndex < 0 || targetSubIndex >= displayedItems.length) return;

    const reorderedSubset = arrayMove(displayedItems, indexInDisplayed, targetSubIndex);

    if (activeTab === "all") {
      setAllProducts(reorderedSubset);
    } else {
      let subIdx = 0;
      const updated = allProducts.map((p) => {
        if (p[activeTab]) {
          const replacement = reorderedSubset[subIdx];
          subIdx++;
          return replacement;
        }
        return p;
      });
      setAllProducts(updated);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const orderedIds = allProducts.map((item) => item._id);

    const res = await bulkUpdateProductOrderAction(orderedIds);
    if (res.success) {
      toast.success("Product order updated successfully!");
      router.refresh();
      router.push("/admin/products");
    } else {
      toast.error(res.error || "Failed to update product order");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tabs & Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Specific Block Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "all"
                ? "bg-foreground text-background shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package size={13} /> All ({allProducts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("isFeatured")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "isFeatured"
                ? "bg-amber-500 text-black shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles size={13} className={activeTab === "isFeatured" ? "fill-current" : ""} />
            <span>Customize 1 ({allProducts.filter((p) => p.isFeatured).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("isCustomize2")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "isCustomize2"
                ? "bg-primary text-primary-foreground shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders size={13} />
            <span>Customize 2 ({allProducts.filter((p) => p.isCustomize2).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("isCustomize3")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "isCustomize3"
                ? "bg-rose-500 text-white shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame size={13} className={activeTab === "isCustomize3" ? "fill-current" : ""} />
            <span>Top Selling ({allProducts.filter((p) => p.isCustomize3).length})</span>
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save Order"}
        </button>
      </div>

      {displayedItems.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 border border-dashed border-border rounded-2xl text-muted-foreground font-mono text-xs">
          No products found in this section. Toggle products into this block from the Products page.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayedItems.map((i) => i._id)} strategy={verticalListSortingStrategy}>
            <div>
              {displayedItems.map((product, idx) => (
                <SortableItem
                  key={product._id}
                  id={product._id}
                  product={product}
                  index={idx}
                  total={displayedItems.length}
                  onMoveUp={() => handleMove(idx, "up")}
                  onMoveDown={() => handleMove(idx, "down")}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

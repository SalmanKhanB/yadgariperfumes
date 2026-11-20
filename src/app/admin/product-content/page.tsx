"use client";

import { useEffect, useState } from "react";
import { fetchProductsAction, updateProductAction } from "@/server/actions/productActions";
import { fetchAllReviewsByProductIdAction, updateReviewStatusAction, deleteReviewAction, adminSubmitReviewAction } from "@/server/actions/reviewActions";
import { IProduct } from "@/server/db/models/Product";
import Link from "next/link";
import { ChevronDown, ChevronUp, MonitorPlay, MessageSquare, Plus, Trash2, Search, ChevronRight } from "lucide-react";

export default function ProductContentPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetchProductsAction();
    if (res.success) setProducts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <MonitorPlay className="w-8 h-8 text-primary" /> Product Content
          </h1>
          <p className="text-muted-foreground mt-1">Manage iframes and customer reviews for all products in one place.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <div className="divide-y divide-border">
            {filteredProducts.map((product) => (
              <ProductContentRow 
                key={String(product._id)} 
                product={product} 
                isExpanded={expandedRow === String(product._id)}
                onToggle={() => setExpandedRow(expandedRow === String(product._id) ? null : String(product._id))}
                onProductUpdated={loadProducts}
              />
            ))}
            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No products found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductContentRow({ product, isExpanded, onToggle, onProductUpdated }: { 
  product: IProduct, 
  isExpanded: boolean, 
  onToggle: () => void,
  onProductUpdated: () => void
}) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [iframes, setIframes] = useState<string[]>(product.iframeEmbeds || []);
  const [savingIframes, setSavingIframes] = useState(false);
  
  // New Review Form
  const [newReview, setNewReview] = useState({ authorName: "", authorEmail: "", rating: 5, body: "" });
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      loadReviews();
    }
  }, [isExpanded]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    const res = await fetchAllReviewsByProductIdAction(String(product._id));
    if (res.success) setReviews(res.data);
    setLoadingReviews(false);
  };

  const handleUpdateIframes = async () => {
    setSavingIframes(true);
    await updateProductAction(String(product._id), { iframeEmbeds: iframes });
    setSavingIframes(false);
    onProductUpdated(); // Refresh parent if needed
  };

  const submitNewReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.authorName || !newReview.body) return;
    setSavingReview(true);
    const res = await adminSubmitReviewAction({
      ...newReview,
      productId: String(product._id) as any,
      status: 'approved',
      isVerifiedPurchase: true
    });
    if (res.success) {
      setNewReview({ authorName: "", authorEmail: "", rating: 5, body: "" });
      loadReviews();
    }
    setSavingReview(false);
  };

  const updateStatus = async (id: string, status: 'approved'|'rejected') => {
    await updateReviewStatusAction(id, status);
    loadReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await deleteReviewAction(id);
    loadReviews();
  };

  return (
    <div className={`transition-colors hover:bg-muted/50`}>
      <Link 
        href={`/admin/product-content/${product._id}`}
        className="px-6 py-4 flex items-center justify-between cursor-pointer block"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted rounded border border-border overflow-hidden flex items-center justify-center">
             {product.images && product.images.length > 0 ? (
               <img src={(product.images[0] as any).url || product.images[0]} alt="" className="w-full h-full object-cover" />
             ) : (
               <MonitorPlay className="w-5 h-5 text-muted-foreground opacity-50" />
             )}
          </div>
          <div>
            <h3 className="font-bold">{product.name}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><MonitorPlay size={12} /> {product.iframeEmbeds?.length || 0} Iframes</span>
              <span className="flex items-center gap-1"><MessageSquare size={12} /> Reviews</span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </Link>
    </div>
  );
}

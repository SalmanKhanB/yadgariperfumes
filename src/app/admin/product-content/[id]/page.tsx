"use client";

import { useEffect, useState, use } from "react";
import { fetchProductByIdAction, updateProductAction } from "@/server/actions/productActions";
import { fetchAllReviewsByProductIdAction, updateReviewStatusAction, deleteReviewAction, adminSubmitReviewAction } from "@/server/actions/reviewActions";
import { IProduct } from "@/server/db/models/Product";
import Link from "next/link";
import { MonitorPlay, MessageSquare, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductContentEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  const [iframes, setIframes] = useState<string[]>([]);
  const [savingIframes, setSavingIframes] = useState(false);
  
  const [newReview, setNewReview] = useState({ authorName: "", authorEmail: "", rating: 5, body: "" });
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchProductByIdAction(resolvedParams.id);
    if (res.success && res.data) {
      setProduct(res.data);
      setIframes(res.data.iframeEmbeds || []);
      loadReviews(res.data._id);
    }
    setLoading(false);
  };

  const loadReviews = async (productId: string) => {
    setLoadingReviews(true);
    const res = await fetchAllReviewsByProductIdAction(String(productId));
    if (res.success) setReviews(res.data);
    setLoadingReviews(false);
  };

  const handleUpdateIframes = async () => {
    if (!product) return;
    setSavingIframes(true);
    await updateProductAction(String(product._id), { iframeEmbeds: iframes });
    setSavingIframes(false);
  };

  const submitNewReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newReview.authorName || !newReview.body) return;
    setSavingReview(true);
    const res = await adminSubmitReviewAction({
      ...newReview,
      productId: String(product._id) as any,
      status: 'approved',
      isVerifiedPurchase: true
    });
    if (res.success) {
      setNewReview({ authorName: "", authorEmail: "", rating: 5, body: "" });
      loadReviews(String(product._id));
    }
    setSavingReview(false);
  };

  const updateStatus = async (id: string, status: 'approved'|'rejected') => {
    if (!product) return;
    await updateReviewStatusAction(id, status);
    loadReviews(String(product._id));
  };

  const deleteReview = async (id: string) => {
    if (!product || !confirm("Delete this review?")) return;
    await deleteReviewAction(id);
    loadReviews(String(product._id));
  };

  if (loading) {
    return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!product) {
    return <div className="p-8 text-center">Product not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/product-content" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground mt-1">Manage content and reviews for this product.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* IFRAMES SECTION */}
        <div className="space-y-4 bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><MonitorPlay className="text-primary"/> Iframe Embeds</h2>
            <button 
              onClick={() => setIframes([...iframes, ""])}
              className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md flex items-center gap-1 transition text-sm font-semibold"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          {iframes.length === 0 ? (
            <div className="text-sm text-muted-foreground italic text-center p-8 bg-muted/20 rounded-lg border border-dashed border-border">No iframes added.</div>
          ) : (
            <div className="space-y-4 pt-2">
              {iframes.map((iframe, idx) => (
                <div key={idx} className="relative group">
                  <textarea 
                    value={iframe}
                    onChange={(e) => {
                      const newIframes = [...iframes];
                      newIframes[idx] = e.target.value;
                      setIframes(newIframes);
                    }}
                    rows={4}
                    className="w-full border border-border rounded-lg p-3 text-sm bg-background focus:ring-2 focus:ring-primary outline-none font-mono resize-y"
                    placeholder={'<iframe src="..."></iframe>'}
                  />
                  <button 
                    onClick={() => setIframes(iframes.filter((_, i) => i !== idx))}
                    className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur rounded shadow-sm p-1.5 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button 
                onClick={handleUpdateIframes}
                disabled={savingIframes}
                className="w-full bg-secondary text-secondary-foreground font-bold py-3 rounded-lg hover:bg-secondary/90 transition shadow-sm"
              >
                {savingIframes ? "Saving..." : "Save Iframes"}
              </button>
            </div>
          )}
        </div>

        {/* REVIEWS SECTION */}
        <div className="space-y-4 bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="text-primary"/> Customer Reviews</h2>
          </div>

          {loadingReviews ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Loading reviews...</div>
          ) : (
            <div className="space-y-6 pt-2">
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic text-center p-8 bg-muted/20 rounded-lg border border-dashed border-border">No reviews found.</div>
                ) : (
                  reviews.map((r, i) => (
                    <div key={r._id || i} className="border border-border rounded-lg p-4 bg-background shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold">{r.authorName}</p>
                          <p className="text-yellow-500 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{r.body}</p>
                      <div className="flex gap-2 pt-3 border-t border-border/50">
                        {r.status !== 'approved' && (
                          <button onClick={() => updateStatus(r._id, 'approved')} className="text-xs font-semibold bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 transition">Approve</button>
                        )}
                        {r.status !== 'rejected' && (
                          <button onClick={() => updateStatus(r._id, 'rejected')} className="text-xs font-semibold bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition">Reject</button>
                        )}
                        <button onClick={() => deleteReview(r._id)} className="text-xs font-semibold bg-muted hover:bg-red-500 hover:text-white px-3 py-1.5 rounded ml-auto transition">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Manual Review */}
              <form onSubmit={submitNewReview} className="bg-muted/30 p-5 rounded-xl border border-border mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Add Manual Review</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input 
                    value={newReview.authorName} onChange={e => setNewReview({...newReview, authorName: e.target.value})}
                    placeholder="Author Name" className="border border-border rounded-lg p-2 text-sm bg-background w-full focus:ring-2 focus:ring-primary outline-none" required 
                  />
                  <input 
                    type="number" min="1" max="5" 
                    value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})}
                    placeholder="Rating (1-5)" className="border border-border rounded-lg p-2 text-sm bg-background w-full focus:ring-2 focus:ring-primary outline-none" required 
                  />
                </div>
                <textarea 
                  value={newReview.body} onChange={e => setNewReview({...newReview, body: e.target.value})}
                  placeholder="Review Text" className="border border-border rounded-lg p-2 text-sm bg-background w-full mb-3 focus:ring-2 focus:ring-primary outline-none" rows={3} required 
                />
                <button type="submit" disabled={savingReview} className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm">
                  {savingReview ? "Adding..." : "Add Approved Review"}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

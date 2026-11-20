"use client";

import { useEffect, useState } from "react";
import { fetchCelebrityReviewsAction, toggleCelebrityReviewActiveAction, deleteCelebrityReviewAction } from "@/server/actions/celebrityReviewActions";
import { ICelebrityReview } from "@/server/db/models/CelebrityReview";
import Link from "next/link";
import { Plus, CheckCircle, XCircle, Trash2, Edit } from "lucide-react";

export default function CelebrityReviewsAdminPage() {
  const [reviews, setReviews] = useState<ICelebrityReview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    const res = await fetchCelebrityReviewsAction();
    if (res.success) setReviews(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await toggleCelebrityReviewActiveAction(id, !currentStatus);
    await loadReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently DELETE this celebrity review?")) return;
    await deleteCelebrityReviewAction(id);
    await loadReviews();
  };

  return (
    <div className="p-8 max-w-[90rem] mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Celebrity Video Reviews</h1>
          <p className="text-muted-foreground mt-1">Manage video iframes shown on the storefront homepage.</p>
        </div>
        <Link 
          href="/admin/celebrity-reviews/new" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Add New Review
        </Link>
      </div>

      <div className="glass-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold text-muted-foreground">Celebrity Name</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Preview</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Order</th>
              <th className="px-6 py-4 font-bold text-muted-foreground">Status</th>
              <th className="px-6 py-4 font-bold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Loading reviews...</td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No celebrity reviews found. Click "Add New Review" to create one.</td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={String(review._id)} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{review.celebrityName}</td>
                  <td className="px-6 py-4">
                    <div 
                      className="w-32 h-20 bg-black rounded overflow-hidden relative pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: review.videoIframe }}
                    />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{review.order}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleActive(String(review._id), review.isActive)}
                      className={`flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full transition-colors border ${review.isActive ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'}`}
                    >
                      {review.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {review.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <Link href={`/admin/celebrity-reviews/${review._id}`} className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1">
                      <Edit size={16} /> Edit
                    </Link>
                    <button onClick={() => handleDelete(String(review._id))} className="text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1">
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

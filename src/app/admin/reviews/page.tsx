"use client";

import { useEffect, useState } from "react";
import { fetchPendingReviewsAction, updateReviewStatusAction, toggleReviewVerificationAction, deleteReviewAction } from "@/server/actions/reviewActions";
import { IReview } from "@/server/db/models/Review";
import Link from "next/link";
import { CheckCircle, XCircle, ShieldCheck, Trash2 } from "lucide-react";

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    const res = await fetchPendingReviewsAction();
    if (res.success) setReviews(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    if (!confirm(`Are you sure you want to ${status} this review?`)) return;
    await updateReviewStatusAction(id, status);
    await loadReviews();
  };

  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    await toggleReviewVerificationAction(id, !currentStatus);
    await loadReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to permanently DELETE this review?`)) return;
    await deleteReviewAction(id);
    await loadReviews();
  };

  return (
    <div className="p-8 max-w-[90rem] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Review Moderation Queue</h1>
        <p className="text-muted-foreground mt-1">Approve or reject customer reviews. Approving a review will automatically recalculate the product's average rating.</p>
      </div>

      <div className="glass-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Product</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Author</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Rating</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground">Review</th>
              <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading queue...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground font-medium">No pending reviews in the queue. You're all caught up!</td></tr>
            ) : reviews.map((review: any) => (
              <tr key={review._id as string} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/products/${review.productId?._id}`} target="_blank" className="font-semibold text-primary hover:underline">
                    {review.productId?.name || "Unknown Product"}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-foreground">{review.authorName || "Anonymous"}</div>
                  <div className="text-xs text-muted-foreground">{review.authorEmail || "No Email"}</div>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-yellow-500 text-lg">
                  {"★".repeat(review.rating)}
                  <span className="text-muted-foreground/30">{"★".repeat(5 - review.rating)}</span>
                </td>
                <td className="px-6 py-4 max-w-sm">
                  <p className="truncate text-foreground font-medium" title={review.body}>{review.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(review.createdAt!).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleToggleVerification(review._id as string, review.isVerifiedPurchase)}
                    className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors"
                    title="Toggle Verified Buyer Badge"
                  >
                    <ShieldCheck size={14} /> Verify
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(review._id as string, "approved")}
                    className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(review._id as string, "rejected")}
                    className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-colors"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button 
                    onClick={() => handleDelete(review._id as string)}
                    className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

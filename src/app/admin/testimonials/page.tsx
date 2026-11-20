"use client";

import { useEffect, useState } from "react";
import { fetchTestimonialsAction, deleteTestimonialAction } from "@/server/actions/testimonialActions";
import Link from "next/link";
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetchTestimonialsAction();
    if (res.success && res.data) {
      setTestimonials(res.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      await deleteTestimonialAction(id);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Manage customer testimonials shown on the storefront.</p>
        </div>
        <Link 
          href="/admin/testimonials/new"
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} /> Add Testimonial
        </Link>
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Author</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Content</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Rating</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Order</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : testimonials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No testimonials found. Add one to get started.</td>
                </tr>
              ) : (
                testimonials.map((t) => (
                  <tr key={String(t._id)} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        {t.avatarImage ? (
                          <img src={t.avatarImage} alt={t.authorName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">{t.authorName.charAt(0)}</div>
                        )}
                        <div>
                          <div>{t.authorName}</div>
                          <div className="text-xs text-muted-foreground">{t.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">{t.content}</td>
                    <td className="px-6 py-4 text-yellow-500 font-bold">{t.rating} / 5</td>
                    <td className="px-6 py-4">
                      {t.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                          <CheckCircle2 size={14} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                          <XCircle size={14} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{t.order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/testimonials/${t._id}`}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors bg-background rounded-md border border-border hover:border-primary shadow-sm"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(t._id)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors bg-background rounded-md border border-border hover:border-red-500 shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

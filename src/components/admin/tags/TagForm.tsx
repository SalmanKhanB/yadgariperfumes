"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTagAction, updateTagAction, deleteTagAction } from "@/server/actions/tagActions";
import { ITag } from "@/server/db/models/Tag";
import { Save, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  initialData?: ITag | null;
}

export default function TagForm({ initialData }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<ITag>>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
  });
  const [loading, setLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !initialData ? generateSlug(name) : prev.slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let res;
    if (initialData?._id) {
      res = await updateTagAction(String(initialData._id), formData);
    } else {
      res = await createTagAction(formData);
    }
    setLoading(false);
    
    if (res.success) {
      router.push("/admin/tags");
      router.refresh();
    } else {
      alert("Error saving tag: " + res.error);
    }
  };

  const handleDelete = async () => {
    if (!initialData?._id || !confirm("Are you sure you want to delete this tag?")) return;
    setLoading(true);
    const res = await deleteTagAction(String(initialData._id));
    if (res.success) {
      router.push("/admin/tags");
      router.refresh();
    } else {
      alert("Error deleting tag: " + res.error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/tags" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Tags
        </Link>
        <div className="flex items-center gap-4">
          {initialData && (
            <button 
              type="button" 
              onClick={handleDelete}
              disabled={loading}
              className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Save size={20} /> {loading ? "Saving..." : "Save Tag"}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border p-8 space-y-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Tag Name</label>
          <input 
            type="text" 
            required
            value={formData.name || ""} 
            onChange={(e) => handleNameChange(e.target.value)} 
            className="w-full border border-border bg-background rounded-xl p-3 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
            placeholder="e.g., Summer Sale"
          />
        </div>
        
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">URL Slug</label>
          <input 
            type="text" 
            required
            value={formData.slug || ""} 
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
            className="w-full border border-border bg-background rounded-xl p-3 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
            placeholder="e.g., summer-sale"
          />
        </div>
      </div>
    </div>
  );
}

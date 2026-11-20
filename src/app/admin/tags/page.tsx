import { getTags } from "@/server/repositories/tagRepository";
import Link from "next/link";
import { Plus, Tag as TagIcon, Edit } from "lucide-react";

export const revalidate = 0;

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
            <TagIcon className="text-primary" size={32} /> Tags
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage product tags.</p>
        </div>
        <Link 
          href="/admin/tags/new" 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-primary/20"
        >
          <Plus size={20} /> Create Tag
        </Link>
      </div>

      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Name</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Slug</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground font-medium">
                  No tags found. Create one to get started!
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={String(tag._id)} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-bold text-foreground">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {tag.name}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground font-mono text-sm">{tag.slug}</td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/admin/tags/${tag._id}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Edit size={16} /> Edit
                    </Link>
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

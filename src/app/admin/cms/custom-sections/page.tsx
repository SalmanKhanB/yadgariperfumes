import { getCustomSections, deleteCustomSection } from "@/server/repositories/customSectionRepository";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

export default async function CustomSectionsPage() {
  const sections = await getCustomSections();

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteCustomSection(id);
    revalidatePath("/admin/cms/custom-sections");
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Custom HTML Sections</h1>
          <p className="text-muted-foreground">Manage your bespoke custom HTML sections.</p>
        </div>
        <Link 
          href="/admin/cms/custom-sections/new" 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Add Custom Section
        </Link>
      </div>

      <div className="glass-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {sections.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No custom sections found. Create one to get started!
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Name</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Target Page</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Theme</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Order</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={String(section._id)} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-bold text-foreground">{section.name}</td>
                  <td className="p-4 text-muted-foreground font-mono text-sm">{section.pageSlug}</td>
                  <td className="p-4 text-muted-foreground uppercase text-xs font-bold">-</td>
                  <td className="p-4 font-mono text-sm">{section.order}</td>
                  <td className="p-4 text-right flex justify-end gap-3">
                    <Link 
                      href={`/admin/cms/custom-sections/${section._id}`}
                      className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </Link>
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={String(section._id)} />
                      <button 
                        type="submit" 
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

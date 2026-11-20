import TagForm from "@/components/admin/tags/TagForm";
import { getTagById } from "@/server/repositories/tagRepository";
import { notFound } from "next/navigation";
import { Tag as TagIcon } from "lucide-react";

export default async function EditTagPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tag = await getTagById(resolvedParams.id);

  if (!tag) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
          <TagIcon className="text-primary" size={32} /> Edit Tag
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">Update tag details.</p>
      </div>
      
      <TagForm initialData={JSON.parse(JSON.stringify(tag))} />
    </div>
  );
}

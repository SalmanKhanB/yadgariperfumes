import TagForm from "@/components/admin/tags/TagForm";
import { Tag as TagIcon } from "lucide-react";

export default function NewTagPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
          <TagIcon className="text-primary" size={32} /> Create Tag
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">Add a new tag for categorizing products.</p>
      </div>
      
      <TagForm />
    </div>
  );
}

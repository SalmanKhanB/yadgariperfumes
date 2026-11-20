import { getPages } from "@/server/repositories/pageRepository";
import CustomSectionForm from "@/components/admin/cms/CustomSectionForm";

export const revalidate = 0;

export default async function NewCustomSectionPage() {
  const pages = await getPages();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <CustomSectionForm 
        pages={pages.map(p => ({ slug: p.slug, title: p.title }))} 
      />
    </div>
  );
}

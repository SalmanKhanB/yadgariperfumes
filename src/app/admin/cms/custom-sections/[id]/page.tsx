import { getCustomSectionById } from "@/server/repositories/customSectionRepository";
import { getPages } from "@/server/repositories/pageRepository";
import CustomSectionForm from "@/components/admin/cms/CustomSectionForm";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function EditCustomSectionPage({ params }: { params: { id: string } }) {
  const [section, pages] = await Promise.all([
    getCustomSectionById(params.id),
    getPages()
  ]);

  if (!section) return notFound();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <CustomSectionForm 
        initialData={JSON.parse(JSON.stringify(section))} 
        pages={pages.map(p => ({ slug: p.slug, title: p.title }))} 
      />
    </div>
  );
}

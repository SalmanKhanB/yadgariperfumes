import { getSiteSettings } from "@/server/repositories/siteSettingsRepository";
import { getThemePresets } from "@/server/repositories/themePresetRepository";
import { getCategories } from "@/server/repositories/categoryRepository";
import { getPages } from "@/server/repositories/pageRepository";
import { getCustomSections } from "@/server/repositories/customSectionRepository";
import CustomizerClient from "./CustomizerClient";

export const revalidate = 0;

export default async function ThemeCustomizerPage() {
  const settings = await getSiteSettings();
  const presets = await getThemePresets();
  const categories = await getCategories();
  const pages = await getPages();
  const customSections = await getCustomSections({ pageSlug: "home" });

  return (
    <div className="h-[calc(100vh-2rem)] w-full flex flex-col md:flex-row bg-background border border-border rounded-2xl overflow-hidden shadow-2xl relative">
      <CustomizerClient 
        initialSettings={JSON.parse(JSON.stringify(settings))} 
        initialPresets={JSON.parse(JSON.stringify(presets))}
        categories={JSON.parse(JSON.stringify(categories))}
        pages={JSON.parse(JSON.stringify(pages))}
        customSections={JSON.parse(JSON.stringify(customSections))}
      />
    </div>
  );
}

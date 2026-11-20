import type { MetadataRoute } from "next";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getCachedSiteSettings();
  const name = settings.name || "Sqodex Store";
  const shortName = name.slice(0, 12);
  const logoUrl = settings.logo || settings.favicon || "/favicon.ico";

  return {
    name: name,
    short_name: shortName,
    description: settings.seoDefaults?.description || `Official store for ${name}`,
    start_url: "/",
    display: "standalone",
    background_color: settings.themeColors?.background || "#ffffff",
    theme_color: settings.themeColors?.primary || "#141210",
    icons: [
      {
        src: logoUrl,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: logoUrl,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.yadgariperfumes.com";

  try {
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") || "https";

    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      baseUrl = `${proto}://${host}`;
    }
  } catch (e) {
    // Fallback
  }

  try {
    const settings = await getCachedSiteSettings();
    const seo: any = settings.seoDefaults;
    if (seo?.canonicalUrl) {
      const canonical = seo.canonicalUrl.trim().replace(/\/+$/, "");
      if (canonical.startsWith("http://") || canonical.startsWith("https://")) {
        baseUrl = canonical;
      }
    }
  } catch (e) { }

  baseUrl = baseUrl.replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/account/", "/checkout/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
``
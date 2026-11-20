import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { fetchProductsAction } from "@/server/actions/productActions";
import { fetchCategoriesAction } from "@/server/actions/categoryActions";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import connectToDatabase from "@/server/db/mongoose";
import Page from "@/server/db/models/Page";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Determine dynamic baseUrl matching the active domain (e.g. www.yadgariperfumes.com)
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.yadgariperfumes.com";

  try {
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") || "https";

    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      baseUrl = `${proto}://${host}`;
    }
  } catch (e) {
    // Fallback to configured settings
  }

  // Canonical override from Site Settings if configured
  try {
    const settings = await getCachedSiteSettings();
    const seo: any = settings.seoDefaults;
    if (seo?.canonicalUrl) {
      const canonical = seo.canonicalUrl.trim().replace(/\/+$/, "");
      if (canonical.startsWith("http://") || canonical.startsWith("https://")) {
        baseUrl = canonical;
      }
    }
  } catch (e) {
    // Fallback
  }

  baseUrl = baseUrl.replace(/\/+$/, "");

  // 2. Fetch products and categories
  const [productsRes, categoriesRes] = await Promise.all([
    fetchProductsAction().catch(() => ({ success: false, data: [] })),
    fetchCategoriesAction().catch(() => ({ success: false, data: [] }))
  ]);

  // 3. Category URLs
  const categoryUrls: MetadataRoute.Sitemap = [];
  if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
    categoriesRes.data
      .filter((c: any) => !c.noIndex && c.slug)
      .forEach((c: any) => {
        // Direct category path (e.g. /for-men)
        categoryUrls.push({
          url: `${baseUrl}/${c.slug}`,
          lastModified: new Date(c.updatedAt || new Date()),
          changeFrequency: "daily",
          priority: 0.9,
        });
        // Collections category path (e.g. /collections/for-men)
        categoryUrls.push({
          url: `${baseUrl}/collections/${c.slug}`,
          lastModified: new Date(c.updatedAt || new Date()),
          changeFrequency: "weekly",
          priority: 0.85,
        });
      });
  }

  // 4. Product URLs (e.g. /[category]/[slug])
  const productUrls: MetadataRoute.Sitemap = [];
  if (productsRes.success && Array.isArray(productsRes.data)) {
    productsRes.data
      .filter((p: any) => !p.seo?.noIndex && p.slug)
      .forEach((p: any) => {
        const catSlug = (p.categories && p.categories[0]?.slug) || p.categorySlug || p.category || "all";
        productUrls.push({
          url: `${baseUrl}/${catSlug}/${p.slug}`,
          lastModified: new Date(p.updatedAt || new Date()),
          changeFrequency: "daily",
          priority: 0.95,
        });
      });
  }

  // 5. CMS Pages from database
  const cmsUrls: MetadataRoute.Sitemap = [];
  try {
    await connectToDatabase();
    const cmsPages = await Page.find({ isPublished: true }).select("slug updatedAt").lean();
    if (Array.isArray(cmsPages)) {
      cmsPages.forEach((p: any) => {
        if (p.slug) {
          cmsUrls.push({
            url: `${baseUrl}/pages/${p.slug}`,
            lastModified: new Date(p.updatedAt || new Date()),
            changeFrequency: "weekly",
            priority: 0.75,
          });
        }
      });
    }
  } catch (err) {
    // CMS pages fallback
  }

  // 6. Core Static Storefront Pages
  const coreStaticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/all`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  return [
    ...coreStaticPages,
    ...categoryUrls,
    ...productUrls,
    ...cmsUrls,
  ];
}

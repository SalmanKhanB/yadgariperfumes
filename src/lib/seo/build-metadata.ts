import { Metadata } from "next";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  path: string;
}

export async function buildMetadata({
  title,
  description,
  image,
  path,
}: MetadataProps): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const brandSuffix = ` | ${settings.name}`;
  const alreadyBranded = title?.toLowerCase() === settings.name.toLowerCase()
    || title?.toLowerCase().endsWith(brandSuffix.toLowerCase());
  const finalTitle = title
    ? alreadyBranded ? title : `${title}${brandSuffix}`
    : settings.seoDefaults?.title || settings.name;
  const finalDescription = description || settings.seoDefaults?.description || "";
  const finalImage = image || settings.logo || "";

  return {
    title: { absolute: finalTitle },
    description: finalDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: path,
      siteName: settings.name,
      images: finalImage ? [{ url: finalImage }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: finalImage ? [finalImage] : [],
    },
  };
}

export async function buildProductMetadata({
  product,
  effectivePrice,
  path,
}: {
  product: any;
  effectivePrice: any;
  path: string;
}): Promise<Metadata> {
  const baseMetadata = await buildMetadata({
    title: product.seo?.metaTitle || product.pageTitle || product.name,
    description: product.seo?.metaDescription || product.shortDescription,
    image: product.seo?.ogImage || product.images?.find((i: any) => i.isPrimary)?.url || product.images?.[0]?.url,
    path,
  });

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Sqodex Shop";

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      type: "website", // Next.js doesn't natively support "product" perfectly in TS types sometimes, but we append custom fields
    },
    other: {
      ...(baseMetadata.other || {}),
      "product:price:amount": effectivePrice.price.toString(),
      "product:price:currency": "USD",
      "product:availability": product.inventory > 0 ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:brand": siteName,
      ...(effectivePrice.compareAt ? {
        "product:original_price:amount": effectivePrice.compareAt.toString(),
        "product:original_price:currency": "USD",
      } : {}),
      ...(effectivePrice.offer ? {
        "product:sale_price:amount": effectivePrice.price.toString(),
        "product:sale_price:currency": "USD",
      } : {}),
    },
    robots: {
      index: !product.seo?.noIndex,
      follow: !product.seo?.noFollow,
    }
  };
}

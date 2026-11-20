import { IProduct } from "@/server/db/models/Product";
import { EffectivePriceResult } from "@/server/services/pricing.service";
import { ISiteSettings } from "@/server/db/models/SiteSettings";

/**
 * Ensures an image URL is properly formatted as a full absolute URL for Googlebot.
 */
function toAbsoluteUrl(url?: string, baseUrl: string = "http://localhost:3000"): string | undefined {
  if (!url) return undefined;
  const cleanUrl = url.trim();
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = cleanUrl.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

export function OrganizationJsonLd({ settings }: { settings: any }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const logoUrl = toAbsoluteUrl(settings.logo || settings.favicon, baseUrl);
  const siteName = settings.name || "Store";

  // Google Search Organization / Store Schema
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: siteName,
    alternateName: settings.seoDefaults?.title || siteName,
    url: baseUrl,
    logo: logoUrl,
    image: logoUrl,
    description: settings.seoDefaults?.description || `Official online store for ${siteName}`,
    contactPoint: settings.contact?.email ? {
      "@type": "ContactPoint",
      email: settings.contact.email,
      telephone: settings.contact.phone || undefined,
      contactType: "customer service",
      areaServed: "Global",
      availableLanguage: ["English", "Arabic"],
    } : undefined,
    address: settings.physicalAddress ? {
      "@type": "PostalAddress",
      streetAddress: settings.physicalAddress,
    } : undefined,
    sameAs: Object.values(settings.socialLinks || {}).filter(Boolean),
  };

  // Google Search WebSite Schema (enables brand presence and site search snippet)
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: baseUrl,
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: logoUrl ? {
        "@type": "ImageObject",
        url: logoUrl,
      } : undefined,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  );
}

export function ProductJsonLd({ product, effectivePrice }: { product: IProduct, effectivePrice: EffectivePriceResult }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const rawImage = (product as any).seo?.ogImage || 
    (product.images as any)?.find((i: any) => i.isPrimary)?.url || 
    (product.images as any)?.[0]?.url || 
    (product.images as any)?.[0];

  const imageUrl = toAbsoluteUrl(typeof rawImage === "string" ? rawImage : rawImage?.url, baseUrl);

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: (product as any).pageTitle || product.name || (product as any).title,
    image: imageUrl ? [imageUrl] : undefined,
    description: (product as any).seo?.metaDescription || product.shortDescription || product.description,
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: "USD",
      price: effectivePrice.price,
      availability: (product as any).inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: effectivePrice.offer?.endsAt ? new Date(effectivePrice.offer.endsAt).toISOString().split('T')[0] : undefined,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

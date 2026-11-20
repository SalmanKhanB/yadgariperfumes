import { Metadata } from "next";
import { getCategories } from "@/server/repositories/categoryRepository";
import { getPageBySlug } from "@/server/repositories/pageRepository";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export const revalidate = 3600; 

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const storeName = settings?.name || "Yadgari Perfumes";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: `Fragrance Collections & Fragrance Families | ${storeName}`,
    description: `Discover curated perfume collections by ${storeName}. Explore woody, floral, oriental, and gourmand extrait collections for men and women.`,
    keywords: [
      "Perfume collections",
      "Fragrance families",
      "Niche perfume collections",
      "Men perfumes",
      "Women perfumes",
      "Unisex extrait"
    ],
    openGraph: {
      title: `Fragrance Collections | ${storeName}`,
      description: `Curated extrait perfume collections and fragrance families.`,
      url: `${baseUrl}/collections`,
      siteName: storeName,
      type: "website"
    },
    twitter: {
      card: "summary",
      title: `Fragrance Collections | ${storeName}`,
      description: `Curated extrait perfume collections.`
    },
    alternates: {
      canonical: `${baseUrl}/collections`
    }
  };
}

export default async function CollectionsPage() {
  const [categories, pageData, settings] = await Promise.all([
    getCategories(),
    getPageBySlug("collections"),
    getCachedSiteSettings()
  ]);

  const storeName = settings?.name || "Yadgari Perfumes";
  const topLevelCategories = categories.filter((c) => !c.parent);

  const title = pageData?.title || "Signature Collections";
  const { backgroundColor, textColor, subheading } = pageData?.themeConfig || {};

  const customContainerStyle = backgroundColor ? { backgroundColor } : {};
  const customTextStyle = textColor ? { color: textColor } : {};
  const containerClass = `flex flex-col min-h-screen pt-24 pb-32 overflow-hidden relative bg-background transition-colors duration-500`;

  // JSON-LD CollectionPage Schema
  const collectionsJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${title} | ${storeName}`,
    "description": subheading || `Browse our curated luxury fragrance collections at ${storeName}.`,
    "url": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/collections`,
    "hasPart": topLevelCategories.map((cat) => ({
      "@type": "ItemList",
      "name": cat.name,
      "url": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${cat.slug}`
    }))
  };

  return (
    <div className={containerClass} style={customContainerStyle}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionsJsonLd) }}
      />

      {/* Flagship Dynamic Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[140px]" />
      </div>

      {/* Header */}
      <section className="relative pt-6 pb-12 px-4 sm:px-6 overflow-hidden z-10">
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center space-y-5">
          <div className="w-full text-left sm:text-center mb-2">
            <Breadcrumbs items={[{ label: 'Collections' }]} />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-[11px] font-bold uppercase tracking-[0.18em]">
            <Sparkles size={13} />
            Olfactory Families & Curations
          </div>

          <h1 className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase font-serif ${!textColor ? 'text-foreground' : ''}`} style={customTextStyle}>
            {title}
          </h1>
          <p className={`text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed ${!textColor ? 'text-muted-foreground' : ''}`} style={textColor ? { color: textColor, opacity: 0.8 } : {}}>
            {subheading || "Immerse yourself in our signature olfactory families, crafted with rare botanicals and pure extrait concentrations."}
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="relative z-10 py-24 px-6 max-w-360 mx-auto w-full">
        {topLevelCategories.length === 0 ? (
          <div className="text-center py-32 rounded-3xl glass-card">
            <p className="text-xl text-muted-foreground font-medium uppercase tracking-wider">No collections available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topLevelCategories.map((cat) => (
              <Link 
                key={String(cat._id)} 
                href={`/${cat.slug}`}
                className="group relative aspect-square rounded-2xl overflow-hidden glass-card flex items-end p-8 border border-border"
              >
                <div className="absolute inset-0 bg-muted z-0 group-hover:scale-105 transition-transform duration-700" />
                {cat.bannerImage && (
                  <img 
                    src={cat.bannerImage} 
                    alt={cat.name} 
                    decoding="async"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700" 
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10" />
                
                <div className="relative z-20 w-full flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
                    {cat.name}
                  </h3>
                  <div className="w-10 h-10 rounded-full bg-card/20 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 transform duration-300">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

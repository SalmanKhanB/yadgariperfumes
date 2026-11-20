import { Metadata } from "next";
import { getPageBySlug } from "@/server/repositories/pageRepository";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import BlockRenderer from "@/components/storefront/BlockRenderer";
import ContactFormClient from "@/components/storefront/ContactFormClient";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const storeName = settings?.name || "Yadgari Perfumes";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: `Contact Us | Fragrance Concierge & Client Support | ${storeName}`,
    description: `Get in touch with ${storeName} luxury fragrance advisors for bespoke scent recommendations, order tracking, and client care.`,
    keywords: [
      "Contact Yadgari Perfumes",
      "Perfume Consultation",
      "Fragrance Concierge",
      "Customer Support",
      "Order Inquiry",
      "WhatsApp Fragrance Support"
    ],
    openGraph: {
      title: `Contact Us | Fragrance Concierge & Client Support | ${storeName}`,
      description: `Get in touch with ${storeName} luxury fragrance advisors for bespoke scent recommendations, order tracking, and client care.`,
      url: `${baseUrl}/contact`,
      siteName: storeName,
      type: "website"
    },
    twitter: {
      card: "summary",
      title: `Contact Us | Fragrance Concierge | ${storeName}`,
      description: `Get in touch with ${storeName} luxury fragrance advisors for bespoke scent recommendations and order care.`
    },
    alternates: {
      canonical: `${baseUrl}/contact`
    }
  };
}

export default async function ContactPage() {
  const [page, storeSettings] = await Promise.all([
    getPageBySlug("contact"),
    getCachedSiteSettings(),
  ]);
  const blocks = page?.blocks || [];
  const storeName = storeSettings?.name || "Yadgari Perfumes";
  const email = storeSettings?.contact?.email || "info@yadgariperfumes.com";
  const phone = storeSettings?.contact?.phone || "+92 300 123 4567";

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": `Contact ${storeName}`,
    "description": `Contact customer service and fragrance consultation for ${storeName}.`,
    "mainEntity": {
      "@type": "Organization",
      "name": storeName,
      "url": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": phone,
          "contactType": "Customer Service",
          "email": email,
          "availableLanguage": ["English", "Urdu", "Arabic"]
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-32 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      {/* Background Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[85rem] mx-auto px-4 sm:px-6 mb-6">
        <Breadcrumbs items={[{ label: 'Contact Us' }]} />
      </div>

      <div className="relative z-10 space-y-16">
        <ContactFormClient storeSettings={storeSettings} />

        {blocks.length > 0 && (
          <div className="border-t border-border/40 pt-16">
            <BlockRenderer blocks={blocks} />
          </div>
        )}
      </div>
    </div>
  );
}

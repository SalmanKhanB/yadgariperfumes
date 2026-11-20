import { Metadata } from "next";
import { getActiveGlobalFAQsAction } from "@/server/actions/faqActions";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import Link from "next/link";
import { Sparkles, HelpCircle, ArrowRight, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { getPageBySlug } from "@/server/repositories/pageRepository";
import BlockRenderer from "@/components/storefront/BlockRenderer";

const DEFAULT_FRAGRANCE_FAQS = [
  {
    _id: "faq-1",
    question: "What is Extrait de Parfum and how does it differ from EDP?",
    answer: "Extrait de Parfum represents the pinnacle of luxury perfumery, formulated with a 30% to 35% pure fragrance oil concentration compared to 15%–20% in standard Eau de Parfum (EDP). This high concentration provides deeper aromatic layers, rich projection, and exceptional 14–16+ hour longevity."
  },
  {
    _id: "faq-2",
    question: "How should I apply perfume for maximum sillage and longevity?",
    answer: "Spray onto warm pulse points: the sides of your neck, inner wrists, and collarbones immediately after showering on moisturized skin. Avoid rubbing your wrists together, as friction alters delicate top notes and accelerates evaporation."
  },
  {
    _id: "faq-3",
    question: "Are your ingredients cruelty-free and IFRA-certified?",
    answer: "Yes, 100% of our perfumes are cruelty-free, dermatologically tested, and comply with international IFRA safety standards. We source wild Kashmiri saffron, Assam agarwood, and Grasse botanicals sustainably through ethical grower partnerships."
  },
  {
    _id: "faq-4",
    question: "How long does shipping take and how do I track my parcel?",
    answer: "Orders are dispatched within 24 to 48 hours in luxury protective packaging. Domestic delivery typically takes 2 to 4 business days, while international priority air freight takes 4 to 7 business days. You will receive an instant tracking link via SMS, WhatsApp, and email upon dispatch."
  },
  {
    _id: "faq-5",
    question: "What payment methods and currencies do you support?",
    answer: "We support Visa, MasterCard, Apple Pay, Google Pay, direct bank transfers, and Cash on Delivery (COD) in select regions."
  },
  {
    _id: "faq-6",
    question: "What is your return & exchange guarantee?",
    answer: "We offer a 15-day satisfaction guarantee. If you are not completely enchanted by your fragrance, you may return unopened, sealed bottles in their original luxury box for a full refund or exchange."
  }
];

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const storeName = settings?.name || "Yadgari Perfumes";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: `FAQ & Fragrance Guide | Customer Help Center | ${storeName}`,
    description: `Find expert answers about ${storeName} Extrait de Parfum concentration, fragrance notes, longevity tips, ordering, worldwide shipping, and returns.`,
    keywords: [
      "Perfume FAQ",
      "Extrait de Parfum guide",
      "Fragrance longevity tips",
      "How to apply perfume",
      "Yadgari Perfumes shipping",
      "Yadgari returns"
    ],
    openGraph: {
      title: `FAQ & Fragrance Guide | Customer Help Center | ${storeName}`,
      description: `Expert answers about fragrance notes, sillage, shipping, and returns for ${storeName}.`,
      url: `${baseUrl}/faq`,
      siteName: storeName,
      type: "website"
    },
    twitter: {
      card: "summary",
      title: `FAQ & Fragrance Guide | ${storeName}`,
      description: `Expert answers about perfume concentration, shipping, and returns.`
    },
    alternates: {
      canonical: `${baseUrl}/faq`
    }
  };
}

export default async function FAQPage() {
  const [page, res, settings] = await Promise.all([
    getPageBySlug("faq"),
    getActiveGlobalFAQsAction(),
    getCachedSiteSettings()
  ]);

  const dbFaqs = res.success && res.data && res.data.length > 0 ? res.data : [];
  const faqs = dbFaqs.length > 0 ? dbFaqs : DEFAULT_FRAGRANCE_FAQS;
  const storeName = settings?.name || "Yadgari Perfumes";
  const whatsappNumber = settings?.whatsappChatWidget?.phoneNumber || settings?.socialLinks?.whatsapp || "923001234567";

  // Google JSON-LD FAQPage Schema for Search Rich Snippets
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const blocks = page?.blocks || [];

  if (blocks.length > 0) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-32 relative overflow-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        {/* Subtle Background Glows */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[5%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-primary/5 blur-[150px]" />
          <div className="absolute top-[45%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[150px]" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <Breadcrumbs items={[{ label: page?.title || 'FAQ & Help Center' }]} />
          </div>
        </div>
        <div className="relative z-10">
          <BlockRenderer blocks={blocks} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-32 px-4 sm:px-6 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Subtle Background Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute top-[45%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent/5 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-12">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: 'FAQ & Help Center' }]} />

        {/* Header */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-[11px] font-bold uppercase tracking-[0.18em]">
            <Sparkles size={13} />
            Knowledge Base & Scent Guide
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-foreground font-serif">
            Frequently Asked Questions
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our high-concentration extrait formulas, sillage tips, orders, and delivery policies.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-4">
          {faqs.map((faq: any, i: number) => (
            <details 
              key={faq._id || i} 
              name="global-faq-accordion" 
              open={i === 0} 
              className="group border border-border rounded-2xl bg-card overflow-hidden shadow-xs hover:border-accent/40 transition-colors"
            >
              <summary className="flex items-center justify-between cursor-pointer p-5 sm:p-6 font-bold text-sm sm:text-base md:text-lg text-foreground hover:bg-muted/30 transition-colors">
                <span className="pr-4">{faq.question}</span>
                <span className="transition duration-300 group-open:-rotate-180 flex-shrink-0 text-accent font-mono text-xl">
                  ↓
                </span>
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-muted-foreground leading-relaxed whitespace-pre-wrap text-xs sm:text-sm md:text-base border-t border-border/40 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        {/* Support Banner */}
        <div className="p-8 rounded-3xl bg-[#141210] text-[#F4F1EA] text-center border border-white/10 shadow-xl space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight font-serif">
            Have a Specific Question?
          </h3>
          <p className="text-xs sm:text-sm text-[#F4F1EA]/80 max-w-lg mx-auto">
            Our luxury fragrance concierges are available 7 days a week to provide personalized guidance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link 
              href="/contact" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#A98F5C] hover:bg-[#977f4f] text-[#141210] px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-transform hover:scale-105 shadow-md"
            >
              <HelpCircle size={15} /> Contact Support
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello! I have a question regarding Yadgari perfumes.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-[#F4F1EA] px-6 py-3 rounded-full font-semibold text-xs uppercase tracking-wider transition-all border border-white/20"
            >
              <FaWhatsapp size={15} className="text-[#25D366]" /> Chat on WhatsApp
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}

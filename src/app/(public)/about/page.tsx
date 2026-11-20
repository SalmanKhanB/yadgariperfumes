import { Metadata } from "next";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import Link from "next/link";
import { getPageBySlug } from "@/server/repositories/pageRepository";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import BlockRenderer from "@/components/storefront/BlockRenderer";
import { Sparkles, Award, ShieldCheck, Leaf, Clock, ArrowRight, CheckCircle2, Droplet, Flame, Compass, HeartHandshake, Eye, BookOpen } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const storeName = settings?.name || "Yadgari Perfumes";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: `About Us | The Art of Haute Parfumerie & Pure Extrait | ${storeName}`,
    description: `Discover the story, craftsmanship, and artisanal heritage behind ${storeName}. Formulating luxury Extrait de Parfum with 30-35% pure fragrance oil density, wild Kashmiri saffron, and aged agarwood.`,
    keywords: [
      "About Yadgari Perfumes",
      "Haute Parfumerie",
      "Extrait de Parfum",
      "luxury perfumes",
      "artisanal fragrance crafting",
      "niche perfumes",
      "pure oud and saffron",
      "sustainable luxury fragrances",
      "master perfumery"
    ],
    openGraph: {
      title: `About Us | The Art of Haute Parfumerie | ${storeName}`,
      description: `Discover the story, craftsmanship, and artisanal heritage behind ${storeName}. Formulating luxury Extrait de Parfum with 30-35% pure fragrance oil density.`,
      url: `${baseUrl}/about`,
      siteName: storeName,
      images: [
        {
          url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200",
          width: 1200,
          height: 630,
          alt: "Yadgari Perfumes Artisanal Crafting"
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `About Us | The Art of Haute Parfumerie | ${storeName}`,
      description: `Discover the story and artisanal mastery behind ${storeName} Extrait de Parfum creations.`,
      images: ["https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200"]
    },
    alternates: {
      canonical: `${baseUrl}/about`
    }
  };
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([
    getPageBySlug("about"),
    getCachedSiteSettings()
  ]);

  const storeName = settings?.name || "Yadgari Perfumes";
  const blocks = page?.blocks || [];
  const whatsappNumber = settings?.whatsappChatWidget?.phoneNumber || settings?.socialLinks?.whatsapp || "923001234567";

  // Google JSON-LD Structured Data for AboutPage & Organization & Brand
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/about`,
        "name": `About ${storeName}`,
        "description": `The story, artisanal craftsmanship, and luxury heritage of ${storeName}.`,
        "mainEntity": {
          "@type": "Organization",
          "name": storeName,
          "url": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "logo": settings?.logo || undefined,
          "foundingDate": "2024",
          "description": "High-concentration Extrait de Parfum crafted with rare aged agarwood, wild saffron, and organic botanicals.",
          "knowsAbout": [
            "Haute Parfumerie",
            "Extrait de Parfum",
            "Fragrance Distillation",
            "Artisanal Scents",
            "Sillage & Longevity"
          ],
          "brand": {
            "@type": "Brand",
            "name": storeName
          }
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What makes Extrait de Parfum superior to Eau de Parfum?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Extrait de Parfum features a 30% to 35% pure fragrance oil concentration compared to 15% to 20% in standard EDP. This delivers richer scent projection, less alcohol evaporation, and 14 to 16+ hours of luxurious longevity on skin."
            }
          },
          {
            "@type": "Question",
            "name": "How does Yadgari source its raw perfume materials?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We partner directly with generational farmers and ethical wild harvesters across Kashmir for pure saffron, Assam and Cambodia for aged agarwood, and Grasse for rare floral absolutes."
            }
          },
          {
            "@type": "Question",
            "name": "How should luxury Extrait de Parfum be stored?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Keep your perfume in a cool, dark environment away from direct sunlight and excessive humidity. Our UV-protected flacons and magnetic caps ensure maximum preservation of top and heart accords."
            }
          }
        ]
      }
    ]
  };

  if (blocks.length > 0) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-32 relative overflow-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <Breadcrumbs items={[{ label: 'About Us' }]} />
          </div>
        </div>
        <div className="relative z-10">
          <BlockRenderer blocks={blocks} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-32 relative overflow-hidden">
      {/* Google Rich Snippet Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      {/* Subtle Ambient Background Lighting */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[160px]" />
        <div className="absolute top-[45%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-accent/5 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumbs items={[{ label: 'About Us' }]} />
        </div>

        {/* ─── 1. HERO SECTION: BRAND TITLE & MISSION ─── */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-[11px] font-bold uppercase tracking-[0.18em] mb-6">
            <Sparkles size={13} />
            Haute Parfumerie & Pure Extrait Heritage
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-foreground mb-6 font-serif leading-[1.05]">
            The Essence of Pure Artisanship
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            At <strong className="text-foreground font-bold">{storeName}</strong>, we believe an exceptional fragrance is an invisible armor — a timeless memory distilled from wild botanicals, precious resins, and master artistry.
          </p>

          {/* Scent Accord Notes Strip */}
          <div className="mt-8 pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left sm:text-center">
            <div className="p-4 rounded-xl bg-card border border-border hover:border-accent/40 transition-colors">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block mb-1">Top Accords</span>
              <p className="text-xs sm:text-sm font-semibold text-foreground">Wild Saffron & Bergamot</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Bright, radiant initial aura</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border hover:border-accent/40 transition-colors">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block mb-1">Heart Accords</span>
              <p className="text-xs sm:text-sm font-semibold text-foreground">Cashmere Musk & Jasmine</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Warm, sensual signature core</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border hover:border-accent/40 transition-colors">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block mb-1">Base Accords</span>
              <p className="text-xs sm:text-sm font-semibold text-foreground">Aged Agarwood & Vanilla</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">16+ hours enduring sillage</p>
            </div>
          </div>
        </div>

        {/* ─── 2. KEY BRAND STATS METRICS STRIP ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-20 md:mb-28">
          <div className="p-6 rounded-2xl bg-card border border-border text-center shadow-xs flex flex-col items-center justify-center hover:border-accent/40 transition-colors">
            <Droplet className="w-6 h-6 text-accent mb-2.5" />
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground font-serif tracking-tight">30–35%</span>
            <span className="text-xs sm:text-[13px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">Pure Extrait Oil</span>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border text-center shadow-xs flex flex-col items-center justify-center hover:border-accent/40 transition-colors">
            <Clock className="w-6 h-6 text-accent mb-2.5" />
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground font-serif tracking-tight">16+ Hrs</span>
            <span className="text-xs sm:text-[13px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">Sillage & Longevity</span>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border text-center shadow-xs flex flex-col items-center justify-center hover:border-accent/40 transition-colors">
            <Award className="w-6 h-6 text-accent mb-2.5" />
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground font-serif tracking-tight">50+</span>
            <span className="text-xs sm:text-[13px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">Countries Shipped</span>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border text-center shadow-xs flex flex-col items-center justify-center hover:border-accent/40 transition-colors">
            <ShieldCheck className="w-6 h-6 text-accent mb-2.5" />
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground font-serif tracking-tight">100%</span>
            <span className="text-xs sm:text-[13px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">IFRA & Cruelty-Free</span>
          </div>
        </div>

        {/* ─── 3. STORY SPLIT 1: HERITAGE & FORMULATION ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-20 md:mb-28 items-center">
          <div className="order-2 md:order-1 space-y-5">
            <div className="inline-block w-12 h-1 bg-accent rounded-full mb-1" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground leading-tight">
              Reviving The Lost Concentration of Extrait
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              In a commercial market flooded with mass-produced, diluted sprays, we set a radical new standard. Every fragrance in our collection is formulated at the highest concentration grade known in perfumery — <strong>Extrait de Parfum</strong>.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              By utilizing up to 35% pure aromatic essence, each spray unveils distinct olfactory chapters: bright opening notes, a sumptuous heart, and deep, resonant base accords that linger effortlessly for over 16 hours.
            </p>
            <div className="pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-foreground">
                <CheckCircle2 size={18} className="text-[#25D366] shrink-0" />
                <span>Zero artificial fillers, parabens, or synthetic coloring</span>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 relative aspect-[4/3] rounded-3xl overflow-hidden glass-card shadow-xl border border-border group">
            <img
              src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000"
              alt="Artisanal Perfume Crafting and Flacons"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-xl text-white text-xs border border-white/10">
              <span className="font-bold">Cold-Macerated for 120 Days</span> — Developing rich, resonant olfactory harmony.
            </div>
          </div>
        </div>

        {/* ─── 4. 4-STEP MASTER CRAFTING JOURNEY ─── */}
        <div className="mb-20 md:mb-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground font-serif">
              The 4-Step Alchemy
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              How our master perfumers transform rare earth botanicals into signature extrait creations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3 relative overflow-hidden hover:border-accent/40 transition-colors">
              <span className="text-4xl font-black font-serif text-accent/40 block">01</span>
              <h3 className="text-base font-bold uppercase tracking-wider text-foreground">Rare Foraging</h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                Hand-harvesting wild Kashmiri saffron, aged Assam agarwood, and Grasse jasmine at peak aromatic bloom.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3 relative overflow-hidden hover:border-accent/40 transition-colors">
              <span className="text-4xl font-black font-serif text-accent/40 block">02</span>
              <h3 className="text-base font-bold uppercase tracking-wider text-foreground">Slow Maceration</h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                Aged in temperature-controlled dark vaults for 120 days to allow natural scent molecules to interlock and mature.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3 relative overflow-hidden hover:border-accent/40 transition-colors">
              <span className="text-4xl font-black font-serif text-accent/40 block">03</span>
              <h3 className="text-base font-bold uppercase tracking-wider text-foreground">Extrait Density</h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                Precision formulation at 30–35% pure oil density, guaranteeing remarkable depth and room-filling sillage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3 relative overflow-hidden hover:border-accent/40 transition-colors">
              <span className="text-4xl font-black font-serif text-accent/40 block">04</span>
              <h3 className="text-base font-bold uppercase tracking-wider text-foreground">Hand Flaconing</h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                Poured by hand into UV-protected heavy glass flacons and topped with magnetic engraved caps.
              </p>
            </div>
          </div>
        </div>

        {/* ─── 5. STORY SPLIT 2: SUSTAINABILITY & INTEGRITY ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-20 md:mb-28 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden glass-card shadow-xl border border-border group">
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000"
              alt="Sustainable Botanicals & Flacons"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          <div className="space-y-5">
            <div className="inline-block w-12 h-1 bg-accent rounded-full mb-1" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground leading-tight">
              Honoring Nature with Sustainable Luxury
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We believe true luxury must tread lightly on the earth. We collaborate with family-owned ethical distilleries to preserve endangered flora while supporting generational harvesting communities.
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex items-center gap-3 text-foreground text-xs sm:text-sm font-medium">
                <Leaf size={18} className="text-[#25D366] shrink-0" />
                <span>100% Recyclable heavy-base glass & biodegradable packaging</span>
              </li>
              <li className="flex items-center gap-3 text-foreground text-xs sm:text-sm font-medium">
                <ShieldCheck size={18} className="text-[#25D366] shrink-0" />
                <span>Certified dermatologically safe & IFRA compliant</span>
              </li>
              <li className="flex items-center gap-3 text-foreground text-xs sm:text-sm font-medium">
                <Flame size={18} className="text-[#25D366] shrink-0" />
                <span>Zero animal testing — 100% ethically certified</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── 6. THE OLFACTORY PYRAMID ARCHITECTURE ─── */}
        <div className="mb-20 md:mb-28 p-8 sm:p-12 rounded-3xl bg-card border border-border shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
              <Compass size={13} /> Scent Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground font-serif">
              Anatomy of an Extrait Masterpiece
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              How our fragrances develop their signature three-dimensional evolution on your skin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-3">
              <span className="text-xs font-mono font-bold text-accent uppercase tracking-widest block">Phase 01: 0–30 Mins</span>
              <h3 className="text-lg font-bold text-foreground uppercase">Top Accord (Opening)</h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                The initial luminous aura featuring high-volatility botanicals: hand-pressed Italian bergamot, pink pepper, and saffron threads.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-3">
              <span className="text-xs font-mono font-bold text-accent uppercase tracking-widest block">Phase 02: 1–6 Hours</span>
              <h3 className="text-lg font-bold text-foreground uppercase">Heart Accord (Character)</h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                The rich emotional core composed of Grasse night-blooming jasmine, Bulgarian damask rose, and creamy cashmere woods.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-3">
              <span className="text-xs font-mono font-bold text-accent uppercase tracking-widest block">Phase 03: 6–16+ Hours</span>
              <h3 className="text-lg font-bold text-foreground uppercase">Base Accord (Memory)</h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                The persistent deep dry-down: aged Cambodian agarwood, Madagascar bourbon vanilla, amber crystals, and white musk.
              </p>
            </div>
          </div>
        </div>

        {/* ─── 7. FAQ ACCORDION SECTION (SEO ENHANCED) ─── */}
        <div className="mb-20 md:mb-28 max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground font-serif">
              Craftsmanship & Formulation FAQ
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Common questions about our artisan extraction and ingredients.
            </p>
          </div>

          <details className="group border border-border rounded-2xl bg-card overflow-hidden shadow-xs" open>
            <summary className="flex items-center justify-between cursor-pointer p-5 font-bold text-sm sm:text-base text-foreground hover:bg-muted/30 transition-colors">
              <span>Why choose Extrait de Parfum over Eau de Parfum (EDP)?</span>
              <span className="transition duration-300 group-open:-rotate-180 flex-shrink-0 text-accent font-mono text-lg">↓</span>
            </summary>
            <div className="px-5 pb-5 text-muted-foreground text-xs sm:text-sm leading-relaxed border-t border-border/40 pt-3">
              Extrait de Parfum contains up to 35% pure fragrance oils (vs 15–20% in EDP), resulting in significantly deeper chords, velvety diffusion, and lasting projection that stays vibrant from morning till late night.
            </div>
          </details>

          <details className="group border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
            <summary className="flex items-center justify-between cursor-pointer p-5 font-bold text-sm sm:text-base text-foreground hover:bg-muted/30 transition-colors">
              <span>Are your perfumes suitable for sensitive skin?</span>
              <span className="transition duration-300 group-open:-rotate-180 flex-shrink-0 text-accent font-mono text-lg">↓</span>
            </summary>
            <div className="px-5 pb-5 text-muted-foreground text-xs sm:text-sm leading-relaxed border-t border-border/40 pt-3">
              Yes, all our perfumes are dermatologically tested, formulated without harsh chemical denaturants or phthalates, and certified 100% IFRA compliant.
            </div>
          </details>

          <details className="group border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
            <summary className="flex items-center justify-between cursor-pointer p-5 font-bold text-sm sm:text-base text-foreground hover:bg-muted/30 transition-colors">
              <span>How do I preserve my perfume flacon at home?</span>
              <span className="transition duration-300 group-open:-rotate-180 flex-shrink-0 text-accent font-mono text-lg">↓</span>
            </summary>
            <div className="px-5 pb-5 text-muted-foreground text-xs sm:text-sm leading-relaxed border-t border-border/40 pt-3">
              Store your flacon upright in a cool, dark place away from direct heat or bathroom steam. The heavy glass flacon and magnetic closure keep light and air from degrading fragile top notes.
            </div>
          </details>
        </div>

        {/* ─── 8. LUXURY BANNER & CALL TO ACTION ─── */}
        <div className="p-8 sm:p-12 md:p-16 rounded-3xl bg-[#141210] text-[#F4F1EA] text-center relative overflow-hidden border border-white/10 shadow-2xl space-y-8">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight font-serif mb-4">
              Begin Your Olfactory Journey
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#F4F1EA]/85 leading-relaxed mb-8 italic">
              &ldquo;A great fragrance is not merely an accessory — it is an invisible armor, an emotion, and a lasting memory etched in time.&rdquo;
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/all"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#A98F5C] hover:bg-[#977f4f] text-[#141210] font-bold text-xs uppercase tracking-widest transition-transform hover:scale-105 shadow-md"
              >
                Explore Signature Collection <ArrowRight size={15} />
              </Link>

              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello! I would like a personalized fragrance consultation.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#F4F1EA] font-semibold text-xs uppercase tracking-wider transition-all border border-white/20"
              >
                <FaWhatsapp size={16} className="text-[#25D366]" /> Talk to Fragrance Concierge
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import React from "react";
import { getCategories } from "@/server/repositories/categoryRepository";
import { getSiteSettings } from "@/server/repositories/siteSettingsRepository";
import { getHeroBlock } from "@/server/repositories/heroRepository";
import { getProducts } from "@/server/repositories/productRepository";
import { getCelebrityReviews } from "@/server/repositories/celebrityReviewRepository";
import { getTestimonials } from "@/server/repositories/testimonialRepository";
import ProductCard from "@/components/storefront/ProductCard";
import Hero from "@/components/storefront/Hero";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, HeadphonesIcon, RotateCcw, Star, Banknote, CreditCard, Landmark } from "lucide-react";
import TestimonialSlider from "@/components/storefront/TestimonialSlider";
import SubmitTestimonialForm from "@/components/storefront/SubmitTestimonialForm";
import BlockRenderer from "@/components/storefront/BlockRenderer";
import TrustBadges from "@/components/storefront/TrustBadges";
import { getCustomSections } from "@/server/repositories/customSectionRepository";

import ShimmerImage from "@/components/ui/ShimmerImage";
import { PaymentBadgesGrid } from "@/components/storefront/PaymentBadges";

export const revalidate = 3600;

export default async function HomePage() {
  // Batch 1: Consolidated parallel fetch for core homepage configuration & data
  const [
    categoriesRaw,
    heroBlockRaw,
    settingsRaw,
    celebrityReviewsRaw,
    testimonialsRaw,
    customSectionsRaw
  ] = await Promise.all([
    getCategories(),
    getHeroBlock(),
    getSiteSettings(),
    getCelebrityReviews({ isActive: true, productId: null }),
    getTestimonials({ isActive: true }),
    getCustomSections({ pageSlug: "home" })
  ]);

  const categories = JSON.parse(JSON.stringify(categoriesRaw));
  const featuredCategories = categories.filter((c: any) => c.isFeatured);
  const categories2 = categories.filter((c: any) => c.isCustomize2);
  const categories3 = categories.filter((c: any) => c.isCustomize3);

  const heroBlock = heroBlockRaw ? JSON.parse(JSON.stringify(heroBlockRaw)) : null;
  const settings = settingsRaw ? JSON.parse(JSON.stringify(settingsRaw)) : {};
  const celebrityReviews = JSON.parse(JSON.stringify(celebrityReviewsRaw));
  const testimonials = JSON.parse(JSON.stringify(testimonialsRaw));
  const customSections = JSON.parse(JSON.stringify(customSectionsRaw));

  const bestProductsConfig = settings?.bestProductsSection || {
    theme: "aurora",
    heading: "Featured Products",
    subheading: "Hand-selected pieces that represent the pinnacle of our collection.",
    limit: 8
  };

  const featuredProducts2Config = settings?.featuredProductsSection2 || {
    theme: "glassmorphism",
    heading: "Customize",
    subheading: "Our most popular picks this week.",
    limit: 8,
    category: ""
  };

  const featuredProducts3Config = settings?.featuredProductsSection3 || {
    theme: "minimalist",
    heading: "Customize",
    subheading: "Fresh drops you don't want to miss.",
    limit: 8,
    category: ""
  };

  const featuredCategoriesConfig = settings?.featuredCategoriesSection || {
    theme: "glassmorphism",
    heading: "Shop by Category",
    subheading: "Find exactly what you need.",
    limit: 6
  };

  // Batch 2: Consolidated parallel fetch for product grids
  const filter2: any = { status: "active", isCustomize2: true };
  const filter3: any = { status: "active", isCustomize3: true };

  const [productsRaw, products2Raw, products3Raw] = await Promise.all([
    getProducts({ status: "active", isFeatured: true }, { limit: bestProductsConfig.limit }),
    getProducts(filter2, { limit: featuredProducts2Config.limit }),
    getProducts(filter3, { limit: featuredProducts3Config.limit })
  ]);

  const products = JSON.parse(JSON.stringify(productsRaw));
  const products2 = JSON.parse(JSON.stringify(products2Raw));
  const products3 = JSON.parse(JSON.stringify(products3Raw));

  const cols = settings?.storefrontLayout?.productGridColumns || "4";
  const gridClass =
    cols === "2" ? "grid-cols-1 sm:grid-cols-2" :
      cols === "3" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  const cardStyle = settings?.storefrontLayout?.productCardStyle || "standard";

  // 1. HELPERS FOR RENDERING EACH SECTION TYPE
  const renderHero = () => {
    const customSlides = (settings?.heroConfig?.slides && settings.heroConfig.slides.length > 0)
      ? settings.heroConfig.slides
      : (heroBlock?.slides && heroBlock.slides.length > 0)
        ? heroBlock.slides
        : [];

    const mergedHero = {
      ...JSON.parse(JSON.stringify(heroBlock || {})),
      title: settings.heroConfig?.title || heroBlock?.title || "",
      subtitle: settings.heroConfig?.subtitle || heroBlock?.subtitle || "",
      cta: {
        text: settings.heroConfig?.ctaText || heroBlock?.cta?.text || "",
        link: settings.heroConfig?.ctaLink || heroBlock?.cta?.link || ""
      },
      titleSize: settings.heroConfig?.titleSize,
      slides: customSlides
    };
    // Extract a clean version of categories to pass to Hero
    // Fall back to the first 4 categories if none are explicitly featured
    const heroCats = featuredCategories.length > 0 ? featuredCategories : categories.slice(0, 4);
    const cleanCategories = JSON.parse(JSON.stringify(heroCats));
    return (
      <div data-customizer-block="true" data-block-id="hero" data-block-type="Hero Banner">
        <Hero key="hero" heroBlock={mergedHero} categories={cleanCategories} slides={customSlides.length > 0 ? customSlides : undefined} />
      </div>
    );
  };

  const renderBadges = () => {
    return <TrustBadges key="badges" settings={settings} />;
  };

  const renderPaymentBadges = () => {
    const paymentSection = settings?.paymentBadgesSection || { enabled: true, position: "footer" };
    const position = paymentSection.position || "footer";
    if (paymentSection.enabled === false || position === "footer" || position === "hidden") {
      return null;
    }

    return (
      <section key="payment-badges" data-customizer-block="true" data-block-id="payment-badges" data-block-type="Payment Badges" className="border-b border-border bg-muted/20 py-8 md:py-10 overflow-hidden">
        <div className="w-full max-w-360 mx-auto flex flex-col items-center text-center space-y-4">
          <div className="px-4 sm:px-6">
            <h3 className="font-bold uppercase tracking-[0.2em] text-xs sm:text-sm text-foreground">
              {paymentSection.heading || "Accepted Payment Methods"}
            </h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              {paymentSection.subheading || "Safe, instant & 100% encrypted checkout options"}
            </p>
          </div>

          <div className="w-full max-w-full pt-1 flex justify-center px-2 sm:px-4">
            <PaymentBadgesGrid settings={paymentSection} />
          </div>
        </div>
      </section>
    );
  };

  const renderCategories = () => {
    const { theme, heading, subheading, backgroundColor, textColor, limit } = featuredCategoriesConfig;

    let containerClass = "py-2 sm:py-3 md:py-5 max-w-[100rem] mx-auto px-1 sm:px-3 md:px-6 overflow-hidden ";
    if (!backgroundColor) {
      containerClass += "bg-background ";
    }

    let headerClass = "flex flex-col items-center text-center mb-3 md:mb-4 ";
    let headingClass = "text-xl sm:text-2xl md:text-3xl font-serif uppercase tracking-[0.08em] ";
    if (!textColor) {
      headingClass += "text-foreground ";
    }

    let subheadingClass = "mt-0.5 font-serif italic text-xs md:text-sm ";
    if (!textColor) {
      subheadingClass += "text-muted-foreground ";
    }

    let gridContainerClass = "flex flex-wrap justify-center items-stretch gap-3 sm:gap-4 lg:gap-6";

    if (theme === "aurora") {
      containerClass = `relative overflow-hidden py-4 sm:py-6 ${!backgroundColor ? 'bg-neutral-950 text-white' : ''} `;
      headingClass = `text-2xl md:text-4xl font-serif uppercase tracking-tight mb-1 drop-shadow-2xl relative z-10 ${!textColor ? 'text-white' : ''}`;
      subheadingClass = `font-medium text-xs md:text-sm relative z-10 ${!textColor ? 'text-white/80' : ''}`;
      headerClass = "flex flex-col items-center text-center mb-4";
    } else if (theme === "cyberpunk") {
      containerClass = `py-4 sm:py-6 font-mono border-y-2 border-[#0f0] ${!backgroundColor ? 'bg-black' : ''} `;
      headingClass = `text-2xl md:text-3xl font-bold uppercase tracking-tighter mb-1 drop-shadow-[0_0_10px_rgba(0,255,0,0.8)] ${!textColor ? 'text-[#0f0]' : ''}`;
      subheadingClass = `p-1 border border-[#0f0]/30 ${!backgroundColor ? 'bg-black/50' : ''} ${!textColor ? 'text-white' : ''}`;
      headerClass = "flex flex-col items-center text-center mb-4";
    } else if (theme === "glassmorphism") {
      containerClass = "py-2 sm:py-3 md:py-5 max-w-[100rem] mx-auto px-1 sm:px-3 md:px-6 overflow-hidden";
      headerClass = "flex flex-col items-center text-center mb-3 md:mb-4";
      headingClass = `text-xl sm:text-2xl md:text-3xl font-serif uppercase tracking-[0.08em] mb-0.5 break-words ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `font-serif italic text-xs md:text-sm ${!textColor ? 'text-muted-foreground' : ''}`;
    } else if (theme === "minimalist") {
      containerClass = `py-3 sm:py-5 px-1 sm:px-3 md:px-6 ${!backgroundColor ? 'bg-background' : ''}`;
      headingClass = `text-2xl md:text-4xl font-serif uppercase tracking-tight mb-1 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `text-xs md:text-sm font-medium ${!textColor ? 'text-muted-foreground' : ''}`;
      headerClass = "flex flex-col items-center text-center mb-4";
    } else if (theme === "editorial") {
      containerClass = `py-3 sm:py-5 border-t border-foreground ${!backgroundColor ? 'bg-background' : ''}`;
      headerClass = "flex flex-col items-center text-center mb-4 gap-1 border-b border-foreground pb-2";
      headingClass = `text-2xl md:text-4xl font-serif uppercase tracking-tight m-0 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `text-xs md:text-sm max-w-sm m-0 ${!textColor ? 'text-muted-foreground' : ''}`;
    } else if (theme === "grid-matrix") {
      containerClass = `relative overflow-hidden py-4 sm:py-6 border-y border-neutral-800 ${!backgroundColor ? 'bg-black' : ''}`;
      headingClass = `text-xl md:text-3xl font-serif uppercase tracking-[0.15em] mb-1 leading-tight z-10 relative ${!textColor ? 'text-white' : ''}`;
      subheadingClass = `text-xs uppercase tracking-widest max-w-3xl border-y border-neutral-800 py-1 z-10 relative ${!textColor ? 'text-neutral-400' : ''}`;
      headerClass = "flex flex-col items-center text-center mb-4";
    }

    const customContainerStyle = backgroundColor && theme !== "glassmorphism" ? { backgroundColor } : {};
    const customHeaderStyle = backgroundColor && theme === "glassmorphism" ? { backgroundColor } : {};
    const customTextStyle = textColor ? { color: textColor } : {};

    const displayCategories = featuredCategories.slice(0, limit || 6);

    return (
      <section
        key="categories"
        className={containerClass}
        style={customContainerStyle}
        data-customizer-block="true"
        data-block-id="categories"
        data-block-type="Featured Categories"
      >
        {theme === "aurora" && (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/10 blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
          </>
        )}

        {theme === "grid-matrix" && (
          <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 grid-rows-6 opacity-10 pointer-events-none">
            {Array.from({ length: 72 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-neutral-700" />
            ))}
          </div>
        )}

        <div className="max-w-360 mx-auto px-1 sm:px-3 md:px-6 w-full relative z-10">
          {(heading || subheading) && (
            <div className={headerClass} style={customHeaderStyle}>
              <div>
                {heading && <h2 className={headingClass} style={customTextStyle}>{heading}</h2>}
                {subheading && <p className={subheadingClass} style={customTextStyle}>{subheading}</p>}
              </div>
            </div>
          )}

          {displayCategories.length === 0 ? (
            <div className="p-4 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm bg-background/50">
              No featured categories selected. Toggle them on in the CMS.
            </div>
          ) : (
            <div className={gridContainerClass}>
              {displayCategories.map((cat: any) => (
                <Link
                  key={String(cat._id)}
                  href={`/${cat.slug}`}
                  className="group relative aspect-[4/3] min-h-[180px] sm:min-h-[220px] w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.5rem)] max-w-[380px] rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center p-2.5 sm:p-4 text-center shadow-md border border-border/20 shrink-0 grow-0"
                >
                  <div className="absolute inset-0 bg-muted z-0 group-hover:scale-105 transition-transform duration-700">
                    {cat.bannerImage && (
                      <ShimmerImage
                        src={cat.bannerImage}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </div>

                  {/* High contrast dark backdrop overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40 group-hover:from-black/90 group-hover:via-black/65 transition-colors duration-500 z-10" />

                  {/* Centered Category Content Above Image */}
                  <div className="relative z-20 flex flex-col items-center justify-center text-center max-w-sm px-3 sm:px-5">
                    <div className="mb-16 text-center" />
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-white uppercase tracking-[0.12em] drop-shadow-md mb-2">
                      {cat.name}
                    </h3>
                    {cat.metaDescription && (
                      <p className="text-[13px] sm:text-sm md:text-[15px] font-sans font-normal text-white/95 leading-relaxed drop-shadow-sm mb-3 max-w-xs sm:max-w-sm">
                        {cat.metaDescription}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-black/30 backdrop-blur-md border border-white/50 text-white font-sans text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] rounded-full shadow-md group-hover:bg-black/50 group-hover:border-white transition-all cursor-pointer">
                      Explore <ArrowRight size={13} className="sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderProducts = (config: any, productsList: any[], categoriesList: any[], keyId: string, idx: number) => {
    if (!config || (!productsList.length && !categoriesList.length)) return null;
    const { theme, heading, subheading, backgroundColor, textColor } = config;

    let containerClass = "pt-6 pb-12 md:pt-10 md:pb-16 border-t border-border ";
    if (!backgroundColor) {
      containerClass += "bg-muted/20 ";
    }

    let headerClass = "flex flex-col items-center text-center mb-6 md:mb-8 ";
    let headingClass = "text-3xl md:text-5xl font-serif uppercase tracking-[0.05em] mb-2 ";
    if (!textColor) {
      headingClass += "text-foreground ";
    }

    let subheadingClass = "max-w-2xl font-mono text-[11px] tracking-[0.2em] uppercase ";
    if (!textColor) {
      subheadingClass += "text-muted-foreground ";
    }

    let gridContainerClass = `grid gap-4 sm:gap-6 lg:gap-8 ${gridClass}`;

    if (theme === "aurora") {
      containerClass = `relative overflow-hidden pt-10 pb-16 md:pt-12 md:pb-20 ${!backgroundColor ? 'bg-background' : ''} `;
      headingClass = `text-4xl md:text-6xl font-serif tracking-[0.05em] uppercase mb-2 relative z-10 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `font-mono tracking-[0.2em] text-[11px] uppercase max-w-2xl relative z-10 ${!textColor ? 'text-muted-foreground' : ''}`;
      headerClass = "flex flex-col items-center text-center mb-6 md:mb-8";
    } else if (theme === "cyberpunk") {
      containerClass = `pt-8 pb-14 md:pt-10 md:pb-16 font-mono border-y border-border ${!backgroundColor ? 'bg-background' : ''} `;
      headingClass = `text-4xl md:text-5xl font-serif tracking-[0.05em] uppercase mb-2 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `max-w-2xl font-mono tracking-[0.2em] text-[11px] uppercase ${!textColor ? 'text-muted-foreground' : ''}`;
      headerClass = "flex flex-col items-center text-center mb-6 md:mb-8";
    } else if (theme === "glassmorphism") {
      containerClass = "pt-6 pb-12 md:pt-8 md:pb-16 max-w-[95rem] mx-auto px-1 sm:px-3 md:px-8 overflow-hidden";
      headerClass = `backdrop-blur-xl border border-border/50 p-4 md:p-6 rounded-3xl md:rounded-[2rem] shadow-sm flex flex-col items-center text-center mb-6 md:mb-8 w-full ${!backgroundColor ? 'bg-background/40' : ''}`;
      headingClass = `text-3xl md:text-5xl font-serif tracking-[0.05em] uppercase mb-2 break-words w-full ${!textColor ? 'text-foreground' : ''}`;
    } else if (theme === "minimalist") {
      containerClass = `pt-10 pb-16 md:pt-12 md:pb-20 px-1 sm:px-3 md:px-6 ${!backgroundColor ? 'bg-background' : ''}`;
      headingClass = `text-4xl md:text-6xl font-serif tracking-[0.05em] uppercase mb-3 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `font-mono tracking-[0.2em] text-[11px] uppercase max-w-lg ${!textColor ? 'text-muted-foreground' : ''}`;
      headerClass = "flex flex-col items-center text-center mb-6 md:mb-8";
    } else if (theme === "editorial") {
      containerClass = `pt-8 pb-14 md:pt-10 md:pb-16 border-t border-border ${!backgroundColor ? 'bg-background' : ''}`;
      headerClass = "flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border pb-4";
      headingClass = `text-4xl md:text-6xl font-serif tracking-[0.05em] uppercase m-0 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `font-mono tracking-[0.2em] text-[11px] uppercase max-w-sm text-left m-0 ${!textColor ? 'text-muted-foreground' : ''}`;
    } else if (theme === "grid-matrix") {
      containerClass = `relative overflow-hidden pt-10 pb-16 md:pt-12 md:pb-20 border-y border-border ${!backgroundColor ? 'bg-background' : ''}`;
      headingClass = `text-4xl md:text-5xl font-serif tracking-[0.05em] uppercase mb-3 z-10 relative ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `font-mono tracking-[0.2em] text-[11px] uppercase max-w-3xl border-y border-border py-2 z-10 relative ${!textColor ? 'text-muted-foreground' : ''}`;
      headerClass = "flex flex-col md:flex-row items-end justify-between mb-6 md:mb-8";
    }

    let finalHeadingClass = headingClass;
    if (config.headingSize) {
      finalHeadingClass = headingClass
        .replace(/text-[a-z0-9-\[\]]+/g, "")
        .replace(/md:text-[a-z0-9-\[\]]+/g, "") + " " + config.headingSize;
    }

    const customContainerStyle = backgroundColor && theme !== "glassmorphism" ? { backgroundColor } : {};
    const customHeaderStyle = backgroundColor && theme === "glassmorphism" ? { backgroundColor } : {};
    const customTextStyle = textColor ? { color: textColor } : {};

    return (
      <section
        key={keyId}
        className={containerClass}
        style={customContainerStyle}
        data-customizer-block="true"
        data-block-id={keyId === "best-products" ? "best-products" : keyId === "customize-1" ? "customize-1" : "customize-2"}
        data-block-type="Product Grid"
      >
        {theme === "aurora" && (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/10 blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
          </>
        )}

        {theme === "grid-matrix" && (
          <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 grid-rows-6 opacity-10 pointer-events-none">
            {Array.from({ length: 72 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-neutral-700" />
            ))}
          </div>
        )}

        <div className="max-w-360 mx-auto px-1 sm:px-3 md:px-6 w-full relative z-10">
          <div className={headerClass} style={customHeaderStyle}>
            {heading && <h2 className={finalHeadingClass} style={customTextStyle}>{heading}</h2>}
            {subheading && <p className={subheadingClass} style={customTextStyle}>{subheading}</p>}
          </div>

          {!productsList.length && !categoriesList.length ? (
            <div className="p-12 border-2 border-dashed border-border rounded-3xl text-center text-muted-foreground font-medium bg-background/50 backdrop-blur-sm">
              No featured items selected. Toggle them on in the CMS.
            </div>
          ) : (
            <div className="space-y-12">
              {categoriesList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-transparent">
                  {categoriesList.map((cat: any) => (
                    <div key={String(cat._id)} className="w-full group">
                      <Link
                        href={`/${cat.slug}`}
                        className="w-full h-full relative aspect-square overflow-hidden rounded-2xl bg-transparent p-6 flex flex-col justify-end shadow-sm"
                      >
                        <div className="absolute inset-0 bg-muted z-0 transition-transform duration-700">
                          {cat.bannerImage && (
                            <ShimmerImage
                              src={cat.bannerImage}
                              alt={cat.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                              sizes="(max-width: 768px) 100vw, 25vw"
                            />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-linear-to-t from-[#141210]/80 via-[#141210]/20 to-transparent z-10" />

                        <div className="relative z-20 w-full">
                          <h3 className="text-xl md:text-2xl font-serif text-background mb-2">
                            {cat.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#A98F5C] group-hover:text-background transition-colors">
                            View more <ArrowRight size={14} />
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {productsList.length > 0 && (
                <div className={`${gridContainerClass} justify-center md:justify-start`}>
                  {productsList.map((product: any) => (
                    <div key={String(product._id)} className="w-full flex">
                      <ProductCard
                        product={product}
                        layoutStyle={cardStyle as any}
                        showSoldOutBadge={settings?.storefrontLayout?.showSoldOutBadge !== false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-16 flex justify-center">
            <Link
              href="/all"
              className="inline-flex items-center justify-center px-10 py-4 font-bold uppercase tracking-widest text-sm transition-all border border-foreground bg-foreground text-background rounded-none hover:bg-background hover:text-foreground"
            >
              View Collection
            </Link>
          </div>
        </div>
      </section>
    );
  };

  const renderTestimonials = () => {
    const config = settings?.testimonialsSection || {
      theme: "glassmorphism",
      heading: "What Our Customers Say",
      subheading: "Read the stories and experiences of people who love our brand.",
      backgroundColor: "",
      textColor: ""
    };

    const { theme, heading, subheading, backgroundColor, textColor } = config;

    let containerClass = "py-24 border-t border-border ";
    if (!backgroundColor) {
      containerClass += "bg-muted/20 ";
    }

    let headerClass = "flex flex-col items-center text-center mb-16";
    let headingClass = "text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-foreground";
    let subheadingClass = "max-w-2xl text-muted-foreground";

    if (theme === "aurora") {
      containerClass = `relative overflow-hidden py-32 border-t border-border ${!backgroundColor ? 'bg-background' : ''}`;
      headingClass = `text-5xl md:text-7xl font-black tracking-tighter mb-6 relative z-10 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `text-xl max-w-2xl relative z-10 ${!textColor ? 'text-muted-foreground' : ''}`;
    } else if (theme === "cyberpunk") {
      containerClass = `py-32 border-t-4 border-primary ${!backgroundColor ? 'bg-black' : ''}`;
      headingClass = `text-5xl md:text-7xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-6 ${!textColor ? '' : ''}`;
      subheadingClass = `text-lg font-mono uppercase tracking-widest ${!textColor ? 'text-primary/80' : ''}`;
    } else if (theme === "minimalist") {
      containerClass = `py-32 px-6 ${!backgroundColor ? 'bg-background' : ''}`;
      headingClass = `text-6xl md:text-[6rem] font-black uppercase tracking-tighter leading-[0.85] mb-4 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `text-xl font-medium ${!textColor ? 'text-muted-foreground' : ''}`;
      headerClass = "flex flex-col items-start mb-16";
    } else if (theme === "editorial") {
      containerClass = `py-24 border-t border-foreground ${!backgroundColor ? 'bg-background' : ''}`;
      headerClass = "flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b-2 border-foreground pb-8";
      headingClass = `text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none m-0 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `text-lg max-w-sm text-left m-0 ${!textColor ? 'text-muted-foreground' : ''}`;
    } else if (theme === "grid-matrix") {
      containerClass = `relative overflow-hidden py-32 border-y border-neutral-800 ${!backgroundColor ? 'bg-black' : ''}`;
      headingClass = `text-4xl md:text-6xl font-black uppercase tracking-[0.2em] mb-6 leading-tight z-10 relative ${!textColor ? 'text-white' : ''}`;
      subheadingClass = `text-lg uppercase tracking-widest max-w-3xl border-y border-neutral-800 py-4 z-10 relative ${!textColor ? 'text-neutral-400' : ''}`;
      headerClass = "flex flex-col md:flex-row items-end justify-between mb-16";
    }

    const customContainerStyle = backgroundColor && theme !== "glassmorphism" ? { backgroundColor } : {};
    const customTextStyle = textColor ? { color: textColor } : {};

    return (
      <section
        key="testimonials"
        className={containerClass}
        style={customContainerStyle}
        data-customizer-block="true"
        data-block-id="testimonials"
        data-block-type="Testimonials"
      >
        {theme === "aurora" && (
          <>
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/10 blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
          </>
        )}

        {theme === "grid-matrix" && (
          <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 grid-rows-6 opacity-10 pointer-events-none">
            {Array.from({ length: 72 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-neutral-700" />
            ))}
          </div>
        )}

        <div className="max-w-360 mx-auto px-6 relative z-10">
          <div className={headerClass}>
            <div>
              <h2 className={headingClass} style={customTextStyle}>
                {heading}
              </h2>
              <p className={subheadingClass} style={customTextStyle}>
                {subheading}
              </p>
            </div>
          </div>

          <TestimonialSlider testimonials={testimonials} />
          <SubmitTestimonialForm />
        </div>
      </section>
    );
  };

  const renderCelebrityReviews = () => {
    if (celebrityReviews.length === 0) return null;
    const config = settings?.celebrityReviewsSection || {
      theme: "glassmorphism",
      heading: "Reviews by Celebrities",
      subheading: "See what the biggest names are saying about our exclusive collection.",
      backgroundColor: "",
      textColor: ""
    };

    const { theme, heading, subheading, backgroundColor, textColor } = config;

    let containerClass = "py-24 border-t border-border ";
    if (!backgroundColor) {
      containerClass += "bg-muted/20 ";
    }

    let headerClass = "flex flex-col items-center text-center mb-16";
    let headingClass = "text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-foreground";
    let subheadingClass = "max-w-2xl text-muted-foreground";

    if (theme === "aurora") {
      containerClass = `relative overflow-hidden py-32 border-t border-border ${!backgroundColor ? 'bg-background' : ''}`;
      headingClass = `text-5xl md:text-7xl font-black tracking-tighter mb-6 relative z-10 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `text-xl max-w-2xl relative z-10 ${!textColor ? 'text-muted-foreground' : ''}`;
    } else if (theme === "cyberpunk") {
      containerClass = `py-32 border-t-4 border-primary ${!backgroundColor ? 'bg-black' : ''}`;
      headingClass = `text-5xl md:text-7xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-6 ${!textColor ? '' : ''}`;
      subheadingClass = `text-lg font-mono uppercase tracking-widest ${!textColor ? 'text-primary/80' : ''}`;
    } else if (theme === "minimalist") {
      containerClass = `py-32 px-6 ${!backgroundColor ? 'bg-background' : ''}`;
      headingClass = `text-6xl md:text-[6rem] font-black uppercase tracking-tighter leading-[0.85] mb-4 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `text-xl font-medium ${!textColor ? 'text-muted-foreground' : ''}`;
      headerClass = "flex flex-col items-start mb-16";
    } else if (theme === "editorial") {
      containerClass = `py-24 border-t border-foreground ${!backgroundColor ? 'bg-background' : ''}`;
      headerClass = "flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b-2 border-foreground pb-8";
      headingClass = `text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none m-0 ${!textColor ? 'text-foreground' : ''}`;
      subheadingClass = `text-lg max-w-sm text-left m-0 ${!textColor ? 'text-muted-foreground' : ''}`;
    } else if (theme === "grid-matrix") {
      containerClass = `relative overflow-hidden py-32 border-y border-neutral-800 ${!backgroundColor ? 'bg-black' : ''}`;
      headingClass = `text-4xl md:text-6xl font-black uppercase tracking-[0.2em] mb-6 leading-tight z-10 relative ${!textColor ? 'text-white' : ''}`;
      subheadingClass = `text-lg uppercase tracking-widest max-w-3xl border-y border-neutral-800 py-4 z-10 relative ${!textColor ? 'text-neutral-400' : ''}`;
      headerClass = "flex flex-col md:flex-row items-end justify-between mb-16";
    }

    const customContainerStyle = backgroundColor && theme !== "glassmorphism" ? { backgroundColor } : {};
    const customTextStyle = textColor ? { color: textColor } : {};

    return (
      <section
        key="celebrity-reviews"
        className={containerClass}
        style={customContainerStyle}
        data-customizer-block="true"
        data-block-id="celebrity-reviews"
        data-block-type="Celebrity Reviews"
      >
        {theme === "aurora" && (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/10 blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
          </>
        )}

        {theme === "grid-matrix" && (
          <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 grid-rows-6 opacity-10 pointer-events-none">
            {Array.from({ length: 72 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-neutral-700" />
            ))}
          </div>
        )}

        <div className="max-w-360 mx-auto px-6 relative z-10">
          <div className={headerClass}>
            <div>
              <h2 className={headingClass} style={customTextStyle}>
                {heading}
              </h2>
              <p className={subheadingClass} style={customTextStyle}>
                {subheading}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {celebrityReviews.map((review: any) => (
              <div key={String(review._id)} className="flex flex-col items-start p-0">
                <div className="w-full aspect-9/16 bg-[#1A1A1A] mb-6 relative overflow-hidden rounded-xl">
                  <div
                    className="absolute inset-0 w-full h-full [&>iframe]:w-full! [&>iframe]:h-full! [&>iframe]:border-0! [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:object-cover"
                    dangerouslySetInnerHTML={{ __html: review.videoIframe }}
                  />
                </div>
                <h3 className="text-xl font-serif uppercase tracking-wide text-[#1A1A1A] mb-2" style={customTextStyle}>
                  {review.celebrityName}
                </h3>
                {review.quote ? (
                  <p className="text-[#1A1A1A]/80 font-serif italic text-sm border-l border-[#A98F5C] pl-4">
                    "{review.quote}"
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderCustomSections = () => (
    <BlockRenderer key="custom-html" blocks={customSections.map((section: any) => ({
      blockType: section.blockType || "custom-html",
      blockData: section.blockData || {
        themeWrapper: (section as any).themeWrapper,
        htmlContent: (section as any).htmlContent
      }
    } as any))} />
  );

  // 2. DYNAMIC LAYOUT PIPELINE (Shopify & WooCommerce style)
  const defaultOrder = [
    "hero",
    "badges",
    "categories",
    "best-products",
    "customize-1",
    "customize-2",
    "testimonials",
    "celebrity-reviews",
    "custom-html"
  ];

  const rawSectionOrder = settings?.storefrontLayout?.sectionOrder || defaultOrder;
  // Deduplicate: keep first occurrence of each entry (custom-section- entries de-duped by mongo ID)
  const seenCustomIds = new Set<string>();
  const sectionOrder = rawSectionOrder.filter((id: string) => {
    if (id.startsWith("custom-section-")) {
      const mongoId = id.split("custom-section-")[1].split(":::")[0];
      if (seenCustomIds.has(mongoId)) return false;
      seenCustomIds.add(mongoId);
    }
    return true;
  });
  const hiddenSections = settings?.storefrontLayout?.hiddenSections || [];

  // Track rendered custom mongo IDs to guard against any remaining duplicates
  const renderedCustomIds = new Set<string>();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {sectionOrder.map((sectionId: any) => {
        if (hiddenSections.includes(sectionId)) return null;

        let sectionContent = null;

        if (sectionId.startsWith("custom-section-")) {
          const customId = sectionId.split("custom-section-")[1].split(":::")[0];
          // Guard: never render the same mongo ID twice in case sectionOrder has duplicates
          if (renderedCustomIds.has(customId)) return null;
          renderedCustomIds.add(customId);
          const section = customSections.find((s: any) => String(s._id) === customId);
          if (section) {
            sectionContent = (
              <BlockRenderer key={sectionId} blocks={[{
                blockType: section.blockType || "custom-html",
                blockData: section.blockData || {
                  themeWrapper: (section as any).themeWrapper,
                  htmlContent: (section as any).htmlContent
                }
              } as any]} />
            );
          }
        } else {
          switch (sectionId) {
            case "hero":
              sectionContent = renderHero();
              break;
            case "badges":
              sectionContent = (
                <React.Fragment key="badges-group">
                  {renderBadges()}
                  {renderPaymentBadges()}
                </React.Fragment>
              );
              break;
            case "payment-badges":
              sectionContent = renderPaymentBadges();
              break;
            case "categories":
              sectionContent = renderCategories();
              break;
            case "best-products":
              sectionContent = renderProducts(bestProductsConfig, products, [], "best-products", 0);
              break;
            case "customize-1":
              sectionContent = renderProducts(featuredProducts2Config, products2, categories2, "customize-1", 1);
              break;
            case "customize-2":
              sectionContent = renderProducts(featuredProducts3Config, products3, categories3, "customize-2", 2);
              break;
            case "testimonials":
              sectionContent = renderTestimonials();
              break;
            case "celebrity-reviews":
              sectionContent = renderCelebrityReviews();
              break;
            case "custom-html":
              // Custom sections render individually via custom-section-{id} entries in sectionOrder
              // Rendering them here too (via renderCustomSections) would cause duplicates
              sectionContent = null;
              break;
          }
        }

        return sectionContent ? <React.Fragment key={sectionId}>{sectionContent}</React.Fragment> : null;
      })}
    </div>
  );
}

import SmartLink from "@/components/storefront/SmartLink";
import { ArrowRight, HelpCircle, Sparkles, Star, Mail, Quote, Users, Image as ImageIcon, Tag } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import PharmacyProductCarousel from "@/components/storefront/PharmacyProductCarousel";
import ContactFormClient from "@/components/storefront/ContactFormClient";
import TestimonialSlider from "@/components/storefront/TestimonialSlider";
import UniversalVideoEmbed from "@/components/storefront/UniversalVideoEmbed";
import { getProducts } from "@/server/repositories/productRepository";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import { IPageBlock } from "@/server/db/models/Page";

// Server Component for fetching products asynchronously
async function FeaturedProductsBlock({ data }: { data: any }) {
  const limit = data.limit ? parseInt(data.limit, 10) : 4;

  const filter: any = {};
  if (data.selectionMode === "specific" && Array.isArray(data.productIds) && data.productIds.length > 0) {
    filter._id = { $in: data.productIds };
  } else if (data.categorySlug && data.categorySlug.trim() !== "") {
    filter.category = data.categorySlug.trim();
  }

  const rawProducts = await getProducts(filter, { limit });
  const products = JSON.parse(JSON.stringify(rawProducts));

  return (
    <section className="max-w-360 mx-auto px-2 sm:px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        {data.heading && (
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-foreground">
            {data.heading}
          </h2>
        )}
        {data.categorySlug && (
          <SmartLink
            href={`/collections/${data.categorySlug}`}
            className="group flex items-center gap-2 text-xs md:text-sm font-bold text-primary uppercase tracking-widest hover:underline"
          >
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </SmartLink>
        )}
      </div>

      {products.length === 0 ? (
        <div className="p-8 md:p-12 border-2 border-dashed border-border rounded-2xl text-center text-muted-foreground font-medium">
          No products found {data.categorySlug ? `in category "${data.categorySlug}"` : ""}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-start">
          {products.map((product: any) => (
            <div key={String(product._id)} className="w-full flex">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

async function PharmacyCatalogBlock({ data }: { data: any }) {
  const limit = data.limit ? parseInt(data.limit, 10) : 8;
  const filter: any = {};
  if (data.selectionMode === "specific" && Array.isArray(data.productIds) && data.productIds.length > 0) {
    filter._id = { $in: data.productIds };
  } else if (data.categorySlug && data.categorySlug.trim() !== "") {
    filter.category = data.categorySlug.trim();
  }

  const rawProducts = await getProducts(filter, { limit });
  const products = JSON.parse(JSON.stringify(rawProducts));

  return (
    <PharmacyProductCarousel
      title={data.heading || "Pharmacy & Wellness Showcase"}
      subtitle={data.subheading || data.subtitle}
      products={products}
      bannerImage={data.bgImage || data.image || data.bannerImage}
      viewAllLink={data.categorySlug ? `/collections/${data.categorySlug}` : "/collections/all"}
      categoryName={data.categorySlug}
    />
  );
}


export default async function BlockRenderer({ blocks }: { blocks: IPageBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  const [settings] = await Promise.all([
    getCachedSiteSettings()
  ]);

  const visibleBlocks = blocks.filter((b: any) => !b.blockData?.hidden);

  if (visibleBlocks.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 w-full space-y-6 py-2">
      {visibleBlocks.map((block: any, idx: number) => {
        const data = block.blockData || {};

        switch (block.blockType) {
          case "hero":
            const theme = data.theme || "aurora";
            const bgImageStyle = data.bgImage ? { backgroundImage: `url(${data.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
            const heroTitleSize = data.titleSize === "small"
              ? "text-xl sm:text-2xl md:text-3xl lg:text-4xl"
              : data.titleSize === "large"
                ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl";

            if (theme === "aurora") {
              return (
                <section key={idx} className="w-full relative overflow-hidden min-h-[50vh] md:min-h-[65vh] flex items-center justify-center py-12 sm:py-16 md:py-24">
                  <div className="absolute inset-0 bg-neutral-950 -z-20" />
                  {data.bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-40 -z-10 mix-blend-overlay" style={{ backgroundImage: `url(${data.bgImage})` }} />}
                  <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/30 blur-[120px] animate-pulse -z-10 mix-blend-screen" />
                  <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/20 blur-[150px] animate-pulse -z-10 mix-blend-screen" style={{ animationDelay: '2s' }} />

                  <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
                    <h2 className={`${heroTitleSize} font-black uppercase tracking-tight mb-4 sm:mb-6 leading-tight drop-shadow-2xl`}>
                      {data.heading}
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-white/80 font-medium mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto drop-shadow-md">
                      {data.subheading}
                    </p>
                    {data.buttonText && data.buttonUrl && (
                      <SmartLink href={data.buttonUrl} className="group relative inline-flex items-center gap-3 px-7 sm:px-9 py-3 sm:py-3.5 font-bold text-background bg-foreground rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <span className="relative z-10 uppercase tracking-widest text-xs sm:text-sm">{data.buttonText}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform relative z-10" />
                        <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                      </SmartLink>
                    )}
                  </div>
                </section>
              );
            }

            if (theme === "cyberpunk") {
              return (
                <section key={idx} className="w-full relative overflow-hidden min-h-[50vh] md:min-h-[65vh] flex items-center bg-black font-mono border-b border-[#0f0] py-12 sm:py-16">
                  {data.bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity grayscale" style={{ backgroundImage: `url(${data.bgImage})` }} />}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMjU1LCAwLCAwLjEpIi8+PC9zdmc+')] opacity-50" />

                  <div className="relative z-10 max-w-360 mx-auto px-4 sm:px-6 w-full">
                    <div className="border-l-4 border-[#0f0] pl-5 sm:pl-8 py-4">
                      <h2 className={`${heroTitleSize} font-bold uppercase tracking-tight mb-4 text-white relative leading-tight`}>
                        <span className="absolute -left-1 top-0 text-[#f0f] opacity-50 select-none animate-pulse">{data.heading}</span>
                        <span className="absolute left-1 top-0 text-[#0ff] opacity-50 select-none animate-pulse" style={{ animationDelay: '0.1s' }}>{data.heading}</span>
                        <span className="relative z-10">{data.heading}</span>
                      </h2>
                      <p className="text-sm sm:text-base text-[#0f0] mb-6 sm:mb-8 max-w-xl bg-black/50 p-3 sm:p-4 border border-[#0f0]/30 backdrop-blur-sm">
                        {data.subheading}
                      </p>
                      {data.buttonText && data.buttonUrl && (
                        <SmartLink href={data.buttonUrl} className="group relative inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-3.5 font-bold text-foreground bg-[#0f0] uppercase tracking-widest text-xs sm:text-sm hover:bg-[#0f0]/90 transition-colors shadow-[0_0_20px_rgba(0,255,0,0.4)]">
                          <span>{data.buttonText}</span>
                          <span className="w-2 h-2 bg-black animate-ping" />
                        </SmartLink>
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            if (theme === "glassmorphism") {
              return (
                <section key={idx} className="max-w-[100rem] mx-auto p-4 md:p-8">
                  <div className="relative rounded-[2rem] sm:rounded-[3rem] min-h-[50vh] md:min-h-[65vh] flex items-center p-6 sm:p-10 md:p-14 overflow-hidden" style={data.bgImage ? { backgroundImage: `url(${data.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: 'var(--muted)' }}>
                    <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent" />

                    <div className="relative z-10 max-w-2xl backdrop-blur-xl bg-background/40 border border-white/20 p-6 sm:p-10 md:p-12 rounded-3xl shadow-2xl">
                      <h2 className={`${heroTitleSize} font-black uppercase tracking-tight mb-4 sm:mb-6 text-foreground leading-tight`}>
                        {data.heading}
                      </h2>
                      <p className="text-sm sm:text-base md:text-lg text-foreground/80 font-medium mb-6 sm:mb-8 leading-relaxed">
                        {data.subheading}
                      </p>
                      {data.buttonText && data.buttonUrl && (
                        <SmartLink href={data.buttonUrl} className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-3.5 font-bold text-primary-foreground bg-primary rounded-xl transition-transform hover:scale-105 shadow-lg border border-primary/50 text-xs sm:text-sm">
                          <span className="uppercase tracking-widest">{data.buttonText}</span>
                          <ArrowRight size={14} />
                        </SmartLink>
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            if (theme === "minimalist") {
              return (
                <section key={idx} className="w-full relative min-h-[50vh] md:min-h-[65vh] flex flex-col justify-center bg-background px-4 sm:px-6 py-12 sm:py-16">
                  {data.bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-10 grayscale mix-blend-multiply" style={{ backgroundImage: `url(${data.bgImage})` }} />}
                  <div className="relative z-10 max-w-360 mx-auto w-full flex flex-col items-center text-center">
                    <h2 className={`${heroTitleSize} font-black uppercase tracking-tight leading-tight text-foreground mb-6 sm:mb-8`}>
                      {data.heading}
                    </h2>
                    <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
                      <p className="text-sm sm:text-base md:text-lg font-medium text-muted-foreground max-w-md text-center md:text-left">
                        {data.subheading}
                      </p>
                      <div className="w-px h-10 bg-border hidden md:block" />
                      {data.buttonText && data.buttonUrl && (
                        <SmartLink href={data.buttonUrl} className="group inline-flex items-center gap-3 text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors">
                          <span className="uppercase tracking-widest">{data.buttonText}</span>
                          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
                            <ArrowRight size={16} />
                          </span>
                        </SmartLink>
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            if (theme === "split-screen") {
              return (
                <section key={idx} className="w-full min-h-[50vh] md:min-h-[65vh] flex flex-col md:flex-row bg-background">
                  <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20 z-10">
                    <h2 className={`${heroTitleSize} font-black uppercase tracking-tight mb-4 sm:mb-6 text-foreground leading-tight`}>
                      {data.heading}
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-xl">
                      {data.subheading}
                    </p>
                    {data.buttonText && data.buttonUrl && (
                      <div>
                        <SmartLink href={data.buttonUrl} className="inline-flex items-center gap-3 pb-2 border-b-2 border-foreground text-foreground font-bold uppercase tracking-widest text-xs sm:text-sm hover:text-primary hover:border-primary transition-colors">
                          <span>{data.buttonText}</span>
                          <ArrowRight size={14} />
                        </SmartLink>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 relative min-h-[30vh] md:min-h-full bg-muted">
                    {data.bgImage ? (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${data.bgImage})` }} />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-accent/20" />
                    )}
                  </div>
                </section>
              );
            }

            if (theme === "grid-matrix") {
              return (
                <section key={idx} className="w-full relative min-h-[50vh] md:min-h-[65vh] flex items-center justify-center bg-black overflow-hidden py-16 sm:py-24 border-y border-neutral-800">
                  {/* CSS Grid Background */}
                  <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 grid-rows-6 opacity-20">
                    {Array.from({ length: 72 }).map((_, i) => (
                      <div key={i} className="border-[0.5px] border-neutral-700 hover:bg-primary transition-colors duration-500 cursor-crosshair" />
                    ))}
                  </div>
                  {data.bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-lighten" style={{ backgroundImage: `url(${data.bgImage})` }} />}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black pointer-events-none" />

                  <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
                    <h2 className={`${heroTitleSize} font-black uppercase tracking-[0.08em] mb-4 sm:mb-6 leading-tight`}>
                      {data.heading}
                    </h2>
                    <p className="text-neutral-400 text-sm sm:text-base md:text-lg tracking-wider uppercase mb-6 sm:mb-8 max-w-2xl mx-auto border-y border-neutral-800 py-3 sm:py-4">
                      {data.subheading}
                    </p>
                    {data.buttonText && data.buttonUrl && (
                      <SmartLink href={data.buttonUrl} className="group relative inline-block border border-primary text-primary px-8 sm:px-10 py-3 sm:py-3.5 font-bold uppercase tracking-widest text-xs sm:text-sm hover:bg-primary hover:text-foreground transition-all">
                        {data.buttonText}
                      </SmartLink>
                    )}
                  </div>
                </section>
              );
            }

            // Fallback (aurora but simpler, for safety)
            return (
              <section key={idx} className="max-w-360 mx-auto px-4 sm:px-6 py-6 sm:py-10">
                <div className="relative rounded-[2rem] overflow-hidden bg-linear-to-br from-neutral-900 to-black text-white p-8 sm:p-12 md:p-16 shadow-2xl border border-neutral-800">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
                  {data.bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: `url(${data.bgImage})` }} />}
                  <div className="relative z-10 max-w-xl">
                    <h2 className={`${heroTitleSize} font-black uppercase tracking-tight mb-4 sm:mb-6 leading-tight`}>
                      {data.heading}
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-neutral-300 font-medium mb-6 sm:mb-8 leading-relaxed">
                      {data.subheading}
                    </p>
                    {data.buttonText && data.buttonUrl && (
                      <SmartLink
                        href={data.buttonUrl}
                        className="group relative inline-flex items-center gap-3 px-7 sm:px-9 py-3 sm:py-3.5 font-bold text-foreground bg-card rounded-full overflow-hidden transition-all hover:scale-105 text-xs sm:text-sm"
                      >
                        <span className="relative z-10 uppercase tracking-widest">{data.buttonText}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </SmartLink>
                    )}
                  </div>
                </div>
              </section>
            );

          case "rich-text":
            const hasHeadingFirst = Boolean(data.heading && data.heading.trim() !== "");
            const htmlContentFirst = data.content || data.body || "";
            if (!hasHeadingFirst && !htmlContentFirst.trim()) return null;

            return (
              <section key={idx} className="max-w-4xl mx-auto px-6 py-2">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  {hasHeadingFirst && (
                    <h2 className="text-3xl font-black uppercase tracking-tight text-foreground border-b border-border pb-3 mb-4">
                      {data.heading}
                    </h2>
                  )}
                  {htmlContentFirst.trim() && (
                    <div
                      className="user-generated-content text-muted-foreground text-lg leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: htmlContentFirst }}
                    />
                  )}
                </div>
              </section>
            );

          case "custom-html":
            const wrapperTheme = data.themeWrapper || "none";
            const customHtmlContent = data.htmlContent || "";

            if (wrapperTheme === "aurora") {
              return (
                <section key={idx} className="w-full relative overflow-hidden min-h-[50vh] flex flex-col justify-center py-20">
                  <div className="absolute inset-0 bg-neutral-950 -z-20" />
                  <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/30 blur-[120px] animate-pulse -z-10 mix-blend-screen" />
                  <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/20 blur-[150px] animate-pulse -z-10 mix-blend-screen" style={{ animationDelay: '2s' }} />
                  <div className="user-generated-content relative z-10 max-w-360 mx-auto px-6 w-full text-white" dangerouslySetInnerHTML={{ __html: customHtmlContent }} />
                </section>
              );
            }

            if (wrapperTheme === "cyberpunk") {
              return (
                <section key={idx} className="w-full relative overflow-hidden min-h-[50vh] flex flex-col justify-center bg-black font-mono border-y border-[#0f0] py-20">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMjU1LCAwLCAwLjEpIi8+PC9zdmc+')] opacity-50" />
                  <div className="user-generated-content relative z-10 max-w-360 mx-auto px-6 w-full text-white" dangerouslySetInnerHTML={{ __html: customHtmlContent }} />
                </section>
              );
            }

            if (wrapperTheme === "glassmorphism") {
              return (
                <section key={idx} className="max-w-[100rem] mx-auto p-4 md:p-8">
                  <div className="relative rounded-[3rem] min-h-[50vh] flex flex-col justify-center overflow-hidden bg-muted">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10" />
                    <div className="user-generated-content relative z-10 max-w-360 w-full mx-auto backdrop-blur-xl bg-background/40 border border-border/50 p-10 md:p-16 rounded-4xl shadow-2xl" dangerouslySetInnerHTML={{ __html: customHtmlContent }} />
                  </div>
                </section>
              );
            }

            if (wrapperTheme === "minimalist") {
              return (
                <section key={idx} className="w-full relative min-h-[50vh] flex flex-col justify-center bg-background py-24 px-6 border-y border-border/30">
                  <div className="user-generated-content relative z-10 max-w-360 mx-auto w-full text-foreground" dangerouslySetInnerHTML={{ __html: customHtmlContent }} />
                </section>
              );
            }

            if (wrapperTheme === "grid-matrix") {
              return (
                <section key={idx} className="w-full relative min-h-[50vh] flex flex-col justify-center bg-black overflow-hidden py-32 border-y border-neutral-800">
                  <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 grid-rows-6 opacity-20">
                    {Array.from({ length: 72 }).map((_, i) => (
                      <div key={i} className="border-[0.5px] border-neutral-700 hover:bg-primary transition-colors duration-500 cursor-crosshair" />
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black pointer-events-none" />
                  <div className="user-generated-content relative z-10 max-w-360 mx-auto px-6 w-full text-white" dangerouslySetInnerHTML={{ __html: customHtmlContent }} />
                </section>
              );
            }

            // Fallback (none / transparent)
            return (
              <section key={idx} className="max-w-360 mx-auto px-6 py-12 w-full">
                <div dangerouslySetInnerHTML={{ __html: customHtmlContent }} className="user-generated-content w-full leading-relaxed space-y-4" />
              </section>
            );

          case "features":
            return (
              <section key={idx} className="max-w-360 mx-auto px-6 space-y-12">
                {data.heading && (
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-center text-foreground">
                    {data.heading}
                  </h2>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                  {(data.items || []).map((item: any, fIdx: number) => (
                    <div key={fIdx} className="glass-panel p-5 md:p-6 rounded-2xl md:rounded-3xl border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col items-start gap-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 relative z-10 group-hover:scale-110 transition-transform">
                        <Sparkles size={16} />
                      </div>
                      <div className="relative z-10 w-full">
                        <h3 className="text-sm md:text-base font-bold uppercase tracking-tight text-foreground mb-1 truncate">{item.title}</h3>
                        <p className="text-muted-foreground text-[11px] md:text-xs leading-relaxed line-clamp-3">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "faq":
            return (
              <section key={idx} className="max-w-4xl mx-auto px-6 space-y-12">
                {data.heading && (
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-center text-foreground">
                    {data.heading}
                  </h2>
                )}
                <div className="space-y-4">
                  {(data.items || []).map((item: any, qIdx: number) => (
                    <details
                      key={qIdx}
                      className="group glass-panel rounded-2xl border border-border overflow-hidden transition-all duration-300 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-foreground uppercase text-sm tracking-wide select-none">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="text-primary shrink-0" size={18} />
                          <span>{item.question}</span>
                        </div>
                        <span className="text-muted-foreground transition-transform duration-300 group-open:rotate-180">
                          <ArrowRight size={16} className="rotate-90" />
                        </span>
                      </summary>
                      <div className="px-6 pb-6 pt-2 border-t border-border/50 text-muted-foreground text-sm leading-relaxed">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );

          case "testimonials":
            const mappedTestimonials = (data.items || []).map((item: any) => ({
              authorName: item.name || item.authorName,
              role: item.role,
              content: item.review || item.content,
              rating: item.stars || item.rating || 5,
              avatarImage: item.avatar || item.avatarImage,
            }));
            return (
              <section key={idx} className="max-w-360 mx-auto px-6 py-8">
                {data.heading && (
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-center text-foreground mb-6">
                    {data.heading}
                  </h2>
                )}
                <TestimonialSlider testimonials={mappedTestimonials} />
              </section>
            );

          case "cta-banner":
            return (
              <section key={idx} className="max-w-360 mx-auto px-6">
                <div className="relative rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center text-center p-12 md:p-24 shadow-2xl border border-border min-h-100">
                  {data.background ? (
                    <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${data.background})` }} />
                  ) : (
                    <div className="absolute inset-0 bg-primary/10 z-0" />
                  )}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10" />

                  <div className="relative z-20 max-w-3xl">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 text-white leading-tight">
                      {data.heading}
                    </h2>
                    <p className="text-xl text-white/80 font-medium mb-10">
                      {data.subheading}
                    </p>
                    {data.buttonText && data.buttonUrl && (
                      <SmartLink href={data.buttonUrl} className="inline-block px-10 py-5 font-bold text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all hover:scale-105 uppercase tracking-widest text-sm shadow-xl shadow-primary/20">
                        {data.buttonText}
                      </SmartLink>
                    )}
                  </div>
                </div>
              </section>
            );

          case "video-banner":
            return (
              <section key={idx} className="w-full px-6 max-w-360 mx-auto">
                <div className="relative rounded-[2.5rem] overflow-hidden border border-border bg-black aspect-video flex items-center justify-center group shadow-2xl">
                  <UniversalVideoEmbed
                    url={data.videoUrl}
                    title={data.heading || "Video Banner"}
                    className="absolute inset-0 w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/80 via-transparent to-transparent z-10" />
                  {data.heading && (
                    <h2 className="relative z-20 text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mt-auto mb-12 text-center w-full drop-shadow-lg">
                      {data.heading}
                    </h2>
                  )}
                </div>
              </section>
            );

          case "newsletter":
            return (
              <section key={idx} className="max-w-4xl mx-auto px-6 py-12">
                <div className="glass-card rounded-[2.5rem] border border-border p-12 text-center shadow-xl relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />

                  <div className="relative z-10">
                    <Mail className="w-12 h-12 text-primary mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground mb-4">
                      {data.heading}
                    </h2>
                    <p className="text-muted-foreground font-medium mb-8 max-w-lg mx-auto">
                      {data.subheading}
                    </p>
                    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                      <input
                        type="email"
                        placeholder="Your email address"
                        className="flex-1 rounded-full px-6 py-4 bg-background border border-border outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                        required
                      />
                      <button type="submit" className="rounded-full px-8 py-4 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shrink-0">
                        Subscribe
                      </button>
                    </form>
                  </div>
                </div>
              </section>
            );

          case "stats":
            return (
              <section key={idx} className="max-w-360 mx-auto px-4 sm:px-6 py-8 md:py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {(data.items || []).map((item: any, sIdx: number) => (
                    <div key={sIdx} className="bg-card p-6 sm:p-8 text-center rounded-2xl sm:rounded-3xl border border-border shadow-xs flex flex-col items-center justify-center hover:border-accent/40 transition-colors">
                      <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-accent font-serif mb-1.5 block">
                        {item.value}
                      </span>
                      <p className="text-muted-foreground uppercase text-[10px] sm:text-xs font-mono font-bold tracking-widest leading-tight">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "team":
            return (
              <section key={idx} className="max-w-360 mx-auto px-6 py-12">
                {data.heading && (
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-center text-foreground mb-12">
                    {data.heading}
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {(data.items || []).map((item: any, tIdx: number) => (
                    <div key={tIdx} className="group text-center">
                      <div className="aspect-square rounded-4xl overflow-hidden mb-6 border border-border bg-muted relative">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            decoding="async"
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <Users className="absolute inset-0 m-auto text-muted-foreground/30 w-16 h-16" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-tight text-foreground">{item.name}</h3>
                      <p className="text-primary text-sm font-medium mt-1">{item.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "gallery":
            return (
              <section key={idx} className="max-w-360 mx-auto px-6 py-12">
                {data.heading && (
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-center text-foreground mb-12">
                    {data.heading}
                  </h2>
                )}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                  {(data.items || []).map((item: any, gIdx: number) => (
                    <div key={gIdx} className="break-inside-avoid rounded-3xl overflow-hidden border border-border group relative bg-muted min-h-50">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.caption || "Gallery item"} 
                          decoding="async"
                          loading="lazy"
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <ImageIcon className="text-muted-foreground/30 w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                    </div>
                  ))}
                </div>
              </section>
            );

          case "split-content":
            return (
              <section key={idx} className="max-w-360 mx-auto px-6 py-12">
                <div className={`flex flex-col ${data.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
                  <div className="w-full lg:w-1/2">
                    <div className="aspect-4/5 rounded-[2.5rem] overflow-hidden border border-border bg-muted shadow-2xl relative">
                      {data.image ? (
                        <img 
                          src={data.image} 
                          alt={data.heading} 
                          decoding="async"
                          loading="lazy"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <ImageIcon className="absolute inset-0 m-auto text-muted-foreground/30 w-16 h-16" />
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground leading-none">
                      {data.heading}
                    </h2>
                    <div className="w-16 h-1 bg-primary rounded-full" />
                    <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                      {data.content}
                    </p>
                  </div>
                </div>
              </section>
            );

          case "featured-products":
            return <FeaturedProductsBlock key={idx} data={data} />;

          case "categories-grid":
            return (
              <section key={idx} className="max-w-360 mx-auto px-6 py-12">
                {data.heading && (
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-center text-foreground mb-12">
                    {data.heading}
                  </h2>
                )}
                <div className="flex flex-wrap justify-center items-center gap-4">
                  {(data.items || []).map((item: any, cIdx: number) => (
                    <SmartLink
                      key={cIdx}
                      href={`/collections/${item.slug}`}
                      className="group relative rounded-3xl overflow-hidden aspect-4/3 bg-muted block border border-border shadow-sm w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.66rem)] lg:w-[calc(25%-0.75rem)] max-w-[340px] shrink-0 grow-0"
                    >
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          decoding="async"
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                      ) : (
                        <ImageIcon className="absolute inset-0 m-auto text-muted-foreground/30 w-16 h-16" />
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent group-hover:from-primary/90 transition-all duration-500" />
                      <div className="absolute bottom-0 left-0 w-full p-4 flex justify-between items-end gap-2">
                        <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white drop-shadow-md truncate min-w-0">
                          {item.name}
                        </h3>
                        <div className="w-8 h-8 shrink-0 rounded-full bg-card text-primary flex items-center justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all shadow-lg">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </SmartLink>
                  ))}
                </div>
              </section>
            );

          case "promo-banner":
            return (
              <section key={idx} className="max-w-360 mx-auto px-6 py-12">
                <SmartLink href={data.url || "/"} className={`block w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-border/50 p-1 relative ${data.background || "bg-primary text-primary-foreground"}`}>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay" />
                  <div className="px-8 py-10 md:py-16 text-center relative z-10 flex flex-col md:flex-row items-center justify-center gap-6">
                    <Tag className="w-12 h-12 opacity-80" />
                    <div>
                      {data.heading && <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-2">{data.heading}</h3>}
                      <p className="text-lg md:text-xl font-medium tracking-wide opacity-90">{data.text}</p>
                    </div>
                  </div>
                </SmartLink>
              </section>
            );

          case "brand-logos":
            return (
              <section key={idx} className="w-full border-y border-border bg-muted/30 py-16 overflow-hidden">
                <div className="max-w-360 mx-auto px-6">
                  {data.heading && (
                    <h4 className="text-center text-sm font-bold uppercase tracking-widest text-muted-foreground mb-10">
                      {data.heading}
                    </h4>
                  )}
                  <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                    {(data.items || []).map((item: any, bIdx: number) => (
                      item.image ? (
                        <img key={bIdx} src={item.image} alt={item.name || "Brand logo"} className="max-h-12 w-auto object-contain hover:scale-110 transition-transform" />
                      ) : null
                    ))}
                  </div>
                </div>
              </section>
            );

          case "image":
            return (
              <section key={idx} className={`w-full ${data.fullWidth ? "" : "max-w-360 mx-auto px-6"} py-12`}>
                <div className={`overflow-hidden ${data.fullWidth ? "" : "rounded-[2.5rem] border border-border shadow-2xl"}`}>
                  {data.aspectRatio && data.aspectRatio !== "auto" ? (
                    <div style={{ aspectRatio: data.aspectRatio, width: "100%" }}>
                      <img
                        src={data.url}
                        alt={data.altText || "Image"}
                        decoding="async"
                        loading="lazy"
                        className="w-full h-full"
                        style={{ objectFit: data.objectFit || "cover", display: "block" }}
                      />
                    </div>
                  ) : (
                    <img
                      src={data.url}
                      alt={data.altText || "Image"}
                      decoding="async"
                      loading="lazy"
                      className="w-full h-auto"
                      style={{ objectFit: data.objectFit || "cover", display: "block" }}
                    />
                  )}
                </div>
              </section>
            );

          case "image-text":
            return (
              <section key={idx} className="max-w-360 mx-auto px-6 py-12">
                <div className={`flex flex-col ${data.imagePosition === "right" ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
                  <div className="w-full lg:w-1/2">
                    <div className="aspect-4/5 rounded-[2.5rem] overflow-hidden border border-border bg-muted shadow-2xl relative">
                      {data.image ? (
                        <img 
                          src={data.image} 
                          alt={data.heading || "Image"} 
                          decoding="async"
                          loading="lazy"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <ImageIcon className="absolute inset-0 m-auto text-muted-foreground/30 w-16 h-16" />
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground leading-none">
                      {data.heading}
                    </h2>
                    <div className="w-16 h-1 bg-primary rounded-full" />
                    <div className="text-lg text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                      {data.content}
                    </div>
                  </div>
                </div>
              </section>
            );

          case "video":
            return (
              <section key={idx} className={`w-full ${data.fullWidth ? "px-0" : "max-w-6xl mx-auto px-4 sm:px-6"} py-8 sm:py-12`}>
                {data.heading && (
                  <h2 className={`text-2xl sm:text-4xl font-black uppercase tracking-tight text-center text-foreground mb-6 sm:mb-8 font-serif ${data.fullWidth ? "px-4 sm:px-6" : ""}`}>
                    {data.heading}
                  </h2>
                )}
                <UniversalVideoEmbed
                  url={data.videoUrl}
                  title={data.heading || "Video"}
                  posterImage={data.posterImage}
                  aspectRatio={data.aspectRatio || "auto"}
                  objectFit={data.objectFit || "contain"}
                  maxHeight={data.maxHeight || "75vh"}
                  autoPlay={data.autoPlay || false}
                  showPlayButton={data.showPlayButton !== false}
                />
              </section>
            );

          case "video-text":
            return (
              <section key={idx} className="max-w-360 mx-auto px-6 py-12">
                <div className={`flex flex-col ${data.videoPosition === "right" ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
                  <div className="w-full lg:w-1/2">
                    <div className="aspect-4/3 rounded-[2.5rem] overflow-hidden border border-border bg-black shadow-2xl relative">
                      <UniversalVideoEmbed
                        url={data.videoUrl}
                        title={data.heading || "Video"}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground leading-none">
                      {data.heading}
                    </h2>
                    <div className="w-16 h-1 bg-primary rounded-full" />
                    <div className="text-lg text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                      {data.content}
                    </div>
                  </div>
                </div>
              </section>
            );

          case "rich-text":
            return (
              <section key={idx} className="py-16 bg-background">
                <div className={`max-w-4xl mx-auto px-6 text-${data.alignment || 'center'}`}>
                  {data.heading && (
                    <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 uppercase tracking-tighter">
                      {data.heading}
                    </h2>
                  )}
                  {data.body && (
                    <p className="text-muted-foreground text-lg whitespace-pre-wrap">
                      {data.body}
                    </p>
                  )}
                </div>
              </section>
            );

          case "pharmacy-catalog":
            return <PharmacyCatalogBlock key={idx} data={data} />;

          case "contact-form":
          case "contact":
            return (
              <section key={idx} className="py-8 sm:py-12 bg-background">
                <ContactFormClient
                  storeSettings={settings}
                  heading={data.heading}
                  subheading={data.subheading}
                  customEmail={data.email}
                  customPhone={data.phone}
                  customAddress={data.address}
                  showDirectChannels={data.showDirectChannels !== false}
                />
              </section>
            );

          default:
            return null;
        }

      })}
    </div>
  );
}

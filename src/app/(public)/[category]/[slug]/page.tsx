import { buildMetadata } from "@/lib/seo/build-metadata";
import { generateProductJsonLd } from "@/lib/seo/json-ld";
import { notFound } from "next/navigation";
import ProductVariantsForm from "@/components/storefront/ProductVariantsForm";
import ProductReviews from "@/components/storefront/ProductReviews";
import CelebrityReviewsReel from "@/components/storefront/CelebrityReviewsReel";
import { getReviewsByProductId } from "@/server/repositories/reviewRepository";
import { getProductBySlug, getRelatedProducts } from "@/server/repositories/productRepository";
import { getSiteSettings } from "@/server/repositories/siteSettingsRepository";
import { getCelebrityReviews } from "@/server/repositories/celebrityReviewRepository";
import { getActiveCertificatesAction } from "@/server/actions/certificateActions";
import Link from "next/link";
import { ChevronRight, Shield, Truck, RotateCcw, Award, Zap, Star } from "lucide-react";
import BlockRenderer from "@/components/storefront/BlockRenderer";
import ProductDetailsAccordion from "@/components/storefront/ProductDetailsAccordion";
import ProductGallery from "@/components/storefront/ProductGallery";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import RecentlyViewedTracker from "@/components/storefront/RecentlyViewedTracker";
import RecentlyViewedCarousel from "@/components/storefront/RecentlyViewedCarousel";
import ProductCard from "@/components/storefront/ProductCard";
import CertificatesWall from "@/components/storefront/CertificatesWall";
import MetaViewContentTracker from "@/components/analytics/MetaViewContentTracker";
import { auth } from "@/server/auth/config";
import { cleanEmbedCode } from "@/lib/embedUtils";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) return {};

  const seoTitle = product.seo?.metaTitle || product.name;
  const seoDescription = product.seo?.metaDescription || product.shortDescription || product.description || product.name;
  const seoImage = product.images && product.images.length > 0
    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
    : undefined;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const path = `/${(product.categories?.[0] as any)?.slug || "uncategorized"}/${product.slug}`;

  const baseMetadata = await buildMetadata({
    title: seoTitle,
    description: seoDescription,
    image: seoImage,
    path
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      title: product.seo?.ogTitle || seoTitle,
      description: product.seo?.ogDescription || seoDescription,
      url: `${baseUrl}${path}`,
      type: (product.seo?.ogType === 'product' ? 'website' : (product.seo?.ogType || 'website')) as any,
      images: product.seo?.ogImage ? [product.seo.ogImage] : (seoImage ? [seoImage] : []),
    },
    twitter: {
      ...baseMetadata.twitter,
      card: 'summary_large_image',
      title: product.seo?.ogTitle || seoTitle,
      description: product.seo?.ogDescription || seoDescription,
      images: product.seo?.ogImage ? [product.seo.ogImage] : (seoImage ? [seoImage] : []),
    },
    alternates: {
      canonical: product.seo?.canonicalUrl || `${baseUrl}${path}`,
    },
    robots: {
      index: !product.seo?.noIndex,
      follow: !product.seo?.noFollow,
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ category: string, slug: string }> }) {
  const resolvedParams = await params;
  const productRaw = await getProductBySlug(resolvedParams.slug);
  const product = productRaw ? JSON.parse(JSON.stringify(productRaw)) : null;

  if (!product || product.status !== "active") {
    notFound();
  }

  const session = await auth();
  const isLoggedIn = !!session?.user;

  const reviews = await getReviewsByProductId(String(product._id));
  const [
    settings,
    celebrityReviewsRaw,
    certificatesRes
  ] = await Promise.all([
    getSiteSettings(),
    getCelebrityReviews({ isActive: true, productId: product._id }),
    getActiveCertificatesAction()
  ]);

  const celebrityReviews = JSON.parse(JSON.stringify(celebrityReviewsRaw));
  const productJsonLd = generateProductJsonLd(product);
  const certificates = certificatesRes.success && certificatesRes.certificates ? certificatesRes.certificates : [];

  const relatedConfig = settings?.relatedProductsSection || {
    enabled: true,
    heading: "Related Products",
    subheading: "You might also like",
    limit: 4
  };
  const isRelatedEnabled = relatedConfig.enabled ?? true;
  const isRelatedHidden = settings?.storefrontLayout?.hiddenSections?.includes("product-related-products");
  const relatedLimit = Number(relatedConfig.limit) || 4;

  const relatedProductsRaw = (isRelatedEnabled && !isRelatedHidden)
    ? await getRelatedProducts(product, relatedLimit)
    : [];
  const relatedProducts = JSON.parse(JSON.stringify(relatedProductsRaw));

  const layout = settings?.storefrontLayout?.productPageLayout || "standard";

  // Calculate dynamic rating
  const approvedReviews = reviews ? reviews.filter((r: any) => r.status === 'approved') : [];
  const dynamicReviewCount = approvedReviews.length;
  const dynamicAverageRating = dynamicReviewCount > 0
    ? approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / dynamicReviewCount
    : 0;

  const { backgroundColor, textColor } = product.themeConfig || {};

  const customContainerStyle = backgroundColor ? { backgroundColor } : {};
  const customTextStyle = textColor ? { color: textColor } : {};

  let containerClass = `relative min-h-screen pt-24 pb-32 overflow-hidden bg-background transition-colors duration-500`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {/* Meta Pixel ViewContent Event Tracking */}
      <MetaViewContentTracker
        productId={String(product._id)}
        name={product.name}
        price={product.price || 0}
        currency={settings?.currency || "AED"}
        category={resolvedParams.category}
      />
      {/* Main Product Hero & Detail Section */}
      <div
        className={`relative z-10 min-h-screen pt-4 md:pt-6 pb-20 bg-background transition-colors duration-500`}
        style={customContainerStyle}
      >
        <div className="relative z-10 max-w-360 mx-auto px-6">

          {/* Breadcrumbs */}
          <div className={`mb-12 ${!textColor ? "text-muted-foreground" : ""}`} style={textColor ? { color: textColor, opacity: 0.7 } : {}}>
            <Breadcrumbs
              items={[
                { label: resolvedParams.category.replace("-", " "), href: `/${resolvedParams.category}` },
                { label: product.name }
              ]}
            />
          </div>

          {/* Clean 2-Column Product Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left Column: Product Image Gallery (Square Ratio) */}
            <div data-customizer-block="true" data-block-id="product-gallery" data-block-type="Product Gallery" className="lg:col-span-6 z-0 w-full max-w-xl mx-auto lg:mx-0">
              <ProductGallery
                images={product.images || []}
                productName={product.name}
                layout="standard"
                inventory={product.inventory}
              />
            </div>

            {/* Right Column: Product Details Sidebar */}
            <div className="lg:col-span-6 lg:sticky lg:top-28 flex flex-col gap-6 w-full">

              <div data-customizer-block="true" data-block-id="product-header" data-block-type="Product Header">
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 border border-accent text-accent font-mono text-[10px] uppercase tracking-[0.2em]">
                    Premium Quality
                  </div>
                  {product.inventory > 0 && product.inventory <= 10 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 border border-foreground text-foreground font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">
                      Only {product.inventory} Left
                    </div>
                  )}
                </div>

                {/* Ratings commented out for now per request */}
                {/* <a href="#product-customer-reviews" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity cursor-pointer">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < Math.floor(dynamicReviewCount > 0 ? dynamicAverageRating : (product.averageRating || 0)) ? "fill-current" : "text-muted-foreground/30"} 
                      />
                    ))}
                  </div>
                  <span className={`text-sm font-semibold ${!textColor ? 'text-muted-foreground' : ''}`} style={customTextStyle}>
                    {(dynamicReviewCount > 0 ? dynamicAverageRating : (product.averageRating || 0)).toFixed(1)} 
                    <span className="font-normal opacity-70"> ({dynamicReviewCount > 0 ? dynamicReviewCount : (product.reviewCount || 0)} reviews)</span>
                  </span>
                </a> */}
                <h1
                  className={`${layout === "split" ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl"} font-price font-bold tracking-tight mb-4 ${!textColor ? 'text-foreground' : ''}`}
                  style={customTextStyle}
                >
                  {product.name}
                </h1>

                {product.shortDescription && (
                  <p
                    className={`text-lg mb-8 leading-relaxed ${!textColor ? 'text-muted-foreground' : ''}`}
                    style={textColor ? { color: textColor, opacity: 0.8 } : {}}
                  >
                    {product.shortDescription}
                  </p>
                )}
              </div>

              <div data-customizer-block="true" data-block-id="product-variants-form" data-block-type="Product Form">
                <ProductVariantsForm product={JSON.parse(JSON.stringify(product))} />
              </div>

              <div data-customizer-block="true" data-block-id="product-accordion" data-block-type="Product Accordion">
                <ProductDetailsAccordion
                  description={product.description}
                  nativeDescription={product.nativeDescription}
                  descriptionTabs={product.descriptionTabs}
                  textColor={textColor}
                />
              </div>

              {/* Value Props */}
              <div data-customizer-block="true" data-block-id="product-value-props" data-block-type="Value Props" className="grid grid-cols-1 gap-0 pt-4 mt-2 border-t border-border">
                <div className={`flex items-center gap-3.5 py-3 border-b border-border text-xs sm:text-[13px] font-sans font-medium uppercase tracking-[0.12em] ${!textColor ? 'text-foreground/80' : ''}`} style={customTextStyle}>
                  <Truck size={17} className="text-accent shrink-0" strokeWidth={1.5} />
                  Free Worldwide Shipping
                </div>
                <div className={`flex items-center gap-3.5 py-3 border-b border-border text-xs sm:text-[13px] font-sans font-medium uppercase tracking-[0.12em] ${!textColor ? 'text-foreground/80' : ''}`} style={customTextStyle}>
                  <RotateCcw size={17} className="text-accent shrink-0" strokeWidth={1.5} />
                  15-Day Returns
                </div>
                <div className={`flex items-center gap-3.5 py-3 border-b border-border text-xs sm:text-[13px] font-sans font-medium uppercase tracking-[0.12em] ${!textColor ? 'text-foreground/80' : ''}`} style={customTextStyle}>
                  <Shield size={17} className="text-accent shrink-0" strokeWidth={1.5} />
                  Lifetime Warranty
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Lower Page Sections Wrapper (relative z-20 bg-background to cleanly cover top section on scroll) */}
      <div className="relative z-20 bg-background">
        {/* Celebrity Video Reviews Section */}
        {celebrityReviews && celebrityReviews.length > 0 && (
          <div data-customizer-block="true" data-block-id="product-celebrity-reviews" data-block-type="Product Celebrity Videos" className="border-t border-border py-32 bg-background">
            <div className="max-w-360 mx-auto px-6">
              <CelebrityReviewsReel videos={celebrityReviews} />
            </div>
          </div>
        )}
        {/* Reviews Section */}
        <div id="product-customer-reviews" data-customizer-block="true" data-block-id="product-customer-reviews" data-block-type="Product Reviews">
          <ProductReviews
            productId={String(product._id)}
            initialReviews={JSON.parse(JSON.stringify(reviews))}
            isLoggedIn={isLoggedIn}
            userEmail={session?.user?.email || ""}
            userName={session?.user?.name || ""}
          />
        </div>

        {/* Iframe Embeds Slider */}
        {product.iframeEmbeds && product.iframeEmbeds.length > 0 && (
          <div data-customizer-block="true" data-block-id="product-iframes" data-block-type="Product Iframes" className="py-24 bg-background">
            <div className="max-w-360 mx-auto px-6">
              <h2 className={`text-2xl lg:text-4xl font-serif tracking-tight mb-12 text-center ${!textColor ? 'text-foreground' : ''}`} style={customTextStyle}>
                Celebrities Review
              </h2>
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar items-center">
                {product.iframeEmbeds.map((embedCode: string, index: number) => {
                  return (
                    <div key={index} className="w-[85vw] md:w-[60vw] lg:w-[45vw] shrink-0 min-h-75 relative rounded-2xl overflow-hidden bg-muted group">
                      <div dangerouslySetInnerHTML={{ __html: cleanEmbedCode(embedCode) }} className="[&>iframe]:max-w-full [&>blockquote]:m-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content Blocks */}
        <BlockRenderer blocks={product.blocks || []} />

        {/* Related Products */}
        {isRelatedEnabled && !isRelatedHidden && relatedProducts && relatedProducts.length > 0 && (
          <div data-customizer-block="true" data-block-id="product-related-products" data-block-type="Related Products" className="py-24 bg-background border-t border-border/40">
            <div className="max-w-360 mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className={`text-2xl lg:text-4xl font-serif tracking-tight ${!textColor ? 'text-foreground' : ''}`} style={customTextStyle}>
                  {relatedConfig.heading || "Related Products"}
                </h2>
                {relatedConfig.subheading && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
                    {relatedConfig.subheading}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {relatedProducts.map((rp: any) => (
                  <ProductCard key={rp._id} product={rp} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Certificates Wall */}
        <CertificatesWall
          certificates={certificates}
          textColor={textColor}
          customTextStyle={customTextStyle}
        />

        {/* Product FAQs */}
        {product.faqs && product.faqs.length > 0 && (
          <div data-customizer-block="true" data-block-id="product-faqs" data-block-type="Product FAQs" className="py-24 bg-background border-t border-border">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className={`text-2xl lg:text-4xl font-serif tracking-tight mb-12 text-center ${!textColor ? 'text-foreground' : ''}`} style={customTextStyle}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {product.faqs.map((faq: any, i: number) => (
                  <details key={i} name="faq-accordion" open={i === 0} className="group border border-border rounded-[20px] bg-muted/10 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg text-foreground hover:bg-muted/20 transition-colors">
                      {faq.question}
                      <span className="transition duration-300 group-open:-rotate-180">
                        <svg fill="none" height="24" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}

        <RecentlyViewedTracker product={JSON.parse(JSON.stringify(product))} />
        <RecentlyViewedCarousel currentProductId={String(product._id)} />
      </div>
    </>
  );
}

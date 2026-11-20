import { Metadata } from "next";
import { getPaginatedProducts } from "@/server/repositories/productRepository";
import { getCategoryBySlug, getCategories } from "@/server/repositories/categoryRepository";
import { getSiteSettings } from "@/server/repositories/siteSettingsRepository";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/storefront/ProductCard";
import FilterSidebar from "@/components/storefront/FilterSidebar";
import { Pagination } from "@/components/ui/Pagination";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BlockRenderer from "@/components/storefront/BlockRenderer";

import { getPageBySlug } from "@/server/repositories/pageRepository";
import Category from "@/server/db/models/Category";
import connectToDatabase from "@/server/db/mongoose";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const [resolvedParams, settings] = await Promise.all([
    params,
    getCachedSiteSettings()
  ]);

  const category = await getCategoryBySlug(resolvedParams.category);
  if (!category) {
    const raw = resolvedParams.category?.toLowerCase()?.trim();
    const cmsPage = await getPageBySlug(raw);
    if (cmsPage) {
      return {
        title: cmsPage.seo?.metaTitle || cmsPage.title,
        description: cmsPage.seo?.metaDescription || `Read ${cmsPage.title}.`
      };
    }
    return {};
  }

  const storeName = settings?.name || "Yadgari Perfumes";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const metaTitle = category.metaTitle || `${category.name} | Luxury Extrait de Parfum | ${storeName}`;
  const metaDescription = category.metaDescription || `Explore handcrafted ${category.name} fragrances from ${storeName}. Formulated with 30-35% pure extrait oil concentration.`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: [
      category.name,
      `${category.name} perfumes`,
      "luxury perfume",
      "extrait de parfum",
      storeName
    ],
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${baseUrl}/${category.slug}`,
      siteName: storeName,
      images: category.bannerImage
        ? [{ url: category.bannerImage, alt: category.name }]
        : undefined,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: category.bannerImage ? [category.bannerImage] : undefined
    },
    alternates: {
      canonical: `${baseUrl}/${category.slug}`
    }
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Canonicalize category routing: strip any redundant or conflicting ?category= param on dedicated /[category] pages
  if (resolvedSearchParams.category) {
    const qp = new URLSearchParams();
    if (resolvedSearchParams.sort) qp.set("sort", resolvedSearchParams.sort);
    if (resolvedSearchParams.minPrice) qp.set("minPrice", resolvedSearchParams.minPrice);
    if (resolvedSearchParams.maxPrice) qp.set("maxPrice", resolvedSearchParams.maxPrice);
    if (resolvedSearchParams.q) qp.set("q", resolvedSearchParams.q);
    if (resolvedSearchParams.page) qp.set("page", resolvedSearchParams.page);
    const qs = qp.toString() ? `?${qp.toString()}` : "";

    if (resolvedSearchParams.category === "all") {
      redirect(`/all${qs}`);
    } else {
      redirect(`/${resolvedSearchParams.category}${qs}`);
    }
  }

  const category = await getCategoryBySlug(resolvedParams.category);

  if (!category) {
    const raw = resolvedParams.category?.toLowerCase()?.trim();
    if (raw === "about" || raw === "about-us" || raw === "about-brand" || raw === "story" || raw === "our-story") {
      redirect("/about");
    }
    if (raw === "contact" || raw === "contact-us" || raw === "help" || raw === "support") {
      redirect("/contact");
    }
    if (raw === "faq" || raw === "faqs" || raw === "help-center" || raw === "questions") {
      redirect("/faq");
    }
    if (raw === "all" || raw === "products" || raw === "catalog") {
      redirect("/all");
    }
    if (raw === "collections" || raw === "categories") {
      redirect("/collections");
    }
    if (raw === "track-order" || raw === "track") {
      redirect("/track-order");
    }
    if (raw === "wishlist") {
      redirect("/wishlist");
    }
    // Check if it's a standard policy or CMS slug
    const standardCmsSlugs = [
      "shipping-and-delivery", "shipping-policy", "shipping", "delivery",
      "terms-of-service", "terms", "terms-and-conditions", "tos",
      "privacy-policy", "privacy", "privacy-statement",
      "return-refund-policy", "refund-policy", "returns", "refunds", "return-policy",
      "certificates-and-awards", "certificates", "awards", "accreditations",
      "testimonials", "reviews", "client-reviews"
    ];
    if (standardCmsSlugs.includes(raw)) {
      redirect(`/pages/${raw}`);
    }

    const cmsPage = await getPageBySlug(raw);
    if (cmsPage) {
      redirect(`/pages/${cmsPage.slug}`);
    }

    notFound();
  }

  const sortParam = resolvedSearchParams.sort;
  const minPrice = resolvedSearchParams.minPrice;
  const maxPrice = resolvedSearchParams.maxPrice;
  const query = resolvedSearchParams.q;
  const page = parseInt(resolvedSearchParams.page || "1", 10);

  await connectToDatabase();
  const subCatsDocs = await Category.find({ parent: category._id }).select("_id").lean();
  const catIds = [category._id, ...subCatsDocs.map((sc: any) => sc._id)];
  const filter: any = { categories: { $in: catIds }, status: "active" };

  if (query) {
    filter.name = { $regex: query, $options: "i" };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption: any = { sortOrder: 1, createdAt: -1 };
  if (sortParam === "price_asc") sortOption = { price: 1 };
  if (sortParam === "price_desc") sortOption = { price: -1 };
  if (sortParam === "newest") sortOption = { createdAt: -1 };

  const productsResult = await getPaginatedProducts(filter, { sort: sortOption, limit: 12, page });
  const products = JSON.parse(JSON.stringify(productsResult.items));
  const totalPages = productsResult.totalPages;

  const categoriesRaw = await getCategories();
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  const subCategories = categories.filter((c: any) => c.parent && String(c.parent) === String(category._id));

  if (subCategories.length === 1) {
    redirect(`/${subCategories[0].slug}`);
  }

  const settings = await getSiteSettings();

  const cols = settings?.storefrontLayout?.productGridColumns || "4";
  const gridClass =
    cols === "2" ? "grid-cols-2 lg:grid-cols-2" :
      cols === "3" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" :
        "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"; // adjusted for sidebar

  const cardStyle = settings?.storefrontLayout?.productCardStyle || "standard";

  const { backgroundColor, textColor } = category.themeConfig || {};

  const customContainerStyle = backgroundColor ? { backgroundColor } : {};
  const customTextStyle = textColor ? { color: textColor } : {};

  let containerClass = `flex flex-col min-h-screen pt-0 overflow-hidden relative bg-background transition-colors duration-500`;

  return (
    <div className={containerClass} style={customContainerStyle}>
      {/* Flagship Dynamic Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      {/* Editorial Category Media Hero Header */}
      <section data-customizer-block="true" data-block-id="category-header" data-block-type="Category Header" className="relative w-full overflow-hidden z-10 mb-6">
        <div className="relative w-full h-[40vh] sm:h-[45vh] md:h-[50vh] min-h-85 max-h-130 flex items-center justify-center text-center bg-foreground">

          {/* Background Video / Image Layer */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {category.bannerVideo ? (
              <video
                src={category.bannerVideo}
                autoPlay
                loop
                muted
                playsInline
                poster={category.bannerImage}
                className="w-full h-full object-cover opacity-80 scale-105"
              />
            ) : category.bannerImage ? (
              <img
                src={category.bannerImage}
                alt={category.name}
                decoding="async"
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-[#141210] via-[#1c1917] to-[#262320]" />
            )}

            {/* High-Contrast Gradient Backdrop for Perfect Text Legibility */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/55 to-black/35 z-10" />
          </div>

          {/* Centered Editorial Content */}
          <div className="relative z-20 max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
            <div className="mb-6 opacity-100 text-white">
              <Breadcrumbs items={[{ label: category.name }]} light={true} />
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black uppercase tracking-[0.12em] text-white drop-shadow-md mb-4"
              style={customTextStyle}
            >
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-sans font-medium text-white/90 max-w-2xl leading-relaxed drop-shadow-sm">
              {category.metaDescription || `Explore our curated selection of ${category.name.toLowerCase()} designed for maximum performance and unparalleled aesthetics.`}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area (Sidebar + Grid) */}
      <section data-customizer-block="true" data-block-id="category-product-grid" data-block-type="Product Grid" className="relative z-10 pb-24 px-6 max-w-360 mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-12 items-start">

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <FilterSidebar categories={categories} currentCategorySlug={category.slug} />
          </aside>

          {/* Product Grid or Subcategories */}
          <main className="flex-1 w-full">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {subCategories.length > 1 ? `Showing ${subCategories.length} Subcategories` : `Showing ${products.length} Products`}
              </p>
            </div>

            {subCategories.length > 1 ? (
              <div className={`grid gap-8 ${gridClass} justify-center md:justify-start`}>
                {subCategories.map((sub: any) => (
                  <div key={String(sub._id)} className="w-full flex max-w-55 mx-auto md:mx-0">
                    <Link href={`/${sub.slug}`} className="group relative flex flex-col w-full bg-background transition-colors hover:bg-muted/30">
                      <div className="relative aspect-4/5 overflow-hidden bg-background">
                        {sub.bannerImage || sub.ogImage ? (
                          <Image 
                            src={sub.bannerImage || sub.ogImage} 
                            alt={sub.name} 
                            fill 
                            unoptimized={true}
                            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" 
                            className="object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-xs uppercase tracking-widest bg-muted/20">
                            {sub.name}
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col gap-2 grow justify-between">
                        <div className="flex flex-col gap-1 items-center text-center mt-2">
                          <h3 className="font-serif text-3xl font-black text-foreground line-clamp-1 truncate group-hover:text-accent transition-colors">
                            {sub.name}
                          </h3>
                        </div>
                        <div className="flex justify-center mt-4 pt-4 border-t border-border/30">
                          <span className="inline-flex items-center gap-2 text-foreground font-sans font-black text-sm uppercase tracking-[0.15em] relative w-fit after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-0.5 after:bg-foreground after:origin-bottom-right after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100">
                            View Category &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 rounded-3xl glass-card border border-border">
                <p className="text-xl text-muted-foreground font-medium uppercase tracking-wider mb-6">No pieces available in this category yet.</p>
                <Link
                  href="/all"
                  className="inline-flex items-center justify-center px-8 py-3 bg-foreground text-background font-bold uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-start">
                {products.map((product: any) => (
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

            {subCategories.length <= 1 && (
              <Pagination totalPages={totalPages} currentPage={page} />
            )}
          </main>
        </div>
      </section>

      {/* Dynamic Content Blocks */}
      <div className="relative z-10">
        <BlockRenderer blocks={category.blocks || []} />
      </div>
    </div>
  );
}

import { Metadata } from "next";
import { getPaginatedProducts } from "@/server/repositories/productRepository";
import { getCategories, getCategoryBySlug } from "@/server/repositories/categoryRepository";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import Category from "@/server/db/models/Category";
import connectToDatabase from "@/server/db/mongoose";
import UnifiedCatalogView from "@/components/storefront/UnifiedCatalogView";

export const revalidate = 0; // Dynamic real-time fetch

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}): Promise<Metadata> {
  const [resolvedSearchParams, settings] = await Promise.all([
    searchParams,
    getCachedSiteSettings()
  ]);

  const storeName = settings?.name || "Yadgari Perfumes";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const categorySlug = resolvedSearchParams.category;
  const query = resolvedSearchParams.q;

  let title = `All Fragrances & Collections | ${storeName}`;
  let description = `Explore the full catalog of handcrafted Extrait de Parfum, luxury perfume extracts, and signature scents by ${storeName}.`;

  if (categorySlug) {
    const cat = await getCategoryBySlug(categorySlug);
    if (cat) {
      title = `${cat.name} Collection | Luxury Perfumes | ${storeName}`;
      description = cat.metaDescription || `Browse our exclusive collection of ${cat.name} fragrances.`;
    }
  } else if (query) {
    title = `Search results for "${query}" | ${storeName}`;
  }

  return {
    title,
    description,
    keywords: [
      "All perfumes",
      "Extrait de Parfum catalog",
      "Luxury fragrance collection",
      "Buy perfume online",
      "Niche perfume shop"
    ],
    openGraph: {
      title,
      description,
      url: `${baseUrl}/all`,
      siteName: storeName,
      type: "website"
    },
    twitter: {
      card: "summary",
      title,
      description
    },
    alternates: {
      canonical: `${baseUrl}/all`
    }
  };
}

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; minPrice?: string; maxPrice?: string; q?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const categorySlug = resolvedSearchParams.category;
  const sortParam = resolvedSearchParams.sort;
  const minPrice = resolvedSearchParams.minPrice;
  const maxPrice = resolvedSearchParams.maxPrice;
  const query = resolvedSearchParams.q;
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const limit = 12;

  const filter: any = { status: "active" };

  if (query && query.trim() !== "") {
    const regex = new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.name = { $regex: regex };
  }

  let activeCategoryDoc = null;
  if (categorySlug && categorySlug.trim() !== "") {
    activeCategoryDoc = await getCategoryBySlug(categorySlug.trim());
    if (activeCategoryDoc) {
      await connectToDatabase();
      const subCats = await Category.find({ parent: activeCategoryDoc._id }).select("_id").lean();
      const catIds = [activeCategoryDoc._id, ...subCats.map(sc => sc._id)];
      filter.categories = { $in: catIds };
    }
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice && !isNaN(Number(minPrice))) filter.price.$gte = Number(minPrice);
    if (maxPrice && !isNaN(Number(maxPrice))) filter.price.$lte = Number(maxPrice);
  }

  let sortOption: any = { sortOrder: 1, createdAt: -1 };
  if (sortParam === "price_asc") sortOption = { price: 1 };
  if (sortParam === "price_desc") sortOption = { price: -1 };
  if (sortParam === "newest") sortOption = { createdAt: -1 };
  if (sortParam === "rating") sortOption = { averageRating: -1 };

  const productsResult = await getPaginatedProducts(filter, { sort: sortOption, limit, page });
  const products = JSON.parse(JSON.stringify(productsResult.items));
  const categoriesRaw = await getCategories();
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  const pageTitle = activeCategoryDoc ? activeCategoryDoc.name : "All Products";
  const pageSubheading = activeCategoryDoc
    ? (activeCategoryDoc.metaDescription || `Explore our exclusive selection of ${activeCategoryDoc.name}.`)
    : "Explore our complete collection of luxury fragrances and products.";

  return (
    <UnifiedCatalogView
      initialProducts={products}
      categories={categories}
      totalCount={productsResult.totalCount}
      totalPages={productsResult.totalPages}
      currentPage={page}
      title={pageTitle}
      subheading={pageSubheading}
      selectedCategorySlug={categorySlug}
      searchQuery={query}
    />
  );
}

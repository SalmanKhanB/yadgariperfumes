import { getPaginatedProducts } from "@/server/repositories/productRepository";
import { getCategories, getCategoryBySlug } from "@/server/repositories/categoryRepository";
import Category from "@/server/db/models/Category";
import connectToDatabase from "@/server/db/mongoose";
import UnifiedCatalogView from "@/components/storefront/UnifiedCatalogView";
import MetaSearchTracker from "@/components/analytics/MetaSearchTracker";

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : (typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : "");
  const categorySlug = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : "";
  const sortParam = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "";
  const minPrice = typeof resolvedSearchParams.minPrice === "string" ? resolvedSearchParams.minPrice : "";
  const maxPrice = typeof resolvedSearchParams.maxPrice === "string" ? resolvedSearchParams.maxPrice : "";
  const page = parseInt(typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : "1", 10);
  const limit = 12;

  const filter: any = { status: "active" };

  if (query.trim()) {
    const regex = new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.name = { $regex: regex };
  }

  let activeCategoryDoc = null;
  if (categorySlug.trim()) {
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

  return (
    <>
      {query && <MetaSearchTracker query={query} />}
      <UnifiedCatalogView
      initialProducts={products}
      categories={categories}
      totalCount={productsResult.totalCount}
      totalPages={productsResult.totalPages}
      currentPage={page}
      title={query ? `Search Results for "${query}"` : "Search & Catalog"}
      subheading={query ? `Found ${productsResult.totalCount} matching products.` : "Search across our entire catalog by keywords, category, price, or tags."}
      selectedCategorySlug={categorySlug}
      searchQuery={query}
    />
    </>
  );
}

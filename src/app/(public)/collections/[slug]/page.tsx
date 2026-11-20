import { getPaginatedProducts } from "@/server/repositories/productRepository";
import { getCategories, getCategoryBySlug } from "@/server/repositories/categoryRepository";
import UnifiedCatalogView from "@/components/storefront/UnifiedCatalogView";

export const revalidate = 0;

export default async function CollectionSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.slug === "all" ? "" : resolvedParams.slug;
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const sortParam = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "";
  const minPrice = typeof resolvedSearchParams.minPrice === "string" ? resolvedSearchParams.minPrice : "";
  const maxPrice = typeof resolvedSearchParams.maxPrice === "string" ? resolvedSearchParams.maxPrice : "";
  const page = parseInt(typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : "1", 10);
  const limit = 12;

  const filter: any = { status: "active" };

  if (query.trim()) {
    const regex = new RegExp(query.trim(), "i");
    filter.name = { $regex: regex };
  }

  let activeCategoryDoc = null;
  if (categorySlug.trim()) {
    activeCategoryDoc = await getCategoryBySlug(categorySlug.trim());
    if (activeCategoryDoc) {
      filter.category = activeCategoryDoc._id;
    }
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

  const productsResult = await getPaginatedProducts(filter, { sort: sortOption, limit, page });
  const products = JSON.parse(JSON.stringify(productsResult.items));
  const categoriesRaw = await getCategories();
  const categories = JSON.parse(JSON.stringify(categoriesRaw));

  const pageTitle = activeCategoryDoc ? activeCategoryDoc.name : "Collection Catalog";

  return (
    <UnifiedCatalogView
      initialProducts={products}
      categories={categories}
      totalCount={productsResult.totalCount}
      totalPages={productsResult.totalPages}
      currentPage={page}
      title={pageTitle}
      subheading={activeCategoryDoc?.metaDescription || "Explore our collection."}
      selectedCategorySlug={categorySlug}
      searchQuery={query}
    />
  );
}

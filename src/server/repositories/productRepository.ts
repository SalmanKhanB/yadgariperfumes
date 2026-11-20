import connectToDatabase from "../db/mongoose";
import Product, { IProduct } from "../db/models/Product";
import "../db/models/Category";
import { getCachedData, invalidateCache } from "../cache/nodeCache";

const PRODUCT_CACHE_PREFIX = "products_";

export async function getProducts(filter: any = {}, options: { limit?: number; sort?: any } = {}): Promise<IProduct[]> {
  const cacheKey = `${PRODUCT_CACHE_PREFIX}list_${JSON.stringify(filter)}_${JSON.stringify(options)}`;
  return getCachedData(cacheKey, async () => {
    try {
      await connectToDatabase();

      const queryFilter = { ...filter };
      
      // Resolve category query if passed as category or categorySlug string
      const categoryQuery = queryFilter.category || queryFilter.categorySlug;
      if (categoryQuery && typeof categoryQuery === "string") {
        delete queryFilter.category;
        delete queryFilter.categorySlug;

        const Category = (await import("../db/models/Category")).default;
        const catDoc = await Category.findOne({
          $or: [
            { slug: categoryQuery.trim() },
            { slug: new RegExp(`^${categoryQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
            { name: new RegExp(`^${categoryQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }
          ]
        }).select("_id").lean();

        if (catDoc) {
          const subCats = await Category.find({ parent: catDoc._id }).select("_id").lean();
          const catIds = [catDoc._id, ...subCats.map(sc => sc._id)];
          queryFilter.categories = { $in: catIds };
        } else {
          // Fallback: match by string name or category field if legacy
          queryFilter.$or = [
            { category: new RegExp(categoryQuery.trim(), "i") },
            { name: new RegExp(categoryQuery.trim(), "i") }
          ];
        }
      }

      let query = Product.find(queryFilter).populate("categories");
      
      if (options.sort) {
        query = query.sort(options.sort);
      } else {
        query = query.sort({ sortOrder: 1, createdAt: -1 });
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      return await query.lean();
    } catch (error) {
      console.warn("MongoDB connection failed in getProducts. Returning empty array.", error);
      return [];
    }
  }, 1200); // 20 minutes cache
}

export async function getPaginatedProducts(filter: any = {}, options: { limit?: number; page?: number; sort?: any } = {}) {
  await connectToDatabase();
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  let query = Product.find(filter).populate("categories");
  
  if (options.sort) {
    query = query.sort(options.sort);
  } else {
    query = query.sort({ sortOrder: 1, createdAt: -1 });
  }

  const [items, totalCount] = await Promise.all([
    query.skip(skip).limit(limit).lean(),
    Product.countDocuments(filter)
  ]);

  return {
    items: items as IProduct[],
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    page
  };
}

export async function searchProducts(
  query: string,
  options?: { categorySlug?: string; sort?: string; minPrice?: string; maxPrice?: string; limit?: number }
): Promise<IProduct[]> {
  await connectToDatabase();
  const filter: any = { status: "active" };
  
  if (query) {
    const regex = new RegExp(query, 'i');
    filter.name = { $regex: regex };
  }

  if (options?.minPrice || options?.maxPrice) {
    filter.price = {};
    if (options.minPrice) filter.price.$gte = Number(options.minPrice);
    if (options.maxPrice) filter.price.$lte = Number(options.maxPrice);
  }

  let dbQuery = Product.find(filter).populate("categories");
  
  if (options?.sort) {
    if (options.sort === "price_asc") dbQuery = dbQuery.sort({ price: 1 });
    else if (options.sort === "price_desc") dbQuery = dbQuery.sort({ price: -1 });
    else if (options.sort === "newest") dbQuery = dbQuery.sort({ createdAt: -1 });
  } else {
    dbQuery = dbQuery.sort({ sortOrder: 1, createdAt: -1 });
  }

  if (options?.limit) {
    dbQuery = dbQuery.limit(options.limit);
  }
  let results = await dbQuery.lean();

  if (options?.categorySlug) {
    results = results.filter((p: any) => p.categories && p.categories.some((c: any) => c.slug === options.categorySlug));
  }
  
  return results as IProduct[];
}

export async function getProductById(id: string): Promise<IProduct | null> {
  await connectToDatabase();
  return await Product.findById(id).lean();
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  return getCachedData(`${PRODUCT_CACHE_PREFIX}slug_${slug}`, async () => {
    await connectToDatabase();
    return await Product.findOne({ slug }).populate("categories").populate("relatedProducts").lean();
  }, 1200);
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function createProduct(data: Partial<IProduct>): Promise<IProduct> {
  await connectToDatabase();
  if (data.name) {
    data.slug = generateSlug(data.name);
  }
  const newProduct = new Product(data);
  const result = await newProduct.save();
  invalidateCache(PRODUCT_CACHE_PREFIX);
  return result;
}

export async function updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
  await connectToDatabase();
  if (data.name) {
    data.slug = generateSlug(data.name);
  }
  const result = await Product.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
  invalidateCache(PRODUCT_CACHE_PREFIX);
  return result;
}

export async function deleteProduct(id: string): Promise<IProduct | null> {
  await connectToDatabase();
  const result = await Product.findByIdAndDelete(id).lean();
  invalidateCache(PRODUCT_CACHE_PREFIX);
  return result;
}

export async function bulkUpdateProductOrder(orderedIds: string[]): Promise<void> {
  await connectToDatabase();
  
  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { sortOrder: index } }
    }
  }));

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
    invalidateCache(PRODUCT_CACHE_PREFIX);
  }
}

export async function swapTwoProducts(idA: string, idB: string): Promise<void> {
  await connectToDatabase();

  const prodA = await Product.findById(idA).select("sortOrder");
  const prodB = await Product.findById(idB).select("sortOrder");

  if (!prodA || !prodB) return;

  const orderA = prodA.sortOrder ?? 0;
  const orderB = prodB.sortOrder ?? 0;

  if (orderA === orderB) {
    const allProds = await Product.find({}).sort({ sortOrder: 1, createdAt: -1 }).select("_id").lean();
    const ids = allProds.map(p => String(p._id));
    const idxA = ids.indexOf(idA);
    const idxB = ids.indexOf(idB);
    if (idxA !== -1 && idxB !== -1) {
      ids[idxA] = idB;
      ids[idxB] = idA;
      await bulkUpdateProductOrder(ids);
      return;
    }
  }

  prodA.sortOrder = orderB;
  prodB.sortOrder = orderA;
  await prodA.save();
  await prodB.save();

  invalidateCache(PRODUCT_CACHE_PREFIX);
}

export async function getRelatedProducts(product: any, limit = 4): Promise<IProduct[]> {
  try {
    await connectToDatabase();
    const currentId = String(product._id);
    
    // 1. Check manual related products
    let manualProducts: any[] = [];
    if (Array.isArray(product.relatedProducts) && product.relatedProducts.length > 0) {
      const isPopulated = typeof product.relatedProducts[0] === "object" && product.relatedProducts[0] !== null && "name" in product.relatedProducts[0];
      if (isPopulated) {
        manualProducts = product.relatedProducts.filter(
          (p: any) => p && p.status === "active" && String(p._id) !== currentId
        );
      } else {
        const rawManual = await Product.find({
          _id: { $in: product.relatedProducts },
          status: "active"
        }).populate("categories").lean();
        manualProducts = rawManual.filter((p: any) => String(p._id) !== currentId);
      }
    }

    if (manualProducts.length >= limit) {
      return manualProducts.slice(0, limit) as IProduct[];
    }

    const excludeIds = [currentId, ...manualProducts.map((p: any) => String(p._id))];
    const needed = limit - manualProducts.length;

    // 2. Query products from same categories
    const categoryIds = (product.categories || [])
      .map((c: any) => (typeof c === "object" && c?._id ? c._id : c))
      .filter(Boolean);

    let fallbackProducts: any[] = [];
    if (categoryIds.length > 0) {
      fallbackProducts = await Product.find({
        _id: { $nin: excludeIds },
        status: "active",
        categories: { $in: categoryIds }
      })
        .populate("categories")
        .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 })
        .limit(needed)
        .lean();
    }

    // 3. If still needed, query any active products
    if (fallbackProducts.length < needed) {
      const moreExclude = [...excludeIds, ...fallbackProducts.map((p: any) => String(p._id))];
      const generalFallbacks = await Product.find({
        _id: { $nin: moreExclude },
        status: "active"
      })
        .populate("categories")
        .sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 })
        .limit(needed - fallbackProducts.length)
        .lean();
        
      fallbackProducts = [...fallbackProducts, ...generalFallbacks];
    }

    return [...manualProducts, ...fallbackProducts].slice(0, limit) as IProduct[];
  } catch (err) {
    console.error("Error in getRelatedProducts:", err);
    return [];
  }
}



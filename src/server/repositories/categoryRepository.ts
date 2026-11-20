import connectToDatabase from "../db/mongoose";
import Category, { ICategory } from "../db/models/Category";
import { getCachedData, invalidateCache } from "../cache/nodeCache";

const CATEGORY_CACHE_PREFIX = "categories_";

export async function getCategories(): Promise<ICategory[]> {
  return getCachedData(`${CATEGORY_CACHE_PREFIX}all`, async () => {
    try {
      await connectToDatabase();
      return await Category.find({}).lean();
    } catch (error) {
      console.warn("MongoDB connection failed in getCategories. Returning empty array.");
      return [];
    }
  }, 1800);
}

export async function getPaginatedCategories(filter: any = {}, options: { limit?: number; page?: number; sort?: any } = {}) {
  await connectToDatabase();
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  let query = Category.find(filter).populate("parent");
  
  if (options.sort) {
    query = query.sort(options.sort);
  } else {
    query = query.sort({ sortOrder: 1, createdAt: -1 });
  }

  const [items, totalCount] = await Promise.all([
    query.skip(skip).limit(limit).lean(),
    Category.countDocuments(filter)
  ]);

  return {
    items: items as ICategory[],
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    page
  };
}

export async function getCategoryBySlug(slug: string): Promise<ICategory | null> {
  return getCachedData(`${CATEGORY_CACHE_PREFIX}slug_${slug}`, async () => {
    await connectToDatabase();
    return await Category.findOne({ slug }).lean();
  }, 1800);
}

export async function getCategoryById(id: string): Promise<ICategory | null> {
  await connectToDatabase();
  return await Category.findById(id).lean();
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function createCategory(data: Partial<ICategory>): Promise<ICategory> {
  await connectToDatabase();
  if (data.name) {
    data.slug = generateSlug(data.name);
  }
  const newCategory = new Category(data);
  const result = await newCategory.save();
  invalidateCache(CATEGORY_CACHE_PREFIX);
  return result;
}

export async function updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
  await connectToDatabase();
  if (!data.slug && data.name) {
    data.slug = generateSlug(data.name);
  }
  const result = await Category.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
  invalidateCache(CATEGORY_CACHE_PREFIX);
  return result;
}

export async function deleteCategory(id: string): Promise<ICategory | null> {
  await connectToDatabase();
  const result = await Category.findByIdAndDelete(id).lean();
  invalidateCache(CATEGORY_CACHE_PREFIX);
  return result;
}

export async function bulkUpdateCategoryOrder(orderedIds: string[]): Promise<void> {
  await connectToDatabase();
  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { sortOrder: index } }
    }
  }));

  if (bulkOps.length > 0) {
    await Category.bulkWrite(bulkOps);
    invalidateCache(CATEGORY_CACHE_PREFIX);
  }
}

export async function swapTwoCategories(idA: string, idB: string): Promise<void> {
  await connectToDatabase();

  const catA = await Category.findById(idA).select("sortOrder");
  const catB = await Category.findById(idB).select("sortOrder");

  if (!catA || !catB) return;

  const orderA = catA.sortOrder ?? 0;
  const orderB = catB.sortOrder ?? 0;

  if (orderA === orderB) {
    const allCats = await Category.find({}).sort({ sortOrder: 1, createdAt: -1 }).select("_id").lean();
    const ids = allCats.map(c => String(c._id));
    const idxA = ids.indexOf(idA);
    const idxB = ids.indexOf(idB);
    if (idxA !== -1 && idxB !== -1) {
      ids[idxA] = idB;
      ids[idxB] = idA;
      await bulkUpdateCategoryOrder(ids);
      return;
    }
  }

  catA.sortOrder = orderB;
  catB.sortOrder = orderA;
  await catA.save();
  await catB.save();

  invalidateCache(CATEGORY_CACHE_PREFIX);
}


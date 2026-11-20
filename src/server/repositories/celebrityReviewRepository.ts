import connectToDatabase from "../db/mongoose";
import CelebrityReview, { ICelebrityReview } from "../db/models/CelebrityReview";
import { getCachedData, invalidateCache } from "../cache/nodeCache";

const CELEBRITY_REVIEW_CACHE_PREFIX = "celebrity_reviews_";

export async function getCelebrityReviews(filter: any = {}): Promise<ICelebrityReview[]> {
  const cacheKey = `${CELEBRITY_REVIEW_CACHE_PREFIX}${JSON.stringify(filter)}`;
  return getCachedData(cacheKey, async () => {
    try {
      await connectToDatabase();
      return await CelebrityReview.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    } catch (error) {
      console.warn("MongoDB connection failed in getCelebrityReviews. Returning empty array.");
      return [];
    }
  }, 1800);
}

export async function getCelebrityReviewById(id: string): Promise<ICelebrityReview | null> {
  await connectToDatabase();
  return await CelebrityReview.findById(id).lean();
}

export async function createCelebrityReview(data: Partial<ICelebrityReview>): Promise<ICelebrityReview> {
  await connectToDatabase();
  if (data.order === undefined) {
    const highest = await CelebrityReview.findOne().sort("-order");
    data.order = highest && highest.order !== undefined ? highest.order + 1 : 0;
  }
  const newReview = new CelebrityReview(data);
  const result = await newReview.save();
  invalidateCache(CELEBRITY_REVIEW_CACHE_PREFIX);
  return result;
}

export async function updateCelebrityReview(id: string, data: Partial<ICelebrityReview>): Promise<ICelebrityReview | null> {
  await connectToDatabase();
  const result = await CelebrityReview.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
  invalidateCache(CELEBRITY_REVIEW_CACHE_PREFIX);
  return result;
}

export async function deleteCelebrityReview(id: string): Promise<ICelebrityReview | null> {
  await connectToDatabase();
  const result = await CelebrityReview.findByIdAndDelete(id).lean();
  invalidateCache(CELEBRITY_REVIEW_CACHE_PREFIX);
  return result;
}


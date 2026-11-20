import connectToDatabase from "../db/mongoose";
import Testimonial, { ITestimonial } from "../db/models/Testimonial";
import { getCachedData, invalidateCache } from "../cache/nodeCache";

const TESTIMONIAL_CACHE_PREFIX = "testimonials_";

export async function getTestimonials(filter: any = {}): Promise<ITestimonial[]> {
  const cacheKey = `${TESTIMONIAL_CACHE_PREFIX}${JSON.stringify(filter)}`;
  return getCachedData(cacheKey, async () => {
    try {
      await connectToDatabase();
      return await Testimonial.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    } catch (error) {
      console.warn("MongoDB connection failed in getTestimonials. Returning empty array.");
      return [];
    }
  }, 1800);
}

export async function getTestimonialById(id: string): Promise<ITestimonial | null> {
  await connectToDatabase();
  return await Testimonial.findById(id).lean();
}

export async function createTestimonial(data: Partial<ITestimonial>): Promise<ITestimonial> {
  await connectToDatabase();
  const newDoc = new Testimonial(data);
  const result = await newDoc.save();
  invalidateCache(TESTIMONIAL_CACHE_PREFIX);
  return result;
}

export async function updateTestimonial(id: string, data: Partial<ITestimonial>): Promise<ITestimonial | null> {
  await connectToDatabase();
  const result = await Testimonial.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
  invalidateCache(TESTIMONIAL_CACHE_PREFIX);
  return result;
}

export async function deleteTestimonial(id: string): Promise<ITestimonial | null> {
  await connectToDatabase();
  const result = await Testimonial.findByIdAndDelete(id).lean();
  invalidateCache(TESTIMONIAL_CACHE_PREFIX);
  return result;
}


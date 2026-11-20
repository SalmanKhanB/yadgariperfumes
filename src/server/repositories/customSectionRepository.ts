import connectToDatabase from "../db/mongoose";
import CustomSection, { ICustomSection } from "@/server/db/models/CustomSection";
import { getCachedData, invalidateCache } from "../cache/nodeCache";

const CUSTOM_SECTION_CACHE_PREFIX = "custom_sections_";

export async function getCustomSections(filter: any = {}): Promise<ICustomSection[]> {
  const cacheKey = `${CUSTOM_SECTION_CACHE_PREFIX}${JSON.stringify(filter)}`;
  return getCachedData(cacheKey, async () => {
    try {
      await connectToDatabase();
      return CustomSection.find(filter).sort({ order: 1 }).lean();
    } catch (error) {
      console.warn("MongoDB connection failed in getCustomSections. Returning empty array.");
      return [];
    }
  }, 1800);
}

export async function getCustomSectionById(id: string): Promise<ICustomSection | null> {
  await connectToDatabase();
  return CustomSection.findById(id).lean();
}

export async function createCustomSection(data: Partial<ICustomSection>): Promise<ICustomSection> {
  await connectToDatabase();
  const result = await CustomSection.create(data);
  invalidateCache(CUSTOM_SECTION_CACHE_PREFIX);
  return result;
}

export async function updateCustomSection(id: string, data: Partial<ICustomSection>): Promise<ICustomSection | null> {
  await connectToDatabase();
  const result = await CustomSection.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
  invalidateCache(CUSTOM_SECTION_CACHE_PREFIX);
  return result;
}

export async function deleteCustomSection(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await CustomSection.findByIdAndDelete(id);
  invalidateCache(CUSTOM_SECTION_CACHE_PREFIX);
  return !!res;
}


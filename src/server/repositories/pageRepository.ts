import connectToDatabase from "../db/mongoose";
import Page, { IPage } from "../db/models/Page";

const SLUG_ALIASES: Record<string, string[]> = {
  "about": ["about-us", "about-brand", "story", "our-story"],
  "about-us": ["about", "about-brand", "story", "our-story"],
  "contact": ["contact-us", "help", "support"],
  "contact-us": ["contact", "help", "support"],
  "faq": ["faqs", "help-center", "questions"],
  "faqs": ["faq", "help-center", "questions"],
  "shipping-and-delivery": ["shipping-policy", "shipping", "delivery"],
  "shipping-policy": ["shipping-and-delivery", "shipping", "delivery"],
  "terms-of-service": ["terms", "terms-and-conditions", "tos"],
  "terms": ["terms-of-service", "terms-and-conditions", "tos"],
  "privacy-policy": ["privacy", "privacy-statement"],
  "privacy": ["privacy-policy", "privacy-statement"],
  "return-refund-policy": ["refund-policy", "returns", "refunds", "return-policy"],
  "refund-policy": ["return-refund-policy", "returns", "refunds", "return-policy"],
  "certificates-and-awards": ["certificates", "awards", "accreditations"],
  "testimonials": ["reviews", "client-reviews", "stories"]
};

export async function getPages(): Promise<IPage[]> {
  await connectToDatabase();
  let pages = await Page.find({}).sort({ updatedAt: -1 }).lean();

  const hasProducts = pages.some((p: any) => p.slug === "all");
  const hasCategories = pages.some((p: any) => p.slug === "collections");

  if (!hasProducts) {
    const productsPage = await new Page({ title: "Products Page", slug: "all", blocks: [] }).save();
    pages.unshift(productsPage.toObject());
  }

  if (!hasCategories) {
    const categoriesPage = await new Page({ title: "Categories Page", slug: "collections", blocks: [] }).save();
    pages.unshift(categoriesPage.toObject());
  }

  return pages;
}

export async function getPageBySlug(slug: string): Promise<IPage | null> {
  if (!slug) return null;
  await connectToDatabase();
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Try exact match
  let page = await Page.findOne({ slug: cleanSlug }).lean();
  if (page) return page;

  // 2. Try alias matches
  const aliases = SLUG_ALIASES[cleanSlug] || [];
  for (const alias of aliases) {
    page = await Page.findOne({ slug: alias }).lean();
    if (page) return page;
  }

  // 3. Fallback auto-provision for core system catalog routes
  if (cleanSlug === "all" || cleanSlug === "collections") {
    const title = cleanSlug === "all" ? "Products Page" : "Categories Page";
    const newPage = await new Page({ title, slug: cleanSlug, blocks: [] }).save();
    return newPage.toObject();
  }
  
  return null;
}

export async function getPageById(id: string): Promise<IPage | null> {
  await connectToDatabase();
  return await Page.findById(id).lean();
}

export async function createPage(data: Partial<IPage>): Promise<IPage> {
  await connectToDatabase();
  const newPage = new Page(data);
  return await newPage.save();
}

export async function updatePage(id: string, data: Partial<IPage>): Promise<IPage | null> {
  await connectToDatabase();
  return await Page.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
}

export async function deletePage(id: string): Promise<IPage | null> {
  await connectToDatabase();
  return await Page.findByIdAndDelete(id).lean();
}


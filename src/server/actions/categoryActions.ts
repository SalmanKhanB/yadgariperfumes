"use server";

import { revalidateTag } from "next/cache";
import {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkUpdateCategoryOrder,
  swapTwoCategories,
} from "../repositories/categoryRepository";
import { ICategory } from "../db/models/Category";
import { requireAdminSession } from "@/server/auth/adminGuard";

export async function fetchCategoriesAction() {
  try {
    const categories = await getCategories();
    // In a real app, serialize the Mongoose docs before returning if needed,
    // though `.lean()` usually returns plain JSON objects.
    return { success: true, data: JSON.parse(JSON.stringify(categories)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchPaginatedCategoriesAction(filter: any = {}, options: { limit?: number; page?: number; sort?: any } = {}) {
  try {
    const { getPaginatedCategories } = await import("../repositories/categoryRepository");
    const result = await getPaginatedCategories(filter, options);
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchCategoryBySlugAction(slug: string) {
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) return { success: false, error: "Category not found" };
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchCategoryByIdAction(id: string) {
  try {
    const category = await getCategoryById(id);
    if (!category) return { success: false, error: "Category not found" };
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCategoryAction(data: Partial<ICategory>) {
  try {
    await requireAdminSession();
    const category = await createCategory(data);
    revalidateTag("categories", "max"); // Clear cache
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCategoryAction(id: string, data: Partial<ICategory>) {
  try {
    await requireAdminSession();
    const category = await updateCategory(id, data);
    revalidateTag("categories", "max");
    if (category?.slug) revalidateTag(`category-${category.slug}`, "max");
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireAdminSession();
    await deleteCategory(id);
    revalidateTag("categories", "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleFeaturedCategoryAction(id: string, isFeatured: boolean, section: "isFeatured" | "isCustomize2" | "isCustomize3" = "isFeatured") {
  try {
    await requireAdminSession();
    const updatePayload = { [section]: isFeatured };
    const category = await updateCategory(id, updatePayload as Partial<ICategory>);
    revalidateTag("categories", "max");
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateCategoryOrderAction(orderedIds: string[]) {
  try {
    await requireAdminSession();
    await bulkUpdateCategoryOrder(orderedIds);
    revalidateTag("categories", "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function swapTwoCategoriesAction(idA: string, idB: string) {
  try {
    await requireAdminSession();
    await swapTwoCategories(idA, idB);
    revalidateTag("categories", "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

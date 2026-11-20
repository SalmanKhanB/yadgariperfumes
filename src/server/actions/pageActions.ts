"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import {
  getPages,
  getPageBySlug,
  getPageById,
  createPage,
  updatePage,
  deletePage,
} from "../repositories/pageRepository";
import { IPage } from "../db/models/Page";

export async function fetchPagesAction() {
  try {
    const pages = await getPages();
    return { success: true, data: JSON.parse(JSON.stringify(pages)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchPageBySlugAction(slug: string) {
  try {
    const page = await getPageBySlug(slug);
    if (!page) return { success: false, error: "Page not found" };
    return { success: true, data: JSON.parse(JSON.stringify(page)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchPageByIdAction(id: string) {
  try {
    const page = await getPageById(id);
    if (!page) return { success: false, error: "Page not found" };
    return { success: true, data: JSON.parse(JSON.stringify(page)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createPageAction(data: Partial<IPage>) {
  try {
    const page = await createPage(data);
    revalidateTag("pages", "max");
    revalidatePath("/", "layout");
    return { success: true, data: JSON.parse(JSON.stringify(page)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePageAction(id: string, data: Partial<IPage>) {
  try {
    const page = await updatePage(id, data);
    revalidateTag("pages", "max");
    if (page?.slug) revalidateTag(`page-${page.slug}`, "max");
    revalidatePath("/", "layout");
    return { success: true, data: JSON.parse(JSON.stringify(page)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePageAction(id: string) {
  try {
    const page = await deletePage(id);
    revalidateTag("pages", "max");
    if (page?.slug) revalidateTag(`page-${page.slug}`, "max");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

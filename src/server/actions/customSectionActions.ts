"use server";

import { revalidatePath } from "next/cache";
import {
  createCustomSection,
  updateCustomSection,
  deleteCustomSection,
} from "../repositories/customSectionRepository";
import { ICustomSection } from "../db/models/CustomSection";

export async function createCustomSectionAction(data: Partial<ICustomSection>) {
  try {
    const doc = await createCustomSection(data);
    revalidatePath("/admin/cms/custom-sections");
    revalidatePath("/");
    revalidatePath("/pages/[slug]", "page");
    return { success: true as const, data: JSON.parse(JSON.stringify(doc)) };
  } catch (error: any) {
    return { success: false as const, error: error.message };
  }
}

export async function updateCustomSectionAction(id: string, data: Partial<ICustomSection>) {
  try {
    await updateCustomSection(id, data);
    revalidatePath("/admin/cms/custom-sections");
    revalidatePath("/");
    revalidatePath("/pages/[slug]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomSectionAction(id: string) {
  try {
    await deleteCustomSection(id);
    revalidatePath("/admin/cms/custom-sections");
    revalidatePath("/");
    revalidatePath("/pages/[slug]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

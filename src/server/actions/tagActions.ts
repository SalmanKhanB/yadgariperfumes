"use server";

import { revalidatePath } from "next/cache";
import { createTag, updateTag, deleteTag } from "../repositories/tagRepository";
import { ITag } from "../db/models/Tag";

export async function createTagAction(data: Partial<ITag>) {
  try {
    const tag = await createTag(data);
    revalidatePath("/admin/tags");
    return { success: true, data: JSON.parse(JSON.stringify(tag)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTagAction(id: string, data: Partial<ITag>) {
  try {
    const tag = await updateTag(id, data);
    revalidatePath("/admin/tags");
    return { success: true, data: JSON.parse(JSON.stringify(tag)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTagAction(id: string) {
  try {
    await deleteTag(id);
    revalidatePath("/admin/tags");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

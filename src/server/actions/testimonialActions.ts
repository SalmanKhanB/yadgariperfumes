"use server";

import { revalidatePath } from "next/cache";
import {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../repositories/testimonialRepository";

export async function fetchTestimonialsAction(filter: any = {}) {
  try {
    const data = await getTestimonials(filter);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchTestimonialByIdAction(id: string) {
  try {
    const data = await getTestimonialById(id);
    if (!data) return { success: false, error: "Not found" };
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTestimonialAction(data: any) {
  try {
    const newDoc = await createTestimonial(data);
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(newDoc)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitPublicTestimonialAction(data: any) {
  try {
    // Force isActive to false so it requires admin approval
    const safeData = {
      authorName: data.authorName,
      role: data.role,
      content: data.content,
      avatarImage: data.avatarImage,
      rating: data.rating || 5,
      isActive: false,
      order: 0
    };
    await createTestimonial(safeData);
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTestimonialAction(id: string, data: any) {
  try {
    const updated = await updateTestimonial(id, data);
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTestimonialAction(id: string) {
  try {
    await deleteTestimonial(id);
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

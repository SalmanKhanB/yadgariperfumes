"use server";

import { revalidatePath } from "next/cache";
import { 
  getCelebrityReviews, 
  getCelebrityReviewById, 
  createCelebrityReview, 
  updateCelebrityReview, 
  deleteCelebrityReview 
} from "../repositories/celebrityReviewRepository";
import { ICelebrityReview } from "../db/models/CelebrityReview";

export async function fetchCelebrityReviewsAction(filter: any = {}) {
  try {
    const reviews = await getCelebrityReviews(filter);
    return { success: true, data: JSON.parse(JSON.stringify(reviews)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchCelebrityReviewByIdAction(id: string) {
  try {
    const review = await getCelebrityReviewById(id);
    if (!review) return { success: false, error: "Review not found" };
    return { success: true, data: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveCelebrityReviewAction(id: string | null, data: Partial<ICelebrityReview>) {
  try {
    let review;
    if (id) {
      review = await updateCelebrityReview(id, data);
    } else {
      review = await createCelebrityReview(data);
    }
    revalidatePath("/admin/celebrity-reviews");
    revalidatePath("/", "layout");
    return { success: true, data: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCelebrityReviewActiveAction(id: string, isActive: boolean) {
  try {
    const review = await updateCelebrityReview(id, { isActive });
    revalidatePath("/admin/celebrity-reviews");
    revalidatePath("/", "layout");
    return { success: true, data: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCelebrityReviewAction(id: string) {
  try {
    await deleteCelebrityReview(id);
    revalidatePath("/admin/celebrity-reviews");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

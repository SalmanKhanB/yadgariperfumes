"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { getPendingReviews, updateReviewStatus, createReview, toggleReviewVerification, deleteReview, getAllReviewsByProductId, recalculateProductRating } from "../repositories/reviewRepository";
import { IReview } from "../db/models/Review";

export async function fetchPendingReviewsAction() {
  try {
    const reviews = await getPendingReviews();
    return { success: true, data: JSON.parse(JSON.stringify(reviews)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchAllReviewsByProductIdAction(productId: string) {
  try {
    const reviews = await getAllReviewsByProductId(productId);
    return { success: true, data: JSON.parse(JSON.stringify(reviews)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateReviewStatusAction(id: string, status: "approved" | "rejected") {
  try {
    const review = await updateReviewStatus(id, status);
    if (review && review.productId) {
      revalidateTag("products", "max"); 
    }
    revalidatePath("/(admin)/reviews", "page");
    return { success: true, data: review ? JSON.parse(JSON.stringify(review)) : null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleReviewVerificationAction(id: string, isVerifiedPurchase: boolean) {
  try {
    const review = await toggleReviewVerification(id, isVerifiedPurchase);
    revalidateTag("products", "max"); 
    revalidatePath("/(admin)/reviews", "page");
    return { success: true, data: review ? JSON.parse(JSON.stringify(review)) : null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReviewAction(id: string) {
  try {
    const success = await deleteReview(id);
    revalidateTag("products", "max"); 
    revalidatePath("/(admin)/reviews", "page");
    return { success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitReviewAction(data: Partial<IReview>) {
  try {
    const review = await createReview(data);
    return { success: true, data: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminSubmitReviewAction(data: Partial<IReview>) {
  try {
    const review = await createReview(data);
    await updateReviewStatus(String(review._id), "approved");
    revalidateTag("products", "max"); 
    revalidatePath("/(admin)/reviews", "page");
    return { success: true, data: JSON.parse(JSON.stringify(review)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

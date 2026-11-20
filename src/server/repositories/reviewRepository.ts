import connectToDatabase from "../db/mongoose";
import Review, { IReview } from "../db/models/Review";
import Product from "../db/models/Product";
import mongoose from "mongoose";

export async function createReview(data: Partial<IReview>): Promise<IReview> {
  await connectToDatabase();
  const newReview = new Review({ ...data, status: "approved" });
  await newReview.save();
  await recalculateProductRating(String(newReview.productId));
  return newReview;
}

export async function getReviewsByProductId(productId: string): Promise<IReview[]> {
  await connectToDatabase();
  return await Review.find({ productId, status: "approved" }).sort({ createdAt: -1 }).lean();
}

export async function getAllReviewsByProductId(productId: string): Promise<IReview[]> {
  await connectToDatabase();
  return await Review.find({ productId }).sort({ createdAt: -1 }).lean();
}

export async function getPendingReviews(): Promise<IReview[]> {
  await connectToDatabase();
  return await Review.find({ status: "pending" }).populate("productId", "name slug").sort({ createdAt: -1 }).lean();
}

export async function updateReviewStatus(id: string, status: "approved" | "rejected"): Promise<IReview | null> {
  await connectToDatabase();
  const review = await Review.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
  
  if (review && status === "approved") {
    await recalculateProductRating(String(review.productId));
  }
  
  return review ? review.toObject() : null;
}

export async function toggleReviewVerification(id: string, isVerifiedPurchase: boolean): Promise<IReview | null> {
  await connectToDatabase();
  const review = await Review.findByIdAndUpdate(id, { isVerifiedPurchase }, { returnDocument: 'after' });
  return review ? review.toObject() : null;
}

export async function deleteReview(id: string): Promise<boolean> {
  await connectToDatabase();
  const review = await Review.findById(id);
  if (!review) return false;
  
  await Review.findByIdAndDelete(id);
  
  // Recalculate if it was an approved review
  if (review.status === "approved") {
    await recalculateProductRating(String(review.productId));
  }
  
  return true;
}

export async function recalculateProductRating(productId: string) {
  await connectToDatabase();
  const result = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), status: "approved" } },
    { $group: { _id: "$productId", averageRating: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Number(result[0].averageRating.toFixed(1)),
      reviewCount: result[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { averageRating: 0, reviewCount: 0 });
  }
}

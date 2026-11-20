import mongoose, { Schema, Document, Model } from "mongoose";
import { IProduct } from "./Product";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId | IProduct;
  authorName: string;
  authorEmail: string;
  rating: number; // 1-5
  body?: string;
  status: "pending" | "approved" | "rejected";
  isVerifiedPurchase: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    body: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;

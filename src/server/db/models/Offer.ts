import mongoose, { Schema, Document, Model } from "mongoose";
import { IProduct } from "./Product";

export interface IOffer extends Document {
  product: mongoose.Types.ObjectId | IProduct;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  startsAt: Date;
  endsAt?: Date;
  badgeText?: string;
  couponCode?: string;
  maxRedemptions?: number;
  redemptions: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema: Schema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["PERCENTAGE", "FIXED_AMOUNT"], required: true },
    value: { type: Number, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date },
    badgeText: { type: String },
    couponCode: { type: String, sparse: true, unique: true },
    maxRedemptions: { type: Number },
    redemptions: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

OfferSchema.index({ product: 1, isActive: 1, startsAt: 1, endsAt: 1 });

const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>("Offer", OfferSchema);

export default Offer;

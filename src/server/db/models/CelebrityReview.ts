import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICelebrityReview extends Document {
  celebrityName: string;
  videoIframe: string;
  isActive: boolean;
  order: number;
  quote?: string;
  productId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CelebrityReviewSchema: Schema = new Schema(
  {
    celebrityName: {
      type: String,
      required: [true, "Please provide a celebrity name"],
      trim: true,
    },
    videoIframe: {
      type: String,
      required: [true, "Please provide the video iframe HTML code"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    quote: {
      type: String,
      default: "",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.CelebrityReview) {
  delete mongoose.models.CelebrityReview;
}

const CelebrityReview: Model<ICelebrityReview> =
  mongoose.model<ICelebrityReview>("CelebrityReview", CelebrityReviewSchema);

export default CelebrityReview;

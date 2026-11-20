import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITestimonial extends Document {
  authorName: string;
  role?: string;
  content: string;
  avatarImage?: string;
  rating: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema: Schema = new Schema(
  {
    authorName: {
      type: String,
      required: [true, "Please provide the author's name"],
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Please provide the testimonial content"],
    },
    avatarImage: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

export default Testimonial;

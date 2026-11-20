import mongoose, { Schema, Document } from "mongoose";

export interface IGlobalFAQ extends Document {
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GlobalFAQSchema: Schema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const GlobalFAQ = mongoose.models.GlobalFAQ || mongoose.model<IGlobalFAQ>("GlobalFAQ", GlobalFAQSchema);

export default GlobalFAQ;

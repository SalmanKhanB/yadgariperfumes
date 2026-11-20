import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomSection extends Document {
  pageSlug: string;
  name: string;
  order: number;
  blockType: string;
  blockData: any;
}

const CustomSectionSchema: Schema = new Schema(
  {
    pageSlug: { type: String, required: true },
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    blockType: { type: String, default: "custom-html" },
    blockData: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const CustomSection: Model<ICustomSection> =
  mongoose.models.CustomSection || mongoose.model<ICustomSection>("CustomSection", CustomSectionSchema);

export default CustomSection;

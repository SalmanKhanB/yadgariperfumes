import mongoose, { Schema, Document, Model } from "mongoose";
import { IPageBlock, PageBlockSchema } from "./Page";

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: string;
  parent?: mongoose.Types.ObjectId | ICategory | string;
  order?: number;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  ogImageAlt?: string;
  bannerImage?: string;
  bannerImageAlt?: string;
  bannerVideo?: string;
  bannerVideoAlt?: string;
  noIndex?: boolean;
  isFeatured?: boolean;
  isCustomize2?: boolean;
  isCustomize3?: boolean;
  blocks?: IPageBlock[];
  themeConfig?: {
    theme?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, required: true, default: "product" },
    parent: { type: Schema.Types.ObjectId, ref: "Category" },
    order: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
    ogImage: { type: String },
    ogImageAlt: { type: String },
    bannerImage: { type: String },
    bannerImageAlt: { type: String },
    bannerVideo: { type: String },
    bannerVideoAlt: { type: String },
    noIndex: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isCustomize2: { type: Boolean, default: false },
    isCustomize3: { type: Boolean, default: false },
    blocks: { type: [PageBlockSchema], default: [] },
    themeConfig: {
      theme: { type: String, default: "" },
      backgroundColor: { type: String, default: "" },
      textColor: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;

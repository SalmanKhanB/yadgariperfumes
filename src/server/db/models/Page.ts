import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPageBlock {
  blockType: string;
  blockData: mongoose.Types.ObjectId | any; // Could be a reference to a specific block or embedded data
}

export interface IPage extends Document {
  slug: string;
  title: string;
  blocks: IPageBlock[];
  themeConfig?: {
    theme?: string;
    backgroundColor?: string;
    textColor?: string;
    subheading?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  showInHeader?: boolean;
  showInFooter?: boolean;
  isSystemPage?: boolean;
}

export const PageBlockSchema = new Schema(
  {
    blockType: { type: String, required: true },
    blockData: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const PageSchema: Schema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    blocks: [PageBlockSchema],
    themeConfig: {
      theme: { type: String, default: "" },
      backgroundColor: { type: String, default: "" },
      textColor: { type: String, default: "" },
      subheading: { type: String, default: "" },
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      ogImage: { type: String, default: "" },
    },
    showInHeader: { type: Boolean, default: false },
    showInFooter: { type: Boolean, default: false },
    isSystemPage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Page: Model<IPage> =
  mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);

export default Page;

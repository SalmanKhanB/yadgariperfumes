import mongoose, { Schema, Document, Model } from "mongoose";
import { ICategory } from "./Category";
import { ITag } from "./Tag";
import { IPageBlock, PageBlockSchema } from "./Page";

export interface IProductImage {
  url: string;
  altText?: string;
  title?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface IDescriptionTab {
  title: string;
  points: string[];
}

export interface IFAQ {
  question: string;
  answer: string;
}

export interface IProductVideo {
  url: string;
  provider?: string;
  title?: string;
  thumbnail?: string;
  sortOrder?: number;
}

export interface IProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: any;
}

export interface IProductVariant {
  name: string; // e.g., "Size: M", "Color: Black"
  sku?: string;
  priceOverride?: number;
  inventory: number;
  options: { name: string; value: string }[];
}

export interface IProduct extends Document {
  name: string;
  pageTitle?: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  nativeDescription?: string;
  descriptionTabs?: IDescriptionTab[];
  price: number;
  compareAtPrice?: number;
  unitQuantity?: number;
  unitType?: string; // e.g. 'ml', 'kg', 'g', 'oz', 'pieces', 'pack', 'items', 'bottles'
  images: IProductImage[];
  videos?: IProductVideo[];
  iframeEmbeds?: string[];
  faqs?: IFAQ[];
  relatedProducts?: mongoose.Types.ObjectId[] | IProduct[];
  categories?: mongoose.Types.ObjectId[] | ICategory[];
  tags?: mongoose.Types.ObjectId[] | ITag[];
  seo?: IProductSEO;
  inventory: number;
  status: "active" | "draft" | "archived";
  averageRating?: number;
  reviewCount?: number;
  themeConfig?: {
    theme?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  productType: "physical" | "digital";
  hasVariants?: boolean;
  variants?: IProductVariant[];
  blocks?: IPageBlock[];
  isFeatured?: boolean;
  isCustomize2?: boolean;
  isCustomize3?: boolean;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductImageSchema = new Schema({
  url: { type: String, required: true },
  altText: { type: String },
  title: { type: String },
  isPrimary: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
});

const ProductVideoSchema = new Schema({
  url: { type: String, required: true },
  provider: { type: String },
  title: { type: String },
  thumbnail: { type: String },
  sortOrder: { type: Number, default: 0 },
});

const ProductSEOSchema = new Schema({
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: [{ type: String }],
  canonicalUrl: { type: String },
  ogTitle: { type: String },
  ogDescription: { type: String },
  ogImage: { type: String },
  ogType: { type: String, default: "product" },
  noIndex: { type: Boolean, default: false },
  noFollow: { type: Boolean, default: false },
  structuredData: { type: Schema.Types.Mixed },
});

const ProductVariantSchema = new Schema({
  name: { type: String, required: true },
  sku: { type: String },
  priceOverride: { type: Number },
  inventory: { type: Number, default: 0 },
  options: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }]
});

const DescriptionTabSchema = new Schema({
  title: { type: String, required: true },
  points: [{ type: String, required: true }]
});

const FAQSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    pageTitle: { type: String },
    slug: { type: String, required: true, unique: true },
    shortDescription: { type: String },
    description: { type: String },
    nativeDescription: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    unitQuantity: { type: Number },
    unitType: { type: String, default: "ml" },
    images: [ProductImageSchema],
    videos: [ProductVideoSchema],
    iframeEmbeds: [{ type: String }],
    faqs: [FAQSchema],
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    descriptionTabs: [DescriptionTabSchema],
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    seo: ProductSEOSchema,
    inventory: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "draft", "archived"], default: "draft" },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    themeConfig: {
      theme: { type: String, default: "" },
      backgroundColor: { type: String, default: "" },
      textColor: { type: String, default: "" },
    },
    productType: { type: String, enum: ["physical", "digital"], default: "physical" },
    hasVariants: { type: Boolean, default: false },
    variants: [ProductVariantSchema],
    blocks: { type: [PageBlockSchema], default: [] },
    isFeatured: { type: Boolean, default: false },
    isCustomize2: { type: Boolean, default: false },
    isCustomize3: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ categories: 1, status: 1 });
ProductSchema.index({ name: "text", description: "text", shortDescription: "text" });

if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const Product: Model<IProduct> = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

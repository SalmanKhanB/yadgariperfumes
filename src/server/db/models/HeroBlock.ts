import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHeroBlock extends Document {
  title: string;
  subtitle?: string;
  cta?: {
    text: string;
    link: string;
  };
  background?: string; // image URL or color hex
  layout?: "neo-glass" | "cyber-glitch" | "fluid-aurora" | "editorial-grid" | "immersive-parallax" | "architectural-brutalism" | "ecommerce-pro" | "split-screen" | "cinematic-full" | "minimal-brutalist" | "floating-product" | "magazine-cover" | "left" | "center" | "right";
  overlayOpacity?: number;
  titleColor?: string;
  subtitleColor?: string;
  slides?: Array<{
    _id: string;
    title: string;
    subtitle?: string;
    link?: string;
    buttonText?: string;
    bannerImage?: string;
    bannerVideo?: string;
  }>;
}

export const HeroBlockSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    cta: {
      text: { type: String },
      link: { type: String },
    },
    background: { type: String },
    layout: { 
      type: String, 
      enum: ["neo-glass", "cyber-glitch", "fluid-aurora", "editorial-grid", "immersive-parallax", "architectural-brutalism", "ecommerce-pro", "split-screen", "cinematic-full", "minimal-brutalist", "floating-product", "magazine-cover", "left", "center", "right"], 
      default: "neo-glass" 
    },
    overlayOpacity: { type: Number, default: 20 },
    titleColor: { type: String, default: "" },
    subtitleColor: { type: String, default: "" },
    slides: {
      type: [
        {
          _id: { type: String },
          title: { type: String, default: "" },
          subtitle: { type: String, default: "" },
          link: { type: String, default: "" },
          buttonText: { type: String, default: "View more" },
          bannerImage: { type: String, default: "" },
          bannerVideo: { type: String, default: "" }
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

if (mongoose.models.HeroBlock) {
  delete mongoose.models.HeroBlock;
}

const HeroBlock: Model<IHeroBlock> = mongoose.model<IHeroBlock>("HeroBlock", HeroBlockSchema);

export default HeroBlock;

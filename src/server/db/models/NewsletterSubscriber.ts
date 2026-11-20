import mongoose, { Schema, Document, Model } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  subscribedAt: Date;
}

const NewsletterSubscriberSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

if (mongoose.models.NewsletterSubscriber) {
  delete mongoose.models.NewsletterSubscriber;
}

const NewsletterSubscriber: Model<INewsletterSubscriber> = mongoose.model<INewsletterSubscriber>(
  "NewsletterSubscriber",
  NewsletterSubscriberSchema
);

export default NewsletterSubscriber;

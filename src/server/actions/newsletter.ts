"use server";

import dbConnect from "@/server/db/mongoose";
import NewsletterSubscriber from "@/server/db/models/NewsletterSubscriber";

export async function subscribeToNewsletter(email: string) {
  try {
    await dbConnect();
    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return { success: false, error: "Email already subscribed" };
    }
    
    await NewsletterSubscriber.create({ email });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getNewsletterSubscribers() {
  try {
    await dbConnect();
    const subscribers = await NewsletterSubscriber.find({}).sort({ subscribedAt: -1 }).lean();
    return { success: true, subscribers: JSON.parse(JSON.stringify(subscribers)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

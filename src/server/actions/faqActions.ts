"use server";

import connectToDatabase from "../db/mongoose";
import GlobalFAQ from "../db/models/GlobalFAQ";

export async function getAllGlobalFAQsAction() {
  try {
    await connectToDatabase();
    const faqs = await GlobalFAQ.find().sort({ order: 1, createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(faqs)) };
  } catch (error: any) {
    console.error("Error fetching Global FAQs:", error);
    return { success: false, message: error.message || "Failed to fetch FAQs" };
  }
}

export async function getActiveGlobalFAQsAction() {
  try {
    await connectToDatabase();
    const faqs = await GlobalFAQ.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(faqs)) };
  } catch (error: any) {
    console.error("Error fetching active Global FAQs:", error);
    return { success: false, message: error.message || "Failed to fetch active FAQs" };
  }
}

export async function createGlobalFAQAction(data: { question: string; answer: string; order?: number; isActive?: boolean }) {
  try {
    await connectToDatabase();
    const newFaq = new GlobalFAQ(data);
    await newFaq.save();
    return { success: true, data: JSON.parse(JSON.stringify(newFaq)) };
  } catch (error: any) {
    console.error("Error creating Global FAQ:", error);
    return { success: false, message: error.message || "Failed to create FAQ" };
  }
}

export async function updateGlobalFAQAction(id: string, data: { question?: string; answer?: string; order?: number; isActive?: boolean }) {
  try {
    await connectToDatabase();
    const updatedFaq = await GlobalFAQ.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    if (!updatedFaq) {
      return { success: false, message: "FAQ not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(updatedFaq)) };
  } catch (error: any) {
    console.error("Error updating Global FAQ:", error);
    return { success: false, message: error.message || "Failed to update FAQ" };
  }
}

export async function deleteGlobalFAQAction(id: string) {
  try {
    await connectToDatabase();
    const deleted = await GlobalFAQ.findByIdAndDelete(id);
    if (!deleted) {
      return { success: false, message: "FAQ not found" };
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting Global FAQ:", error);
    return { success: false, message: error.message || "Failed to delete FAQ" };
  }
}

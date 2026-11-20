"use server";

import connectToDatabase from "@/server/db/mongoose";
import Order from "@/server/db/models/Order";
import mongoose from "mongoose";

export async function trackGuestOrderAction(formData: FormData) {
  try {
    const orderId = String(formData.get("orderId") || "").trim();
    const email = String(formData.get("email") || "").trim();

    if (!orderId || !email) {
      return { success: false, error: "Order ID and Email are required." };
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return { success: false, error: "Invalid Order ID format." };
    }

    await connectToDatabase();
    
    // Find order
    const order = await Order.findById(orderId).populate("items.productId").lean();
    
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    // Verify email (case insensitive)
    const orderEmail = order.customerEmail || "";
    if (orderEmail.trim().toLowerCase() !== email.toLowerCase()) {
      return { success: false, error: "Order found, but the provided email does not match." };
    }

    // Return the safe order data
    return { 
      success: true, 
      order: JSON.parse(JSON.stringify(order))
    };
  } catch (error: any) {
    console.error("Track guest order error:", error);
    return { success: false, error: "An unexpected error occurred while tracking your order." };
  }
}

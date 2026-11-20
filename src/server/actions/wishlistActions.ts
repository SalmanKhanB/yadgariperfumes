"use server";

import { auth } from "@/server/auth/config";
import connectToDatabase from "@/server/db/mongoose";
import User from "@/server/db/models/User";
import Product from "@/server/db/models/Product";
import mongoose from "mongoose";

export async function toggleWishlistAction(productId: string) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return { success: false, error: "Invalid user ID format" };
    }
    const user = await User.findById(session.user.id);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const objectId = new mongoose.Types.ObjectId(productId);
    const inWishlist = user.wishlist.some(id => id.toString() === productId);

    if (inWishlist) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    } else {
      user.wishlist.push(objectId);
    }

    await user.save();
    return { success: true, isWishlisted: !inWishlist };
  } catch (error: any) {
    console.error("Wishlist toggle error:", error);
    return { success: false, error: error.message };
  }
}

export async function getWishlistAction() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return { success: true, wishlist: [] }; // Mock/Invalid users have no wishlist
    }
    const user = await User.findById(session.user.id).populate("wishlist").lean();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Filter out nulls in case products were deleted
    const validProducts = user.wishlist.filter(p => p != null);
    
    return { success: true, wishlist: JSON.parse(JSON.stringify(validProducts)) };
  } catch (error: any) {
    console.error("Fetch wishlist error:", error);
    return { success: false, error: error.message };
  }
}

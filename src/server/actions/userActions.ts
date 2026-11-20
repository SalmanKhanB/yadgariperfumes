"use server";

import connectToDatabase from "@/server/db/mongoose";
import User, { IUser } from "@/server/db/models/User";
import Order from "@/server/db/models/Order";
import { requireAdminSession } from "@/server/auth/adminGuard";
import { revalidatePath } from "next/cache";

export async function fetchUsersAction(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await requireAdminSession();
    await connectToDatabase();

    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    // Enrich with aggregated order metrics (orderCount, totalSpent)
    const userIds = users.map((u) => u._id);
    const orderAggregations = await Order.aggregate([
      { $match: { customerId: { $in: userIds } } },
      {
        $group: {
          _id: "$customerId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totals.total" },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
    ]);

    const statsMap = new Map<string, { orderCount: number; totalSpent: number; lastOrderDate: string }>();
    for (const agg of orderAggregations) {
      if (agg._id) {
        statsMap.set(agg._id.toString(), {
          orderCount: agg.orderCount || 0,
          totalSpent: agg.totalSpent || 0,
          lastOrderDate: agg.lastOrderDate ? new Date(agg.lastOrderDate).toISOString() : "",
        });
      }
    }

    const parsedUsers = users.map((u: any) => {
      const stats = statsMap.get(u._id.toString()) || { orderCount: 0, totalSpent: 0, lastOrderDate: "" };
      return {
        _id: u._id.toString(),
        name: u.name || "Unnamed Customer",
        email: u.email,
        phone: u.phone || "",
        role: u.role || "USER",
        isDisabled: Boolean(u.isDisabled),
        disabledReason: u.disabledReason || "",
        emailVerified: Boolean(u.emailVerified),
        addressCount: u.addresses?.length || 0,
        wishlistCount: u.wishlist?.length || 0,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : "",
        updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : "",
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
      };
    });

    return { success: true, data: parsedUsers };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchUserDetailAction(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await requireAdminSession();
    await connectToDatabase();

    const user: any = await User.findById(userId)
      .populate({
        path: "wishlist",
        select: "title slug price images status handle",
      })
      .lean();

    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Fetch complete user order history
    const orders: any[] = await Order.find({ customerId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const parsedUser = {
      _id: user._id.toString(),
      name: user.name || "Unnamed Customer",
      email: user.email,
      phone: user.phone || "",
      role: user.role || "USER",
      isDisabled: Boolean(user.isDisabled),
      disabledReason: user.disabledReason || "",
      emailVerified: Boolean(user.emailVerified),
      addresses: (user.addresses || []).map((addr: any) => ({
        ...addr,
        _id: addr._id ? addr._id.toString() : "",
      })),
      wishlist: (user.wishlist || []).map((item: any) => ({
        _id: item._id ? item._id.toString() : "",
        title: item.title || item.name || "Product",
        slug: item.slug || item.handle || "",
        price: item.price || 0,
        image: item.images?.[0] || item.featuredImage || "",
      })),
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : "",
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : "",
      orders: orders.map((o: any) => ({
        _id: o._id.toString(),
        createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : "",
        status: o.status || "pending",
        paymentStatus: o.paymentStatus || "pending",
        paymentMethod: o.paymentMethod || "cod",
        totals: o.totals || { total: 0 },
        itemsCount: o.items?.length || 0,
        items: (o.items || []).map((item: any) => ({
          productId: item.productId?.toString?.() || "",
          quantity: item.quantity || 1,
          price: item.price || 0,
          variant: item.selectedVariant?.name || "",
        })),
        shippingAddress: o.shippingAddress || null,
      })),
    };

    return { success: true, data: parsedUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleUserDisabledAction(
  userId: string,
  isDisabled: boolean,
  reason: string = ""
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    // Prevent disabling self
    if (session.user.id === userId) {
      return { success: false, error: "You cannot disable your own Super Admin account." };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    user.isDisabled = isDisabled;
    if (isDisabled && reason) {
      user.disabledReason = reason;
    } else if (!isDisabled) {
      user.disabledReason = undefined;
    }

    await user.save();
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return {
      success: true,
      message: isDisabled ? "User account has been disabled." : "User account has been reactivated.",
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserRoleAction(
  userId: string,
  newRole: "SUPER_ADMIN" | "USER"
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    if (session.user.id === userId && newRole !== "SUPER_ADMIN") {
      return { success: false, error: "You cannot demote your own Super Admin account." };
    }

    const validRoles = ["SUPER_ADMIN", "USER"];
    if (!validRoles.includes(newRole)) {
      return { success: false, error: "Invalid role specified." };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    user.role = newRole;
    await user.save();

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return { success: true, message: `User role updated to ${newRole}.` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUserAction(
  userId: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    if (session.user.id === userId) {
      return { success: false, error: "You cannot delete your own Super Admin account." };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    await User.findByIdAndDelete(userId);
    revalidatePath("/admin/users");

    return { success: true, message: "User deleted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

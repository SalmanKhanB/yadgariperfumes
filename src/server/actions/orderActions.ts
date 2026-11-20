"use server";

import { revalidatePath } from "next/cache";
import { getOrders, getOrderById } from "../repositories/orderRepository";
import connectToDatabase from "../db/mongoose";
import Order from "../db/models/Order";
import { isValidObjectId } from "mongoose";
import { auth } from "@/server/auth/config";
import { requireAdminSession } from "@/server/auth/adminGuard";
import { emailService } from "@/lib/email/nodemailer";

export async function fetchOrdersAction(filter: any = {}) {
  try {
    await requireAdminSession();
    const orders = await getOrders(filter);
    return { success: true, data: JSON.parse(JSON.stringify(orders)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchOrderByIdAction(id: string) {
  try {
    await requireAdminSession();
    const order = await getOrderById(id);
    if (!order) return { success: false, error: "Order not found" };
    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatusAction(id: string, status: string) {
  try {
    await requireAdminSession();
    await connectToDatabase();
    const order = await Order.findByIdAndUpdate(id, { status }, { returnDocument: 'after' }).lean();

    if (order && (order.customerEmail || order.customerId)) {
      await emailService.sendOrderStatusUpdateEmail(order.customerEmail || "", id, status).catch((err) => {
        console.warn("Failed to dispatch order status update email:", err);
      });
    }

    revalidatePath("/admin/orders", "page");
    revalidatePath(`/admin/orders/${id}`, "page");
    revalidatePath("/account/orders", "page");
    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePaymentStatusAction(id: string, paymentStatus: string) {
  try {
    await requireAdminSession();
    await connectToDatabase();
    const order = await Order.findByIdAndUpdate(id, { paymentStatus }, { returnDocument: 'after' }).lean();
    revalidatePath("/admin/orders", "page");
    revalidatePath(`/admin/orders/${id}`, "page");
    revalidatePath("/account/orders", "page");
    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelOrderAction(orderId: string, reason: string = "") {
  try {
    const customerId = (await auth())?.user?.id;
    if (!customerId || !isValidObjectId(customerId)) {
      return { success: false, error: "Sign in to update your order." };
    }
    await connectToDatabase();
    const order = await Order.findOne({ _id: orderId, customerId });
    if (!order) return { success: false, error: "Order not found" };

    if (order.status === "shipped" || order.status === "delivered") {
      return { success: false, error: "Shipped or delivered orders cannot be cancelled. You can request a return after delivery." };
    }

    if (order.status === "cancelled") {
      return { success: false, error: "Order is already cancelled." };
    }

    order.status = "cancelled";
    if (reason) {
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        note: `Cancellation reason: ${reason}`
      };
    }
    await order.save();

    if (order.customerEmail || order.customerId) {
      emailService.sendOrderStatusUpdateEmail(order.customerEmail || "", orderId, "cancelled").catch((err) => {
        console.warn("Failed to dispatch order cancellation email:", err);
      });
    }

    revalidatePath("/account/orders", "page");
    revalidatePath(`/order-confirmation/${orderId}`, "page");
    revalidatePath("/admin/orders", "page");

    return { success: true, message: "Order cancelled successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function requestReturnAction(orderId: string, reason: string = "") {
  try {
    const customerId = (await auth())?.user?.id;
    if (!customerId || !isValidObjectId(customerId)) {
      return { success: false, error: "Sign in to update your order." };
    }
    await connectToDatabase();
    const order = await Order.findOne({ _id: orderId, customerId });
    if (!order) return { success: false, error: "Order not found" };

    if (order.status !== "delivered") {
      return { success: false, error: "Only delivered orders are eligible for return requests." };
    }

    order.status = "return_requested";
    if (reason) {
      order.paymentDetails = {
        ...(order.paymentDetails || {}),
        note: `Return reason: ${reason}`
      };
    }
    await order.save();

    if (order.customerEmail || order.customerId) {
      emailService.sendOrderStatusUpdateEmail(order.customerEmail || "", orderId, "return_requested").catch((err) => {
        console.warn("Failed to dispatch return request notification email:", err);
      });
    }

    revalidatePath("/account/orders", "page");
    revalidatePath(`/order-confirmation/${orderId}`, "page");
    revalidatePath("/admin/orders", "page");

    return { success: true, message: "Return request submitted successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


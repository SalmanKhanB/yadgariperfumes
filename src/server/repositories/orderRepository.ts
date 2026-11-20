import connectToDatabase from "../db/mongoose";
import Order, { IOrder } from "../db/models/Order";

export async function createPendingOrder(data: Partial<IOrder>): Promise<IOrder> {
  await connectToDatabase();
  const newOrder = new Order({ ...data, status: "pending" });
  return await newOrder.save();
}

export async function createOrder(data: Partial<IOrder>): Promise<IOrder> {
  await connectToDatabase();
  const newOrder = new Order(data);
  return await newOrder.save();
}

export async function updateOrder(orderId: string, updateData: Partial<IOrder>): Promise<IOrder | null> {
  await connectToDatabase();
  return await Order.findByIdAndUpdate(
    orderId,
    { $set: updateData },
    { returnDocument: 'after' }
  ).lean();
}

export async function updateOrderByStripeSession(stripeSessionId: string, updateData: Partial<IOrder>): Promise<IOrder | null> {
  await connectToDatabase();
  return await Order.findOneAndUpdate(
    { stripeSessionId },
    { $set: updateData },
    { returnDocument: 'after' }
  ).lean();
}

export async function getOrderById(id: string): Promise<any | null> {
  await connectToDatabase();
  return await Order.findById(id).populate("items.productId").lean();
}

export async function getOrderByStripeSession(stripeSessionId: string): Promise<any | null> {
  await connectToDatabase();
  return await Order.findOne({ stripeSessionId }).lean();
}

export async function getOrders(filter: any = {}): Promise<IOrder[]> {
  await connectToDatabase();
  return await Order.find(filter).sort({ createdAt: -1 }).populate("items.productId").lean();
}

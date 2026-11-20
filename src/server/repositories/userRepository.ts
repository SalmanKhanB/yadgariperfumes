import mongoose from "mongoose";
import connectToDatabase from "../db/mongoose";
import User, { IUser, IAddress } from "../db/models/User";

export async function getUserByEmail(email: string): Promise<IUser | null> {
  if (!email) return null;
  await connectToDatabase();
  return await User.findOne({ email }).lean();
}

export async function getUserById(id: string): Promise<IUser | null> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return null;
  }
  await connectToDatabase();
  return await User.findById(id).lean();
}

export async function createUser(data: Partial<IUser>): Promise<IUser> {
  await connectToDatabase();
  const newUser = new User(data);
  return await newUser.save();
}

export async function updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
  if (!id || !mongoose.isValidObjectId(id)) {
    return null;
  }
  await connectToDatabase();
  return await User.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' }).lean();
}

export async function getUsers(filter: any = {}): Promise<IUser[]> {
  await connectToDatabase();
  return await User.find(filter).sort({ createdAt: -1 }).lean();
}

export async function getUserByResetToken(token: string): Promise<IUser | null> {
  await connectToDatabase();
  return await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() },
  }).lean();
}

export async function getUserByVerificationToken(token: string): Promise<IUser | null> {
  await connectToDatabase();
  return await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  }).lean();
}

export async function getOrdersByCustomerId(customerId: string): Promise<any[]> {
  await connectToDatabase();
  const Order = (await import("../db/models/Order")).default;
  return await Order.find({ customerId })
    .sort({ createdAt: -1 })
    .populate("items.productId")
    .lean();
}

import mongoose, { Schema, Document, Model } from "mongoose";
import { IProduct } from "./Product";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId | IProduct;
  quantity: number;
  price: number;
  selectedVariant?: {
    name: string;
    price: number;
    sku?: string;
  };
}

export interface IOrder extends Document {
  customerId?: mongoose.Types.ObjectId;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  currency?: string;
  confirmationEmailStatus?: "sent" | "failed";
  confirmationEmailSentAt?: Date;
  items: IOrderItem[];
  totals: {
    subtotal: number;
    shippingFee?: number;
    tax: number;
    total: number;
  };
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | string;
  paymentMethod?: "stripe" | "cod" | "manual" | string;
  paymentStatus?: "pending" | "awaiting_verification" | "paid" | "failed" | "refunded" | string;
  paymentDetails?: {
    referenceId?: string;
    proofImage?: string;
    note?: string;
  };
  deliveryOption?: {
    id?: string;
    name?: string;
    cost?: number;
    estimatedDays?: string;
  };
  stripeSessionId?: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  selectedVariant: {
    name: { type: String },
    price: { type: Number },
    sku: { type: String }
  }
});

const OrderSchema: Schema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    customerEmail: { type: String },
    customerName: { type: String },
    customerPhone: { type: String },
    currency: { type: String },
    confirmationEmailStatus: { type: String, enum: ["sent", "failed"] },
    confirmationEmailSentAt: { type: Date },
    items: [OrderItemSchema],
    totals: {
      subtotal: { type: Number, required: true },
      shippingFee: { type: Number, default: 0 },
      tax: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    status: {
      type: String,
      default: "pending",
    },
    paymentMethod: { type: String, default: "cod" },
    paymentStatus: { type: String, default: "pending" },
    paymentDetails: {
      referenceId: { type: String },
      proofImage: { type: String },
      note: { type: String },
    },
    deliveryOption: {
      id: { type: String },
      name: { type: String },
      cost: { type: Number, default: 0 },
      estimatedDays: { type: String },
    },
    stripeSessionId: { type: String },
    shippingAddress: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;

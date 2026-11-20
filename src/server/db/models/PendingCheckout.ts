import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPendingCheckout extends Document {
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  items: any[];
  subtotal: number;
  amount?: number;
  currency?: string;
  deliveryOption?: { id: string; name: string; cost: number; estimatedDays: string };
  stripePaymentIntentId?: string;
  woocommerceOrderId?: string;
  paymentProvider?: "stripe" | "cod" | "woocommerce";
  createdAt?: Date;
  updatedAt?: Date;
}

const PendingCheckoutSchema: Schema = new Schema(
  {
    customerId: { type: String },
    customerEmail: { type: String },
    customerName: { type: String },
    items: { type: Array, required: true },
    subtotal: { type: Number, required: true },
    amount: { type: Number },
    currency: { type: String },
    deliveryOption: { id: String, name: String, cost: Number, estimatedDays: String },
    stripePaymentIntentId: { type: String },
    woocommerceOrderId: { type: String },
    paymentProvider: { type: String, enum: ["stripe", "cod", "woocommerce"], default: "stripe" },
  },
  { timestamps: true }
);

const PendingCheckout: Model<IPendingCheckout> =
  mongoose.models.PendingCheckout || mongoose.model<IPendingCheckout>("PendingCheckout", PendingCheckoutSchema);

export default PendingCheckout;

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress {
  _id?: mongoose.Types.ObjectId | string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name?: string;
  email: string;
  phone?: string;
  image?: string;
  avatar?: string;
  passwordHash?: string;
  role: "SUPER_ADMIN" | "USER";
  isDisabled?: boolean;
  disabledReason?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  addresses: mongoose.Types.DocumentArray<IAddress>;
  wishlist: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema(
  {
    label: { type: String, required: true, default: "Home" },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema: Schema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    image: { type: String, default: "" },
    avatar: { type: String, default: "" },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "USER"],
      default: "USER",
    },
    isDisabled: { type: Boolean, default: false },
    disabledReason: { type: String },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

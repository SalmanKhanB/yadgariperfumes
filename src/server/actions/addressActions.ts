"use server";

import { auth } from "@/server/auth/config";
import connectToDatabase from "@/server/db/mongoose";
import User, { IAddress } from "@/server/db/models/User";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

async function getSessionUser(session: any) {
  if (!session || !session.user) return null;
  await connectToDatabase();
  
  if (session.user.id && mongoose.isValidObjectId(session.user.id)) {
    const user = await User.findById(session.user.id);
    if (user) return user;
  }
  
  if (session.user.email) {
    const user = await User.findOne({ email: session.user.email });
    if (user) return user;
  }
  
  return null;
}

export async function addAddressAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const label = (formData.get("label") as string) || "Home";
    const line1 = formData.get("line1") as string;
    const line2 = formData.get("line2") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const postalCode = formData.get("postalCode") as string;
    const country = formData.get("country") as string;
    const isDefault = formData.get("isDefault") === "true";

    if (!line1 || !city || !state || !postalCode || !country) {
      return { success: false, error: "Missing required fields" };
    }

    const user = await getSessionUser(session);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // If this is the first address, make it default automatically
    const isFirstAddress = (user.addresses || []).length === 0;
    const shouldBeDefault = isDefault || isFirstAddress;

    // If setting as default, remove default from others
    if (shouldBeDefault && user.addresses) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      label,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      isDefault: shouldBeDefault,
    } as IAddress;

    if (!user.addresses) {
      user.addresses = [] as any;
    }

    user.addresses.push(newAddress);
    await user.save();

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error: any) {
    console.error("Add address error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAddressAction(addressId: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const label = formData.get("label") as string;
    const line1 = formData.get("line1") as string;
    const line2 = formData.get("line2") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const postalCode = formData.get("postalCode") as string;
    const country = formData.get("country") as string;
    const isDefault = formData.get("isDefault") === "true";

    const user = await getSessionUser(session);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const address = user.addresses?.id(addressId);
    if (!address) {
      return { success: false, error: "Address not found" };
    }

    if (isDefault && user.addresses) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    if (label) address.label = label;
    if (line1) address.line1 = line1;
    if (line2 !== null) address.line2 = line2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    // Ensure there is at least one default if addresses exist
    const hasDefault = (user.addresses || []).some((addr: any) => addr.isDefault);
    if (!hasDefault && user.addresses && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error: any) {
    console.error("Update address error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAddressAction(addressId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await getSessionUser(session);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const address = user.addresses?.id(addressId);
    if (!address) {
      return { success: false, error: "Address not found" };
    }

    const wasDefault = address.isDefault;

    user.addresses.pull({ _id: addressId });

    if (wasDefault && user.addresses && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error: any) {
    console.error("Delete address error:", error);
    return { success: false, error: error.message };
  }
}

export async function setDefaultAddressAction(addressId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await getSessionUser(session);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const address = user.addresses?.id(addressId);
    if (!address) {
      return { success: false, error: "Address not found" };
    }

    if (user.addresses) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = addr._id?.toString() === addressId;
      });
    }

    await user.save();

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error: any) {
    console.error("Set default address error:", error);
    return { success: false, error: error.message };
  }
}

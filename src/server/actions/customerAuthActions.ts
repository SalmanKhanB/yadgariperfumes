"use server";

import { signIn, signOut } from "@/server/auth/config";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/server/repositories/userRepository";

import { emailService } from "@/lib/email/nodemailer";
import connectToDatabase from "@/server/db/mongoose";
import User from "@/server/db/models/User";
import crypto from "crypto";

export async function registerCustomerAction(
  prevState: any,
  formData: FormData
) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email || !password || !confirmPassword) {
      return { error: "All fields are required." };
    }

    if (name.trim().length < 2) {
      return { error: "Name must be at least 2 characters." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address." };
    }

    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    if (password !== confirmPassword) {
      return { error: "Passwords do not match." };
    }

    // Check if admin email
    if (email === process.env.ADMIN_EMAIL) {
      return { error: "This email address is not available." };
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await connectToDatabase();
    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "USER",
      emailVerified: false,
      emailVerificationToken: tokenHash,
      emailVerificationExpires: verificationExpires,
      addresses: [],
    });

    // Send verification email
    await emailService.sendVerificationEmail(email.toLowerCase().trim(), verificationToken);

    // Auto sign in after registration
    await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirectTo: "/account",
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Registration succeeded but auto-login failed. Please log in." };
    }
    // Redirect errors from signIn are thrown — rethrow them
    throw error;
  }
}

export async function loginCustomerAction(
  prevState: any,
  formData: FormData
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirectTo: "/account",
    });

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(
  prevState: any,
  formData: FormData
) {
  try {
    const email = formData.get("email") as string;
    if (!email) {
      return { error: "Email is required." };
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // We don't want to reveal if the user exists or not for security, but we do need to send the email if they do
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      user.passwordResetToken = tokenHash;
      user.passwordResetExpires = resetExpires;
      await user.save();

      await emailService.sendPasswordResetEmail(user.email, resetToken);
    }

    return { success: true, message: "If an account with that email exists, a password reset link has been sent." };
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function resetPasswordAction(
  prevState: any,
  formData: FormData
) {
  try {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token || !password || !confirmPassword) {
      return { error: "All fields are required." };
    }

    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    if (password !== confirmPassword) {
      return { error: "Passwords do not match." };
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await connectToDatabase();
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return { error: "Token is invalid or has expired." };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    user.passwordHash = passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { success: true, message: "Password has been successfully reset." };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function verifyEmailAction(token: string) {
  try {
    if (!token) {
      return { success: false, error: "Token is required." };
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await connectToDatabase();
    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return { success: false, error: "Verification link is invalid or has expired." };
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { success: true };
  } catch (error: any) {
    console.error("Email verification error:", error);
    return { success: false, error: "Something went wrong during verification." };
  }
}

import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/server/auth/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadCustomerAvatarAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Please log in to upload your profile photo." };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "sqodex_avatars",
              public_id: `avatar-${session.user.id || Date.now()}`,
              format: "webp",
              transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        const publicUrl = (uploadResult as any).secure_url;
        return { success: true, url: publicUrl };
      } catch (cloudErr: any) {
        console.warn("Cloudinary upload failed for avatar, using data URL fallback:", cloudErr);
      }
    }

    const mimeType = file.type || "image/jpeg";
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return { success: true, url: dataUrl };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to upload avatar image." };
  }
}

export async function updateCustomerProfileAction(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    const email = (formData.get("email") as string) || session?.user?.email;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const image = formData.get("image") as string;

    if (!name || !name.trim()) {
      return { error: "Name is required." };
    }

    if (!email) {
      return { error: "User email could not be identified. Please log in again." };
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return { error: "User account not found." };
    }

    user.name = name.trim();
    if (phone !== undefined && phone !== null) (user as any).phone = phone.trim();
    if (image !== undefined && image !== null) {
      (user as any).image = image.trim();
      (user as any).avatar = image.trim();
    }
    await user.save();

    return { success: true, message: "Profile details updated successfully." };
  } catch (error: any) {
    return { error: error.message || "Failed to update profile." };
  }
}

export async function updateCustomerPasswordAction(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    const email = (formData.get("email") as string) || session?.user?.email;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!email) {
      return { error: "Please log in to change your password." };
    }

    if (!currentPassword || !newPassword) {
      return { error: "Both current and new passwords are required." };
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.passwordHash) {
      return { error: "User not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return { error: "Current password is incorrect." };
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    return { success: true, message: "Password updated successfully." };
  } catch (error: any) {
    return { error: error.message || "Failed to update password." };
  }
}

"use server";

import { signIn } from "@/server/auth/config";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/server/repositories/userRepository";
import bcrypt from "bcryptjs";
import { ADMIN_ROLES, AdminRole } from "@/server/auth/adminGuard";

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    const isEnvAdmin = adminEmail && adminPassword && email === adminEmail;

    if (!isEnvAdmin) {
      // Check MongoDB user to verify if they have an admin role
      const user = await getUserByEmail(email);
      if (!user) {
        return { error: "Invalid email or password." };
      }

      if (user.role !== "SUPER_ADMIN") {
        return { error: "Access denied. Only Super Admin can log in here." };
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash || "");
      if (!isValidPassword) {
        return { error: "Invalid email or password." };
      }
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/dashboard",
    });

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}

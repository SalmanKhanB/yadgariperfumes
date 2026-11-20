import { auth } from "@/server/auth/config";

export const ADMIN_ROLES = ["SUPER_ADMIN"] as const;
export type AdminRole = typeof ADMIN_ROLES[number];

/**
 * Checks if the current session belongs to a SUPER_ADMIN.
 * Throws an Error if unauthorized, protecting Server Actions and sensitive endpoints.
 */
export async function requireAdminSession() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized: You must be signed in as Super Admin to perform this action.");
  }

  const role = session.user.role;
  if (role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Super Admin privileges required.");
  }

  return session;
}

/**
 * Checks if the current session has Super Admin privileges without throwing.
 */
export async function isSuperAdminSession(): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user) return false;
    return session.user.role === "SUPER_ADMIN";
  } catch {
    return false;
  }
}

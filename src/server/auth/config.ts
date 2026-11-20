import NextAuth, { DefaultSession } from "next-auth";
import { authConfig } from "./authConfig";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "SUPER_ADMIN" | "USER";
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // Adapter removed to prevent NextAuth from attempting to sync credentials users to MongoDB
});

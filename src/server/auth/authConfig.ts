import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "../repositories/userRepository";

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "sqodex-secret-key-fallback-2024",
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // 1. Check admin env credentials first (preserves existing admin login)
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          adminEmail &&
          adminPassword &&
          email === adminEmail
        ) {
          const isValid = password === adminPassword;

          if (isValid) {
            let adminImage = "";
            try {
              const dbAdmin = await getUserByEmail(adminEmail);
              if (dbAdmin) {
                adminImage = dbAdmin.image || (dbAdmin as any).avatar || "";
              }
            } catch (e) {}

            return {
              id: "admin-1",
              name: "Admin",
              email: adminEmail,
              role: "SUPER_ADMIN",
              image: adminImage,
            };
          }
          // If admin email matches but password is wrong, don't fall through to DB
          return null;
        }

        // 2. Fall back to MongoDB User lookup for customer accounts
        try {
          const user = await getUserByEmail(email);
          if (!user || !user.passwordHash) return null;

          // Reject disabled accounts
          if (user.isDisabled) {
            console.warn(`Login attempt on disabled account: ${email}`);
            return null;
          }

          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          if (!isValidPassword) return null;

          return {
            id: user._id!.toString(),
            name: user.name || "",
            email: user.email,
            role: user.role,
            image: user.image || (user as any).avatar || "",
          };
        } catch (error) {
          console.error("Auth error during DB user lookup:", error);
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 6 * 60 * 60, // 6 hours
  },
  pages: {
    signIn: "/account/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.role = (user as any).role || "USER";
        token.picture = (user as any).image || (user as any).avatar || user.image || "";
      }
      if (trigger === "update" && session?.user) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.image !== undefined) token.picture = session.user.image;
      }
      // If token does not yet have a picture, try fetching latest avatar from DB
      if (!token.picture && token.email) {
        try {
          const dbUser = await getUserByEmail(token.email as string);
          if (dbUser && (dbUser.image || (dbUser as any).avatar)) {
            token.picture = dbUser.image || (dbUser as any).avatar;
          }
        } catch (e) {}
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub as string;
        session.user.name = token.name as string;
        session.user.role = token.role as any;
        session.user.image = (token.picture as string) || "";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

import NextAuth from "next-auth";
import { authConfig } from "@/server/auth/authConfig";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// In-memory rate limiter using Map (instance-local for Edge)
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 10 * 1000; // 10 seconds
const MAX_REQUESTS = 10;

function checkRateLimit(ip: string) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || record.reset < now) {
    rateLimitMap.set(ip, { count: 1, reset: now + WINDOW_MS });
    return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - 1, reset: now + WINDOW_MS };
  }
  
  if (record.count >= MAX_REQUESTS) {
    return { success: false, limit: MAX_REQUESTS, remaining: 0, reset: record.reset };
  }
  
  record.count += 1;
  return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - record.count, reset: record.reset };
}

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  // 1. Rate Limit specific API endpoints to prevent abuse
  const isRateLimitedRoute = req.nextUrl.pathname.startsWith("/api/checkout") || 
                             req.nextUrl.pathname.startsWith("/api/reviews");
                             
  if (isRateLimitedRoute) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(',')[0] : "127.0.0.1";
    
    const { success, limit, reset, remaining } = checkRateLimit(ip);
    
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        }
      });
    }
  }

  // 2. Protect Admin Routes
  const isAdminRoute = nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/cms");
  
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = req.auth?.user?.role;
    // Strictly allow ONLY SUPER_ADMIN to access the admin dashboard
    if (userRole !== "SUPER_ADMIN") {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl); 
    }
  }

  // 3. Protect Customer Account Routes
  if (nextUrl.pathname.startsWith("/account")) {
    const publicAccountPaths = [
      "/account/login",
      "/account/register",
      "/account/forgot-password",
      "/account/reset-password",
      "/account/verify-email",
      "/account/order-lookup",
    ];

    const isPublicAccountPath = publicAccountPaths.some(
      (path) => nextUrl.pathname === path || nextUrl.pathname.startsWith(path + "/")
    );

    if (!isPublicAccountPath && !isLoggedIn) {
      const loginUrl = new URL("/account/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect logged-in users away from login/register
    if (isLoggedIn && (nextUrl.pathname === "/account/login" || nextUrl.pathname === "/account/register")) {
      return NextResponse.redirect(new URL("/account", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

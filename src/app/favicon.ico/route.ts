import { NextResponse } from "next/server";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  // 1. Check local public/favicon.ico first (standard multi-size ICO file for browsers & Googlebot)
  try {
    const icoPath = path.join(process.cwd(), "public", "assets", "favicon.ico");
    if (fs.existsSync(icoPath)) {
      const fileBuffer = fs.readFileSync(icoPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/x-icon",
          "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    }
  } catch (err) {
    // Fall through to remote/fallback icon
  }

  // 2. Check dynamic database favicon or logo if public/favicon.ico is not present
  try {
    const settings = await getCachedSiteSettings();
    const faviconUrl = settings.favicon || settings.logo;

    if (faviconUrl && (faviconUrl.startsWith("http://") || faviconUrl.startsWith("https://"))) {
      const response = await fetch(faviconUrl, {
        next: { revalidate: 3600 }
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "image/png";
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      }
    }
  } catch (err) {
    // Fall back to local file
  }

  // 3. Fallback: Read local public favicon.png
  try {
    const filePath = path.join(process.cwd(), "public", "favicon.png");
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    }
  } catch (e) {
    // Return empty 204 if all fails
  }

  return new NextResponse(null, { status: 204 });
}

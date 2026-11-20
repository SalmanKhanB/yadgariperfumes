import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.yadgariperfumes.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: ["Googlebot", "Googlebot-Image"],
        allow: ["/", "/favicon.ico", "/favicon.png", "/logo.png", "/apple-touch-icon.png"],
      },
    ],
    sitemap: `${baseUrl.replace(/\/+$/, "")}/sitemap.xml`,
  };
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.18.26'],
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        missing: [
          {
            type: "header",
            key: "x-nextjs-data",
          },
        ],
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Basic CSP. Includes Stripe, Google, and Meta Pixel (Facebook) tracking domains
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com https://js.stripe.com https://translate.google.com https://translate.googleapis.com https://*.translate.goog https://www.google.com https://www.gstatic.com https://*.googleapis.com https://*.google.com; style-src 'self' 'unsafe-inline' https://translate.googleapis.com https://www.gstatic.com https://fonts.googleapis.com; img-src 'self' data: https: http: blob: https://www.facebook.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://connect.facebook.net https://www.facebook.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://api.stripe.com https://translate.googleapis.com https://*.translate.goog https://*.googleapis.com https://*.google.com ws: wss:; frame-src * data: blob:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

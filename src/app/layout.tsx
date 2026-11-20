import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import QueryProvider from "@/lib/providers/QueryProvider";
import "./globals.css";
import { Suspense } from "react";
import PreviewInspector from "@/components/storefront/PreviewInspector";
import { AppProviders } from "@/components/providers/AppProviders";
import { Analytics } from "@/components/storefront/Analytics";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { getCachedSiteSettings } from "@/server/cache/siteSettingsCache";

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Extract Google Search Console verification token from raw input.
 */
function extractGoogleVerification(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  const match = trimmed.match(/content\s*=\s*["']([^"']+)["']/i);
  if (match) return match[1];
  return trimmed || undefined;
}

/**
 * Normalizes image or logo URL to an absolute URL for Googlebot search indexers.
 */
function resolveAbsoluteUrl(pathOrUrl?: string, baseUrl: string = "http://localhost:3000"): string | undefined {
  if (!pathOrUrl) return undefined;
  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = trimmed.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const siteName = settings.name || "Storefront";
  const title = settings.seoDefaults?.title || siteName;
  const description = settings.seoDefaults?.description || `Welcome to ${siteName}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Google Search Console verification from admin settings
  const googleVerification = extractGoogleVerification(settings.integrations?.googleSearchConsoleTag);
  
  // Resolve primary logo and OG branding image
  const primaryFavicon = resolveAbsoluteUrl(settings.favicon || "/favicon.ico", baseUrl);
  const primaryLogo = resolveAbsoluteUrl(settings.logo || settings.favicon || "/logo.png", baseUrl);
  const primaryOgImage = resolveAbsoluteUrl(settings.seoDefaults?.ogImage || settings.logo, baseUrl);

  // Configure icons for Google Search, mobile browsers, and Apple touch
  const iconList: any[] = [
    { url: "/favicon.ico", sizes: "any" },
    { url: primaryFavicon || "/favicon.png", type: "image/png" },
    { url: primaryLogo || "/logo.png", sizes: "192x192", type: "image/png" },
    { url: primaryLogo || "/logo.png", sizes: "512x512", type: "image/png" },
  ];

  const appleIcons = [
    { url: primaryLogo || primaryFavicon || "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
  ];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    icons: {
      icon: iconList,
      apple: appleIcons,
      shortcut: ["/favicon.ico"],
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName,
      locale: 'en_US',
      type: 'website',
      images: primaryOgImage ? [primaryOgImage] : primaryLogo ? [primaryLogo] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryOgImage ? [primaryOgImage] : primaryLogo ? [primaryLogo] : [],
    },
    ...(googleVerification ? {
      verification: {
        google: googleVerification,
      },
    } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getCachedSiteSettings();
  const metaPixelId = settings.integrations?.metaPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || "1803684254231950";

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${courierPrime.variable} h-full antialiased overflow-x-hidden w-full max-w-[100vw]`}
      suppressHydrationWarning
    >
      <head>
        {/* Meta Pixel Base Code (Executes immediately in head per Meta official instructions) */}
        {metaPixelId && (
          <>
            <script
              id="meta-pixel-base"
              dangerouslySetInnerHTML={{
                __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${metaPixelId}');fbq('track', 'PageView');`,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        {/* Google Organization & Brand Logo Structured Data */}
        <OrganizationJsonLd settings={settings} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {settings.favicon && <link rel="icon" type="image/png" href={settings.favicon} />}
        {settings.logo && <link rel="icon" type="image/png" sizes="192x192" href={settings.logo} />}
        {settings.logo && <link rel="apple-touch-icon" sizes="180x180" href={settings.logo} />}
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden w-full max-w-[100vw]" suppressHydrationWarning>
        <QueryProvider>
          <AppProviders>
            {children}
          </AppProviders>
        </QueryProvider>
        <Suspense fallback={null}>
          <PreviewInspector />
        </Suspense>
        <Suspense fallback={null}>
          <Analytics
            gaId={settings.integrations?.googleAnalyticsId}
            metaPixelId={settings.integrations?.metaPixelId}
          />
        </Suspense>
      </body>
    </html>
  );
}

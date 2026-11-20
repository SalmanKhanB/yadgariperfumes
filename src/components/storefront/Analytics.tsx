"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackMetaEvent } from "@/lib/analytics/metaPixel";

interface AnalyticsProps {
  gaId?: string;
  metaPixelId?: string;
}

export function Analytics({ gaId, metaPixelId }: AnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use props from DB settings, fallback to environment variables, fallback to default ID
  const GA_MEASUREMENT_ID = gaId || process.env.NEXT_PUBLIC_GA_ID;
  const META_PIXEL_ID = metaPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || "1803684254231950";

  // Track page views on SPA route change for GA4 and Meta Pixel (skipping duplicate initial mount)
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      
      // GA4 Page View
      if (GA_MEASUREMENT_ID && typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("config", GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }

      // Meta Pixel Page View on SPA navigation
      if (META_PIXEL_ID) {
        trackMetaEvent("PageView");
      }
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID, META_PIXEL_ID]);

  return (
    <>
      {/* Google Analytics (GA4) */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
    </>
  );
}

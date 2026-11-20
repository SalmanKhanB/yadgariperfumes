"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export function setGoogleTranslateCookie(lang: "en" | "ar") {
  if (typeof window === "undefined") return;

  if (lang === "en") {
    // Completely clear Google Translate cookies to restore native English page
    const host = window.location.hostname;
    const expires = "Thu, 01 Jan 1970 00:00:00 UTC";
    
    document.cookie = `googtrans=; expires=${expires}; path=/;`;
    document.cookie = `googtrans=/en/en; path=/;`;
    if (host && host.includes(".")) {
      document.cookie = `googtrans=; expires=${expires}; path=/; domain=${host}`;
      document.cookie = `googtrans=; expires=${expires}; path=/; domain=.${host}`;
      document.cookie = `googtrans=/en/en; path=/; domain=${host}`;
      document.cookie = `googtrans=/en/en; path=/; domain=.${host}`;
    }

    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";

    // Trigger dropdown change if present
    const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = "en";
      selectElem.dispatchEvent(new Event("change"));
    }

    // Force clean reload to native English
    window.location.reload();
  } else {
    // Set Arabic translation cookie
    const targetCode = "ar";
    const cookieVal = `/en/${targetCode}`;
    const host = window.location.hostname;

    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (host && host.includes(".")) {
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${host}`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=.${host}`;
    }

    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";

    const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = targetCode;
      selectElem.dispatchEvent(new Event("change"));
    }

    // Force clean reload to Google-translated Arabic page
    window.location.reload();
  }
}

export default function GoogleTranslate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Inject CSS rules to hide Google Translate banner, balloon, and native select box
    if (!document.getElementById("google-translate-hide-styles")) {
      const style = document.createElement("style");
      style.id = "google-translate-hide-styles";
      style.innerHTML = `
        #google_translate_element,
        .goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate,
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .goog-te-gadget,
        .goog-te-combo {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          position: absolute !important;
          left: -9999px !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
      `;
      document.head.appendChild(style);
    }

    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ar,ur,es,fr,de,zh-CN,hi,tr,fa,ms",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    const loadScript = () => {
      if (!document.getElementById("google-translate-js-script")) {
        const script = document.createElement("script");
        script.id = "google-translate-js-script";
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadScript, { timeout: 2000 });
    } else {
      setTimeout(loadScript, 1000);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ display: "none" }} aria-hidden="true" className="notranslate">
      <div id="google_translate_element" />
    </div>
  );
}

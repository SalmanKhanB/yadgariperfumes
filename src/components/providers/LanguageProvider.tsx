"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setGoogleTranslateCookie } from "@/components/ui/GoogleTranslate";

export type Language = "en" | "ar";
export type Direction = "ltr" | "rtl";

type Translations = {
  [key: string]: {
    en: string;
    ar: string;
  };
};

export const dictionary: Translations = {
  home: { en: "Home", ar: "الرئيسية" },
  shop: { en: "Shop", ar: "المتجر" },
  collections: { en: "Collections", ar: "التشكيلات" },
  cart: { en: "Cart", ar: "سلة التسوق" },
  checkout: { en: "Checkout", ar: "إتمام الشراء" },
  search: { en: "Search", ar: "بحث" },
  account: { en: "Account", ar: "حسابي" },
  orders: { en: "Orders", ar: "الطلبات" },
  trackOrder: { en: "Track Order", ar: "تتبع الطلب" },
  subtotal: { en: "Subtotal", ar: "المجموع الفرعي" },
  total: { en: "Total", ar: "المجموع الإجمالي" },
  shipping: { en: "Shipping", ar: "الشحن" },
  freeShipping: { en: "Free Shipping", ar: "شحن مجاني" },
  inStock: { en: "In Stock", ar: "متوفر بالمخزون" },
  outOfStock: { en: "Out of Stock", ar: "غير متوفر" },
  addToCart: { en: "Add to Cart", ar: "أضف إلى السلة" },
  buyNow: { en: "Buy Now", ar: "اشترِ الآن" },
  storeSettings: { en: "Store Settings", ar: "إعدادات المتجر" },
  currency: { en: "Currency", ar: "العملة" },
  language: { en: "Language", ar: "اللغة" },
  english: { en: "English", ar: "الإنجليزي" },
  arabic: { en: "Arabic", ar: "العربي" },
  theme: { en: "Theme", ar: "المظهر" },
  light: { en: "Light", ar: "فاتح" },
  dark: { en: "Dark", ar: "داكن" },
};

type LanguageContextType = {
  language: Language;
  dir: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  dir: "ltr",
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Read saved language preference or default to en
    const savedLang = (localStorage.getItem("store_language") as Language) || "en";
    setLanguageState(savedLang);
    applyLanguage(savedLang);
    if (savedLang === "ar") {
      document.cookie = "googtrans=/en/ar; path=/";
    }
  }, []);

  const applyLanguage = (lang: Language) => {
    const isRtl = lang === "ar";
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    if (isRtl) {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("store_language", lang);
    applyLanguage(lang);
    setGoogleTranslateCookie(lang);
  };

  const t = (key: string, fallback?: string): string => {
    if (dictionary[key] && dictionary[key][language]) {
      return dictionary[key][language];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, dir: language === "ar" ? "rtl" : "ltr", setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

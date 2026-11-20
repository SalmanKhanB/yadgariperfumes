"use server";

import { updateSiteSettings } from "@/server/repositories/siteSettingsRepository";
import { invalidateSiteSettingsCache } from "@/server/cache/siteSettingsCache";
import { revalidatePath } from "next/cache";

export async function updateThemeAction(theme: "cyber" | "swiss" | "organic" | "aurora") {
  try {
    await updateSiteSettings({ activeTheme: theme });
    await invalidateSiteSettingsCache(); // Clear custom node-cache
    revalidatePath("/", "layout"); // Force Next.js to re-render root layout
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateNavigationAction(data: {
  name?: string;
  logo?: string;
  showLogo?: boolean;
  showStoreName?: boolean;
  favicon?: string;
  seoDefaults?: { title: string };
  headerLinks?: { label: string; url: string }[];
  headerStyle?: { layout?: string; backgroundColor?: string; textColor?: string; activeColor?: string; showLogo?: boolean; showStoreName?: boolean };
  footerWidgets?: { title: string; links: { label: string; url: string }[] }[];
  footerStyle?: { layout?: string; backgroundColor?: string; textColor?: string; headingColor?: string };
  footerCopyright?: string;
  footerLinks?: { label: string; url: string }[];
}) {
  try {
    await updateSiteSettings(data as any);
    await invalidateSiteSettingsCache();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

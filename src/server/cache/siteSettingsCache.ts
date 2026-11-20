import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { getSiteSettings } from "../repositories/siteSettingsRepository";
import { ISiteSettings } from "../db/models/SiteSettings";
import { clearAllCache } from "./nodeCache";

const CACHE_KEY = "global:site-settings";

export const getCachedSiteSettings = unstable_cache(
  async (): Promise<ISiteSettings> => {
    const settings = await getSiteSettings();
    return JSON.parse(JSON.stringify(settings));
  },
  [CACHE_KEY],
  {
    tags: ["site-settings", "settings"],
    revalidate: 86400 // 24 hours (invalidated on-demand when edited in admin)
  }
);

export async function invalidateSiteSettingsCache() {
  try {
    clearAllCache();
    revalidateTag("site-settings", "max");
    revalidateTag("settings", "max");
    revalidatePath("/", "layout");
  } catch (e) {
    // ignore
  }
}

import connectToDatabase from "../db/mongoose";
import SiteSettings, { ISiteSettings } from "../db/models/SiteSettings";
import { getCachedData, invalidateCache } from "../cache/nodeCache";

const SITE_SETTINGS_CACHE_KEY = "site_settings";

export async function getSiteSettings(uncached = false): Promise<ISiteSettings> {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Yaadgari perfumes";
  const defaultObj = {
    name: siteName,
    themeColors: { primary: "#000000", secondary: "#ffffff" },
    contact: { email: "support@sqodex.com" },
    seoDefaults: { title: siteName, description: "Best products" },
    activeTheme: "aurora",
    currency: "USD",
  } as ISiteSettings;

  const loadSettings = async (): Promise<ISiteSettings> => {
    try {
      await connectToDatabase();
      let settings = await SiteSettings.findOne({}).lean<ISiteSettings>();

      if (!settings) {
        const defaultSettings = new SiteSettings(defaultObj);
        await defaultSettings.save();
        return defaultSettings.toObject() as ISiteSettings;
      }

      return settings;
    } catch (error) {
      console.warn("MongoDB connection failed in getSiteSettings. Using default settings fallback.");
      return defaultObj;
    }
  };

  if (uncached) return loadSettings();
  return getCachedData(SITE_SETTINGS_CACHE_KEY, loadSettings, process.env.NODE_ENV === "production" ? 60 : 2);
}

export async function updateSiteSettings(data: Partial<ISiteSettings>): Promise<ISiteSettings | null> {
  await connectToDatabase();
  let settings = await SiteSettings.findOne({});
  let result: ISiteSettings | null = null;
  if (!settings) {
    settings = new SiteSettings(data);
    await settings.save();
    result = settings.toObject() as ISiteSettings;
  } else {
    // Construct $set object with dot notation for nested properties to avoid accidental overwrites
    const setObj: Record<string, any> = {};
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        Object.entries(val).forEach(([subKey, subVal]) => {
          if (subVal !== undefined) {
            setObj[`${key}.${subKey}`] = subVal;
          }
        });
      } else if (val !== undefined) {
        setObj[key] = val;
      }
    });

    result = await SiteSettings.findByIdAndUpdate(settings._id, { $set: setObj }, { returnDocument: 'after', runValidators: true }).lean();
  }

  invalidateCache(SITE_SETTINGS_CACHE_KEY);
  return result;
}


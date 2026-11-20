import connectToDatabase from "../db/mongoose";
import HeroBlock, { IHeroBlock } from "../db/models/HeroBlock";
import { getCachedData, invalidateCache } from "../cache/nodeCache";

const HERO_CACHE_KEY = "hero_block";

export async function getHeroBlock(): Promise<IHeroBlock> {
  const defaultObj = {
    title: "Welcome to Sqodex",
    subtitle: "The ultimate shopping experience",
    cta: { text: "Shop Now", link: "/products" },
    layout: "center",
    background: "#f3f4f6",
  } as IHeroBlock;

  return getCachedData(HERO_CACHE_KEY, async () => {
    try {
      await connectToDatabase();
      let hero = await HeroBlock.findOne({}).lean<IHeroBlock>();

      if (!hero) {
        const defaultHero = new HeroBlock(defaultObj);
        await defaultHero.save();
        return defaultHero.toObject() as IHeroBlock;
      }

      return hero;
    } catch (error) {
      console.warn("MongoDB connection failed in getHeroBlock. Returning default hero fallback.");
      return defaultObj;
    }
  }, 1800);
}

export async function updateHeroBlock(data: Partial<IHeroBlock>): Promise<IHeroBlock | null> {
  await connectToDatabase();
  const hero = await HeroBlock.findOne({});
  if (!hero) return null;
  const result = await HeroBlock.findByIdAndUpdate(hero._id, data, { returnDocument: 'after' }).lean();
  invalidateCache(HERO_CACHE_KEY);
  return result;
}


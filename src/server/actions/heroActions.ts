"use server";

import { revalidateTag } from "next/cache";
import { getHeroBlock, updateHeroBlock } from "../repositories/heroRepository";
import { IHeroBlock } from "../db/models/HeroBlock";

export async function fetchHeroBlockAction() {
  try {
    const hero = await getHeroBlock();
    return { success: true, data: JSON.parse(JSON.stringify(hero)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateHeroBlockAction(data: Partial<IHeroBlock>) {
  try {
    const hero = await updateHeroBlock(data);
    revalidateTag("hero-block", "max");
    return { success: true, data: JSON.parse(JSON.stringify(hero)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

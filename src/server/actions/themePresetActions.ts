"use server";

import { getThemePresets, createThemePreset, deleteThemePreset } from "../repositories/themePresetRepository";
import { revalidateTag } from "next/cache";

export async function fetchThemePresetsAction() {
  try {
    const presets = await getThemePresets();
    return { success: true, data: JSON.parse(JSON.stringify(presets)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createThemePresetAction(data: any) {
  try {
    const preset = await createThemePreset(data);
    revalidateTag("theme-presets", "max");
    return { success: true, data: JSON.parse(JSON.stringify(preset)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteThemePresetAction(id: string) {
  try {
    await deleteThemePreset(id);
    revalidateTag("theme-presets", "max");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

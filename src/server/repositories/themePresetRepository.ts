import connectToDatabase from "../db/mongoose";
import ThemePreset, { IThemePreset } from "../db/models/ThemePreset";

export async function getThemePresets(): Promise<IThemePreset[]> {
  await connectToDatabase();
  return await ThemePreset.find({}).sort({ createdAt: -1 }).lean();
}

export async function createThemePreset(data: Partial<IThemePreset>): Promise<IThemePreset> {
  await connectToDatabase();
  const preset = new ThemePreset(data);
  await preset.save();
  return preset.toObject() as IThemePreset;
}

export async function deleteThemePreset(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await ThemePreset.findByIdAndDelete(id);
  return !!res;
}

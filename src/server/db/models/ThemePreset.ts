import mongoose, { Schema, Document, Model } from "mongoose";

export interface IThemePreset extends Document {
  name: string;
  baseTheme: string;
  themeColors: {
    primary: string;
    secondary: string;
    text: string;
    accent: string;
    background: string;
  };
  customCSSVars?: Record<string, string>;
}

const ThemePresetSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    baseTheme: { type: String, required: true },
    themeColors: {
      primary: { type: String, required: true },
      secondary: { type: String, required: true },
      text: { type: String, required: true },
      accent: { type: String, required: true },
      background: { type: String, required: true },
    },
    customCSSVars: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const ThemePreset: Model<IThemePreset> =
  mongoose.models.ThemePreset || mongoose.model<IThemePreset>("ThemePreset", ThemePresetSchema);

export default ThemePreset;

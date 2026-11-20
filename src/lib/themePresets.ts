export interface ThemeColorPalette {
  primary: string;
  secondary: string;
  text: string;
  accent: string;
  background: string;
  customCSS?: string;
}

export const THEME_PRESETS: Record<string, ThemeColorPalette> = {
  aurora: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    text: "#f4f4f5",
    accent: "#14b8a6",
    background: "#09090b",
    customCSS: `
      --aurora-glow-1: #3b82f6;
      --aurora-glow-2: #8b5cf6;
    `,
  },
  cyber: {
    primary: "#00ff00",
    secondary: "#ff00ff",
    text: "#ffffff",
    accent: "#00ffff",
    background: "#000000",
    customCSS: `
      --cyber-neon-1: #00ff00;
    `,
  },
  swiss: {
    primary: "#ff0000",
    secondary: "#111111",
    text: "#000000",
    accent: "#ff0000",
    background: "#ffffff",
    customCSS: `
      --swiss-radius: 0px;
    `,
  },
  organic: {
    primary: "#1b4332",
    secondary: "#52b788",
    text: "#2d3748",
    accent: "#d8f3dc",
    background: "#f4f7f6",
  },
  editorial: {
    primary: "#000000",
    secondary: "#7f8c8d",
    text: "#1c1c1c",
    accent: "#000000",
    background: "#faf8f5",
  },
  "grid-matrix": {
    primary: "#333333",
    secondary: "#888888",
    text: "#d1d5db",
    accent: "#555555",
    background: "#0d0e12",
  },
  luxury: {
    primary: "#b89047",
    secondary: "#121212",
    text: "#f5f5f5",
    accent: "#b89047",
    background: "#0a0a0a",
  },
  glassmorphism: {
    primary: "#000000",
    secondary: "#3b82f6",
    text: "#0f172a",
    accent: "#3b82f6",
    background: "#f8fafc",
  },
  neumorphic: {
    primary: "#0f172a",
    secondary: "#64748b",
    text: "#333333",
    accent: "#3b82f6",
    background: "#e0e0e0",
  },
  pop: {
    primary: "#ff5a5f",
    secondary: "#ffb400",
    text: "#000000",
    accent: "#007a87",
    background: "#ffffff",
  },
};

"use client";

import { useState, useTransition } from "react";
import { updateThemeAction } from "../actions";
import { Check, Loader2, Sparkles, Droplets, Grid, Mountain } from "lucide-react";

type Theme = "cyber" | "swiss" | "organic" | "aurora";

const themes: { id: Theme; name: string; description: string; icon: any; colors: string[] }[] = [
  {
    id: "aurora",
    name: "Aurora UI",
    description: "Vibrant, glowing, glassmorphic design.",
    icon: Sparkles,
    colors: ["bg-pink-500", "bg-purple-500", "bg-indigo-500"],
  },
  {
    id: "cyber",
    name: "Cyber Luxury",
    description: "Liquid dark mode with neon accents.",
    icon: Droplets,
    colors: ["bg-black", "bg-purple-600", "bg-cyan-400"],
  },
  {
    id: "swiss",
    name: "Swiss Brutalism",
    description: "High-contrast monochrome, sharp edges.",
    icon: Grid,
    colors: ["bg-white", "bg-gray-400", "bg-black"],
  },
  {
    id: "organic",
    name: "Organic Neumorphism",
    description: "Warm earthy tones, soft shadows.",
    icon: Mountain,
    colors: ["bg-stone-200", "bg-orange-900", "bg-green-700"],
  },
];

export default function ThemeSwitcher({ initialTheme }: { initialTheme: Theme }) {
  const [activeTheme, setActiveTheme] = useState<Theme>(initialTheme || "aurora");
  const [isPending, startTransition] = useTransition();

  const handleThemeChange = (theme: Theme) => {
    setActiveTheme(theme);
    // Apply locally to HTML tag immediately for preview
    document.documentElement.setAttribute('data-theme', theme);
    
    startTransition(async () => {
      await updateThemeAction(theme);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Storefront Theme</h2>
        <p className="text-sm text-muted-foreground">Select the global aesthetic for your storefront. Changes apply instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isActive = activeTheme === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              disabled={isPending}
              className={`
                relative flex flex-col items-start p-6 rounded-xl border text-left transition-all duration-300
                ${isActive ? "border-primary bg-primary/5 shadow-md scale-[1.02]" : "border-border glass-card hover:bg-accent/5 hover:border-accent/50"}
                ${isPending ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <div className="flex w-full items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon size={24} />
                </div>
                {isActive && (
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                    <Check size={16} /> Active
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-lg mb-1">{theme.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{theme.description}</p>
              
              <div className="flex gap-2 mt-auto">
                {theme.colors.map((color, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full border border-border/50 ${color}`} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
      
      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 animate-pulse">
          <Loader2 className="animate-spin" size={16} /> Saving globally...
        </div>
      )}
    </div>
  );
}

import { ThemeConfig } from "./types";

export const themes: ThemeConfig[] = [
  {
    id: "dark-minimal",
    name: "暗黑极简",
    colors: {
      background: "#0a0a0a",
      foreground: "#ededed",
      accent: "#6366f1",
      card: "#171717",
      cardText: "#ededed",
      border: "#262626",
      muted: "#737373",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    spacing: {
      sectionGap: 120,
      cardGap: 24,
      cardRadius: 16,
    },
  },
  {
    id: "light-clean",
    name: "明亮干净",
    colors: {
      background: "#fafafa",
      foreground: "#18181b",
      accent: "#2563eb",
      card: "#ffffff",
      cardText: "#18181b",
      border: "#e4e4e7",
      muted: "#71717a",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    spacing: {
      sectionGap: 100,
      cardGap: 20,
      cardRadius: 12,
    },
  },
  {
    id: "gradient-colorful",
    name: "渐变彩色",
    colors: {
      background: "#030712",
      foreground: "#f9fafb",
      accent: "#f472b6",
      card: "#111827",
      cardText: "#f9fafb",
      border: "#374151",
      muted: "#9ca3af",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
    },
    spacing: {
      sectionGap: 140,
      cardGap: 28,
      cardRadius: 20,
    },
  },
  {
    id: "magazine",
    name: "杂志风",
    colors: {
      background: "#fdfcf8",
      foreground: "#1c1917",
      accent: "#dc2626",
      card: "#ffffff",
      cardText: "#1c1917",
      border: "#d6d3d1",
      muted: "#78716c",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Source Serif 4",
    },
    spacing: {
      sectionGap: 80,
      cardGap: 16,
      cardRadius: 4,
    },
  },
  {
    id: "retro",
    name: "复古暖调",
    colors: {
      background: "#292524",
      foreground: "#fef3c7",
      accent: "#f59e0b",
      card: "#44403c",
      cardText: "#fef3c7",
      border: "#57534e",
      muted: "#a8a29e",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Space Grotesk",
    },
    spacing: {
      sectionGap: 100,
      cardGap: 22,
      cardRadius: 8,
    },
  },
  {
    id: "neon",
    name: "霓虹未来",
    colors: {
      background: "#0c0a09",
      foreground: "#ecfeff",
      accent: "#22d3ee",
      card: "#0f172a",
      cardText: "#ecfeff",
      border: "#164e63",
      muted: "#67e8f9",
    },
    fonts: {
      heading: "Orbitron",
      body: "Rajdhani",
    },
    spacing: {
      sectionGap: 110,
      cardGap: 24,
      cardRadius: 2,
    },
  },
];

export function getTheme(id: string): ThemeConfig {
  return themes.find((t) => t.id === id) || themes[0];
}

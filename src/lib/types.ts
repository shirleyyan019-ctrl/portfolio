export interface PortfolioData {
  sections: Section[];
  personalInfo: PersonalInfo;
  theme: ThemeConfig;
}

export interface Section {
  id: string;
  title: Record<string, string>;
  visible: boolean;
  works: Work[];
}

export interface Work {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  type: "image" | "video" | "animation";
  url: string;
  backUrl?: string;  // 翻转效果的背面图片
  thumbnailUrl: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  cardEffect: "flip" | "float" | "tilt";
}

export interface PersonalInfo {
  name: Record<string, string>;
  title: Record<string, string>;
  bio: Record<string, string>;
  avatar: string;
  coverImage: string;
  contact: {
    email: string;
    website: string;
    social: { platform: string; url: string }[];
  };
}

export interface ThemeColors {
  background: string;
  foreground: string;
  accent: string;
  card: string;
  cardText: string;
  border: string;
  muted: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    sectionGap: number;
    cardGap: number;
    cardRadius: number;
  };
}

export type EditorTool =
  | "select"
  | "move"
  | "addImage"
  | "addText"
  | "addSection";

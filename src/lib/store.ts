import { PortfolioData, Work, Section, ThemeConfig, EditorTool } from "./types";
import { getTheme } from "./themes";
import { create } from "zustand";

const defaultPortfolio: PortfolioData = {
  sections: [
    {
      id: "brand",
      title: { zh: "品牌设计", en: "Brand Design" },
      visible: true,
      works: [],
    },
    {
      id: "illustration",
      title: { zh: "插画作品", en: "Illustration" },
      visible: true,
      works: [],
    },
    {
      id: "ui",
      title: { zh: "UI设计", en: "UI Design" },
      visible: true,
      works: [],
    },
  ],
  personalInfo: {
    name: { zh: "你的名字", en: "Your Name" },
    title: { zh: "数字媒体艺术创作者", en: "Digital Media Artist" },
    bio: {
      zh: "在这里写一段关于你自己的介绍...",
      en: "Write something about yourself here...",
    },
    avatar: "",
    coverImage: "",
    contact: {
      email: "",
      website: "",
      social: [],
    },
  },
  theme: getTheme("dark-minimal"),
};

interface PortfolioStore {
  // Data
  portfolio: PortfolioData;
  language: "zh" | "en";

  // Editor state
  isEditing: boolean;
  isAuthenticated: boolean;
  selectedWorkId: string | null;
  selectedSectionId: string | null;
  activeTool: EditorTool;
  editorSidebar: "sections" | "theme" | "personal" | "properties" | null;
  isShareModalOpen: boolean;
  isPreviewMode: boolean;

  // History
  history: PortfolioData[];
  historyIndex: number;

  // Actions
  setLanguage: (lang: "zh" | "en") => void;
  login: (password: string) => boolean;
  logout: () => void;
  setEditing: (editing: boolean) => void;

  // Portfolio actions
  updatePortfolio: (data: Partial<PortfolioData>) => void;
  setTheme: (themeId: string) => void;
  updateThemeColors: (colors: Partial<ThemeConfig["colors"]>) => void;

  // Section actions
  addSection: (title: Record<string, string>) => void;
  updateSection: (id: string, data: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  reorderSections: (sections: Section[]) => void;

  // Work actions
  addWork: (sectionId: string, work: Work) => void;
  updateWork: (sectionId: string, workId: string, data: Partial<Work>) => void;
  deleteWork: (sectionId: string, workId: string) => void;

  // Personal info
  updatePersonalInfo: (data: Partial<PortfolioData["personalInfo"]>) => void;

  // Editor UI
  selectWork: (workId: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  setActiveTool: (tool: EditorTool) => void;
  setEditorSidebar: (
    panel: "sections" | "theme" | "personal" | "properties" | null
  ) => void;
  setShareModalOpen: (open: boolean) => void;
  setPreviewMode: (preview: boolean) => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Load
  loadPortfolio: (data: PortfolioData) => void;
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  portfolio: defaultPortfolio,
  language: "zh",
  isEditing: false,
  isAuthenticated: false,
  selectedWorkId: null,
  selectedSectionId: null,
  activeTool: "select",
  editorSidebar: "sections",
  isShareModalOpen: false,
  isPreviewMode: false,
  history: [defaultPortfolio],
  historyIndex: 0,

  setLanguage: (lang) => set({ language: lang }),

  login: (password) => {
    if (password === "portfolio2024") {
      set({ isAuthenticated: true, isEditing: true });
      return true;
    }
    return false;
  },

  logout: () => set({ isAuthenticated: false, isEditing: false }),

  setEditing: (editing) => set({ isEditing: editing }),

  updatePortfolio: (data) => {
    const state = get();
    const newPortfolio = { ...state.portfolio, ...data };
    set({ portfolio: newPortfolio });
    state.pushHistory();
  },

  setTheme: (themeId) => {
    const theme = getTheme(themeId);
    const state = get();
    set({ portfolio: { ...state.portfolio, theme } });
    state.pushHistory();
  },

  updateThemeColors: (colors) => {
    const state = get();
    const newTheme = {
      ...state.portfolio.theme,
      colors: { ...state.portfolio.theme.colors, ...colors },
    };
    set({ portfolio: { ...state.portfolio, theme: newTheme } });
  },

  addSection: (title) => {
    const state = get();
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title,
      visible: true,
      works: [],
    };
    const newPortfolio = {
      ...state.portfolio,
      sections: [...state.portfolio.sections, newSection],
    };
    set({ portfolio: newPortfolio });
    state.pushHistory();
  },

  updateSection: (id, data) => {
    const state = get();
    const newSections = state.portfolio.sections.map((s) =>
      s.id === id ? { ...s, ...data } : s
    );
    set({ portfolio: { ...state.portfolio, sections: newSections } });
  },

  deleteSection: (id) => {
    const state = get();
    const newSections = state.portfolio.sections.filter((s) => s.id !== id);
    set({ portfolio: { ...state.portfolio, sections: newSections } });
    state.pushHistory();
  },

  reorderSections: (sections) => {
    const state = get();
    set({ portfolio: { ...state.portfolio, sections } });
  },

  addWork: (sectionId, work) => {
    const state = get();
    const newSections = state.portfolio.sections.map((s) =>
      s.id === sectionId ? { ...s, works: [...s.works, work] } : s
    );
    set({ portfolio: { ...state.portfolio, sections: newSections } });
    state.pushHistory();
  },

  updateWork: (sectionId, workId, data) => {
    const state = get();
    const newSections = state.portfolio.sections.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            works: s.works.map((w) =>
              w.id === workId ? { ...w, ...data } : w
            ),
          }
        : s
    );
    set({ portfolio: { ...state.portfolio, sections: newSections } });
  },

  deleteWork: (sectionId, workId) => {
    const state = get();
    const newSections = state.portfolio.sections.map((s) =>
      s.id === sectionId
        ? { ...s, works: s.works.filter((w) => w.id !== workId) }
        : s
    );
    set({ portfolio: { ...state.portfolio, sections: newSections } });
    state.pushHistory();
  },

  updatePersonalInfo: (data) => {
    const state = get();
    const newPersonal = { ...state.portfolio.personalInfo, ...data };
    set({ portfolio: { ...state.portfolio, personalInfo: newPersonal } });
  },

  selectWork: (workId) => set({ selectedWorkId: workId }),
  selectSection: (sectionId) => set({ selectedSectionId: sectionId }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setEditorSidebar: (panel) => set({ editorSidebar: panel }),
  setShareModalOpen: (open) => set({ isShareModalOpen: open }),
  setPreviewMode: (preview) => set({ isPreviewMode: preview }),

  pushHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(state.portfolio);
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        portfolio: state.history[newIndex],
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        portfolio: state.history[newIndex],
        historyIndex: newIndex,
      });
    }
  },

  loadPortfolio: (data) => set({ portfolio: data, history: [data], historyIndex: 0 }),
}));

"use client";

import { usePortfolioStore } from "@/lib/store";
import {
  MousePointer2,
  Move,
  Image,
  Type,
  Undo2,
  Redo2,
  Eye,
  Share2,
  LogOut,
  Globe,
  Save,
} from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";

interface EditorToolbarProps {
  onSave?: () => void;
}

export default function EditorToolbar({ onSave }: EditorToolbarProps) {
  const {
    portfolio,
    language,
    activeTool,
    setActiveTool,
    historyIndex,
    history,
    undo,
    redo,
    setLanguage,
    setShareModalOpen,
    setPreviewMode,
    logout,
    isAuthenticated,
  } = usePortfolioStore();

  const { theme } = portfolio;
  const tools = [
    { id: "select" as const, icon: MousePointer2, label: language === "zh" ? "选择" : "Select" },
    { id: "move" as const, icon: Move, label: language === "zh" ? "移动" : "Move" },
  ];

  return (
    <div
      className="h-16 flex items-center justify-between px-4"
      style={{
        backgroundColor: theme.colors.card,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* Left: Logo & Tools */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-lg font-bold"
          style={{ color: theme.colors.foreground }}
        >
          Portfolio
        </Link>

        <div
          className="h-6 w-px"
          style={{ backgroundColor: theme.colors.border }}
        />

        {/* Tools */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                activeTool === tool.id && "ring-2"
              )}
              style={{
                backgroundColor:
                  activeTool === tool.id
                    ? `${theme.colors.accent}20`
                    : "transparent",
                color:
                  activeTool === tool.id
                    ? theme.colors.accent
                    : theme.colors.muted,
                border: activeTool === tool.id
                  ? `2px solid ${theme.colors.accent}`
                  : 'none',
              }}
              title={tool.label}
            >
              <tool.icon size={18} />
            </button>
          ))}

          <div
            className="h-6 w-px mx-2"
            style={{ backgroundColor: theme.colors.border }}
          />

          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg transition-colors disabled:opacity-30"
            style={{ color: theme.colors.muted }}
            title={language === "zh" ? "撤销" : "Undo"}
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg transition-colors disabled:opacity-30"
            style={{ color: theme.colors.muted }}
            title={language === "zh" ? "重做" : "Redo"}
          >
            <Redo2 size={18} />
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language */}
        <button
          onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            color: theme.colors.muted,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <Globe size={14} />
          {language === "zh" ? "EN" : "中"}
        </button>

        {/* Preview */}
        <button
          onClick={() => setPreviewMode(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            color: theme.colors.muted,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <Eye size={14} />
          {language === "zh" ? "预览" : "Preview"}
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{
            backgroundColor: theme.colors.accent,
            color: "#fff",
          }}
        >
          <Save size={14} />
          {language === "zh" ? "保存" : "Save"}
        </button>

        {/* Share */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            color: theme.colors.muted,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <Share2 size={14} />
          {language === "zh" ? "分享" : "Share"}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            color: theme.colors.muted,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { usePortfolioStore } from "@/lib/store";
import { themes } from "@/lib/themes";
import {
  Layers,
  Palette,
  User,
  Settings,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface EditorSidebarProps {
  onWorkSelect?: (workId: string | null) => void;
}

export default function EditorSidebar({ onWorkSelect }: EditorSidebarProps) {
  const {
    portfolio,
    language,
    selectedWorkId,
    selectedSectionId,
    editorSidebar,
    setEditorSidebar,
    selectSection,
    addSection,
    updateSection,
    deleteSection,
    setTheme,
    addWork,
    updateWork,
    deleteWork,
  } = usePortfolioStore();

  const [newSectionTitle, setNewSectionTitle] = useState({ zh: "", en: "" });
  const [showAddSection, setShowAddSection] = useState(false);

  const { sections, theme } = portfolio;

  const tabs = [
    { id: "sections" as const, icon: Layers, label: language === "zh" ? "板块" : "Sections" },
    { id: "theme" as const, icon: Palette, label: language === "zh" ? "主题" : "Theme" },
    { id: "personal" as const, icon: User, label: language === "zh" ? "个人信息" : "Personal" },
  ];

  return (
    <div
      className="w-80 h-full flex flex-col"
      style={{
        backgroundColor: theme.colors.card,
        borderRight: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* Tabs */}
      <div
        className="flex border-b"
        style={{ borderColor: theme.colors.border }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setEditorSidebar(editorSidebar === tab.id ? null : tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors",
              editorSidebar === tab.id && "border-b-2"
            )}
            style={{
              color: editorSidebar === tab.id ? theme.colors.accent : theme.colors.muted,
              borderColor: editorSidebar === tab.id ? theme.colors.accent : "transparent",
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {/* Sections Panel */}
        {editorSidebar === "sections" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">
                {language === "zh" ? "板块管理" : "Manage Sections"}
              </h3>
              <button
                onClick={() => setShowAddSection(true)}
                className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{ backgroundColor: theme.colors.accent, color: "#fff" }}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add section form */}
            {showAddSection && (
              <div
                className="p-3 rounded-xl space-y-2 mb-4"
                style={{
                  backgroundColor: theme.colors.background,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <input
                  type="text"
                  placeholder={language === "zh" ? "中文标题" : "Chinese Title"}
                  value={newSectionTitle.zh}
                  onChange={(e) =>
                    setNewSectionTitle({ ...newSectionTitle, zh: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{
                    backgroundColor: theme.colors.card,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
                <input
                  type="text"
                  placeholder={language === "zh" ? "英文标题" : "English Title"}
                  value={newSectionTitle.en}
                  onChange={(e) =>
                    setNewSectionTitle({ ...newSectionTitle, en: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{
                    backgroundColor: theme.colors.card,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (newSectionTitle.zh || newSectionTitle.en) {
                        addSection({
                          zh: newSectionTitle.zh,
                          en: newSectionTitle.en,
                        });
                        setNewSectionTitle({ zh: "", en: "" });
                        setShowAddSection(false);
                      }
                    }}
                    className="flex-1 py-2 text-sm rounded-lg transition-opacity hover:opacity-80"
                    style={{ backgroundColor: theme.colors.accent, color: "#fff" }}
                  >
                    {language === "zh" ? "添加" : "Add"}
                  </button>
                  <button
                    onClick={() => setShowAddSection(false)}
                    className="px-4 py-2 text-sm rounded-lg transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: theme.colors.background,
                      color: theme.colors.muted,
                    }}
                  >
                    {language === "zh" ? "取消" : "Cancel"}
                  </button>
                </div>
              </div>
            )}

            {/* Section list */}
            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={cn(
                    "p-3 rounded-xl transition-colors cursor-pointer",
                    selectedSectionId === section.id && "ring-2"
                  )}
                  style={{
                    backgroundColor: theme.colors.background,
                    border: `1px solid ${
                      selectedSectionId === section.id
                        ? theme.colors.accent
                        : theme.colors.border
                    }`,
                  }}
                  onClick={() => selectSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical
                        size={14}
                        style={{ color: theme.colors.muted }}
                        className="drag-handle"
                      />
                      <span
                        className="font-medium text-sm"
                        style={{ color: theme.colors.foreground }}
                      >
                        {section.title[language] || section.title.zh}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSection(section.id, { visible: !section.visible });
                        }}
                        className="p-1 rounded transition-colors hover:opacity-70"
                        style={{ color: theme.colors.muted }}
                      >
                        {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section.id);
                        }}
                        className="p-1 rounded transition-colors hover:opacity-70"
                        style={{ color: "#ef4444" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p
                    className="text-xs mt-1 ml-6"
                    style={{ color: theme.colors.muted }}
                  >
                    {language === "zh"
                      ? `${section.works.length} 个作品`
                      : `${section.works.length} works`}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Theme Panel */}
        {editorSidebar === "theme" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-sm mb-4">
              {language === "zh" ? "选择主题" : "Choose Theme"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "p-3 rounded-xl text-left transition-all hover:scale-[1.02]",
                    theme.id === t.id && "ring-2"
                  )}
                  style={{
                    backgroundColor: t.colors.background,
                    border: `2px solid ${
                      theme.id === t.id ? t.colors.accent : t.colors.border
                    }`,
                  }}
                >
                  <div
                    className="h-12 rounded-lg mb-2 flex items-end p-2 gap-1"
                    style={{ backgroundColor: t.colors.card }}
                  >
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: t.colors.accent }}
                    />
                    <div
                      className="w-4 h-6 rounded"
                      style={{ backgroundColor: t.colors.foreground }}
                    />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: t.colors.muted }}
                    />
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: t.colors.foreground }}
                  >
                    {t.name}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Personal Info Panel */}
        {editorSidebar === "personal" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-sm mb-4">
              {language === "zh" ? "个人信息" : "Personal Info"}
            </h3>
            <div className="space-y-3">
              <div>
                <label
                  className="text-xs mb-1 block"
                  style={{ color: theme.colors.muted }}
                >
                  {language === "zh" ? "名称" : "Name"}
                </label>
                <input
                  type="text"
                  value={portfolio.personalInfo.name[language] || ""}
                  onChange={(e) =>
                    usePortfolioStore.getState().updatePersonalInfo({
                      name: { ...portfolio.personalInfo.name, [language]: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{
                    backgroundColor: theme.colors.background,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
              </div>
              <div>
                <label
                  className="text-xs mb-1 block"
                  style={{ color: theme.colors.muted }}
                >
                  {language === "zh" ? "头衔" : "Title"}
                </label>
                <input
                  type="text"
                  value={portfolio.personalInfo.title[language] || ""}
                  onChange={(e) =>
                    usePortfolioStore.getState().updatePersonalInfo({
                      title: { ...portfolio.personalInfo.title, [language]: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{
                    backgroundColor: theme.colors.background,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
              </div>
              <div>
                <label
                  className="text-xs mb-1 block"
                  style={{ color: theme.colors.muted }}
                >
                  {language === "zh" ? "简介" : "Bio"}
                </label>
                <textarea
                  value={portfolio.personalInfo.bio[language] || ""}
                  onChange={(e) =>
                    usePortfolioStore.getState().updatePersonalInfo({
                      bio: { ...portfolio.personalInfo.bio, [language]: e.target.value },
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none resize-none"
                  style={{
                    backgroundColor: theme.colors.background,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
              </div>
              <div>
                <label
                  className="text-xs mb-1 block"
                  style={{ color: theme.colors.muted }}
                >
                  {language === "zh" ? "邮箱" : "Email"}
                </label>
                <input
                  type="email"
                  value={portfolio.personalInfo.contact.email}
                  onChange={(e) =>
                    usePortfolioStore.getState().updatePersonalInfo({
                      contact: {
                        ...portfolio.personalInfo.contact,
                        email: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{
                    backgroundColor: theme.colors.background,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Properties Panel (when work is selected) */}
        {editorSidebar !== "properties" && selectedWorkId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-4"
            style={{ borderTop: `1px solid ${theme.colors.border}` }}
          >
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Settings size={14} />
              {language === "zh" ? "选中作品属性" : "Selected Work Properties"}
            </h3>
            {(() => {
              let work = null;
              let sectionId = "";
              for (const s of sections) {
                const w = s.works.find((w) => w.id === selectedWorkId);
                if (w) {
                  work = w;
                  sectionId = s.id;
                  break;
                }
              }
              if (!work) return null;
              return (
                <div className="space-y-4">
                  {/* Size controls */}
                  <div>
                    <label className="text-xs mb-2 block" style={{ color: theme.colors.muted }}>
                      {language === "zh" ? "尺寸调整" : "Size Adjustment"}
                    </label>
                    <div className="space-y-3">
                      {/* Width */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: theme.colors.muted }}>
                            {language === "zh" ? "宽度" : "Width"}
                          </span>
                          <span style={{ color: theme.colors.foreground }}>
                            {work.size.width}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="600"
                          value={work.size.width}
                          onChange={(e) =>
                            updateWork(sectionId, work!.id, {
                              size: { ...work!.size, width: parseInt(e.target.value) },
                            })
                          }
                          className="w-full"
                          style={{ accentColor: theme.colors.accent }}
                        />
                      </div>
                      {/* Height */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: theme.colors.muted }}>
                            {language === "zh" ? "高度" : "Height"}
                          </span>
                          <span style={{ color: theme.colors.foreground }}>
                            {work.size.height}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="600"
                          value={work.size.height}
                          onChange={(e) =>
                            updateWork(sectionId, work!.id, {
                              size: { ...work!.size, height: parseInt(e.target.value) },
                            })
                          }
                          className="w-full"
                          style={{ accentColor: theme.colors.accent }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>
                      {language === "zh" ? "卡片效果" : "Card Effect"}
                    </label>
                    <select
                      value={work.cardEffect}
                      onChange={(e) =>
                        updateWork(sectionId, work!.id, {
                          cardEffect: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                      style={{
                        backgroundColor: theme.colors.background,
                        color: theme.colors.foreground,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      <option value="flip">{language === "zh" ? "翻转" : "Flip"}</option>
                      <option value="float">{language === "zh" ? "悬浮" : "Float"}</option>
                      <option value="tilt">{language === "zh" ? "倾斜" : "Tilt"}</option>
                    </select>
                  </div>
                  <button
                    onClick={() => deleteWork(sectionId, work!.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 size={14} />
                    {language === "zh" ? "删除作品" : "Delete Work"}
                  </button>
                </div>
              );
            })()}
          </motion.div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { usePortfolioStore } from "@/lib/store";
import { themes } from "@/lib/themes";
import {
  Layers,
  Palette,
  User,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
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
    updateWork,
    deleteWork,
  } = usePortfolioStore();

  const [newSectionTitle, setNewSectionTitle] = useState({ zh: "", en: "" });
  const [showAddSection, setShowAddSection] = useState(false);

  const { sections, theme } = portfolio;

  // Find selected work and its section
  const { selectedWork, selectedWorkSectionId } = useMemo(() => {
    if (!selectedWorkId) return { selectedWork: null, selectedWorkSectionId: null };
    for (const section of sections) {
      const work = section.works.find(w => w.id === selectedWorkId);
      if (work) {
        return { selectedWork: work, selectedWorkSectionId: section.id };
      }
    }
    return { selectedWork: null, selectedWorkSectionId: null };
  }, [selectedWorkId, sections]);

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
      <div className="flex border-b" style={{ borderColor: theme.colors.border }}>
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Sections Panel */}
        {editorSidebar === "sections" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                {language === "zh" ? "板块管理" : "Manage Sections"}
              </h3>
              <button
                onClick={() => setShowAddSection(true)}
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: theme.colors.accent, color: "#fff" }}
              >
                <Plus size={16} />
              </button>
            </div>

            {showAddSection && (
              <div className="p-3 rounded-xl space-y-2" style={{ backgroundColor: theme.colors.background }}>
                <input
                  type="text"
                  placeholder={language === "zh" ? "中文标题" : "Chinese Title"}
                  value={newSectionTitle.zh}
                  onChange={(e) => setNewSectionTitle({ ...newSectionTitle, zh: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{ backgroundColor: theme.colors.card, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                />
                <input
                  type="text"
                  placeholder={language === "zh" ? "英文标题" : "English Title"}
                  value={newSectionTitle.en}
                  onChange={(e) => setNewSectionTitle({ ...newSectionTitle, en: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{ backgroundColor: theme.colors.card, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (newSectionTitle.zh || newSectionTitle.en) {
                        addSection({ zh: newSectionTitle.zh, en: newSectionTitle.en });
                        setNewSectionTitle({ zh: "", en: "" });
                        setShowAddSection(false);
                      }
                    }}
                    className="flex-1 py-2 text-sm rounded-lg"
                    style={{ backgroundColor: theme.colors.accent, color: "#fff" }}
                  >
                    {language === "zh" ? "添加" : "Add"}
                  </button>
                  <button onClick={() => setShowAddSection(false)} className="px-4 py-2 text-sm rounded-lg" style={{ backgroundColor: theme.colors.background, color: theme.colors.muted }}>
                    {language === "zh" ? "取消" : "Cancel"}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="p-3 rounded-xl cursor-pointer"
                  style={{
                    backgroundColor: theme.colors.background,
                    border: `1px solid ${selectedSectionId === section.id ? theme.colors.accent : theme.colors.border}`,
                  }}
                  onClick={() => selectSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} style={{ color: theme.colors.muted }} />
                      <span className="font-medium text-sm" style={{ color: theme.colors.foreground }}>
                        {section.title[language] || section.title.zh}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); updateSection(section.id, { visible: !section.visible }); }} className="p-1" style={{ color: theme.colors.muted }}>
                        {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} className="p-1" style={{ color: "#ef4444" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-1 ml-6" style={{ color: theme.colors.muted }}>
                    {language === "zh" ? `${section.works.length} 个作品` : `${section.works.length} works`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Theme Panel */}
        {editorSidebar === "theme" && (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">
              {language === "zh" ? "选择主题" : "Choose Theme"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="p-3 rounded-xl text-left"
                  style={{
                    backgroundColor: t.colors.background,
                    border: `2px solid ${theme.id === t.id ? t.colors.accent : t.colors.border}`,
                  }}
                >
                  <div className="h-12 rounded-lg mb-2 flex items-end p-2 gap-1" style={{ backgroundColor: t.colors.card }}>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: t.colors.accent }} />
                    <div className="w-4 h-6 rounded" style={{ backgroundColor: t.colors.foreground }} />
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: t.colors.muted }} />
                  </div>
                  <p className="text-xs font-medium" style={{ color: t.colors.foreground }}>{t.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Personal Info Panel */}
        {editorSidebar === "personal" && (
          <div className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">
              {language === "zh" ? "个人信息" : "Personal Info"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>{language === "zh" ? "名称" : "Name"}</label>
                <input
                  type="text"
                  value={portfolio.personalInfo.name[language] || ""}
                  onChange={(e) => usePortfolioStore.getState().updatePersonalInfo({ name: { ...portfolio.personalInfo.name, [language]: e.target.value } })}
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{ backgroundColor: theme.colors.background, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>{language === "zh" ? "头衔" : "Title"}</label>
                <input
                  type="text"
                  value={portfolio.personalInfo.title[language] || ""}
                  onChange={(e) => usePortfolioStore.getState().updatePersonalInfo({ title: { ...portfolio.personalInfo.title, [language]: e.target.value } })}
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{ backgroundColor: theme.colors.background, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>{language === "zh" ? "简介" : "Bio"}</label>
                <textarea
                  value={portfolio.personalInfo.bio[language] || ""}
                  onChange={(e) => usePortfolioStore.getState().updatePersonalInfo({ bio: { ...portfolio.personalInfo.bio, [language]: e.target.value } })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none resize-none"
                  style={{ backgroundColor: theme.colors.background, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>{language === "zh" ? "邮箱" : "Email"}</label>
                <input
                  type="email"
                  value={portfolio.personalInfo.contact.email}
                  onChange={(e) => usePortfolioStore.getState().updatePersonalInfo({ contact: { ...portfolio.personalInfo.contact, email: e.target.value } })}
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{ backgroundColor: theme.colors.background, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Properties Panel - Fixed at bottom */}
      <div
        className="border-t"
        style={{ borderColor: theme.colors.border }}
      >
        {selectedWork && selectedWorkSectionId ? (
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-sm" style={{ color: theme.colors.foreground }}>
              {language === "zh" ? "作品属性" : "Work Properties"}
            </h3>

            {/* Width */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: theme.colors.muted }}>{language === "zh" ? "宽度" : "Width"}</span>
                <span style={{ color: theme.colors.foreground }}>{selectedWork.size.width}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                value={selectedWork.size.width}
                onChange={(e) => updateWork(selectedWorkSectionId, selectedWork.id, { size: { ...selectedWork.size, width: parseInt(e.target.value) } })}
                className="w-full"
                style={{ accentColor: theme.colors.accent }}
              />
            </div>

            {/* Height */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: theme.colors.muted }}>{language === "zh" ? "高度" : "Height"}</span>
                <span style={{ color: theme.colors.foreground }}>{selectedWork.size.height}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                value={selectedWork.size.height}
                onChange={(e) => updateWork(selectedWorkSectionId, selectedWork.id, { size: { ...selectedWork.size, height: parseInt(e.target.value) } })}
                className="w-full"
                style={{ accentColor: theme.colors.accent }}
              />
            </div>

            {/* Effect */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>{language === "zh" ? "交互效果" : "Effect"}</label>
              <select
                value={selectedWork.cardEffect}
                onChange={(e) => updateWork(selectedWorkSectionId, selectedWork.id, { cardEffect: e.target.value as any })}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ backgroundColor: theme.colors.background, color: theme.colors.foreground, border: `1px solid ${theme.colors.border}` }}
              >
                <option value="flip">{language === "zh" ? "翻转" : "Flip"}</option>
                <option value="float">{language === "zh" ? "悬浮" : "Float"}</option>
                <option value="tilt">{language === "zh" ? "倾斜" : "Tilt"}</option>
              </select>
            </div>

            <button
              onClick={() => deleteWork(selectedWorkSectionId, selectedWork.id)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-red-400"
              style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
            >
              <Trash2 size={14} />
              {language === "zh" ? "删除作品" : "Delete Work"}
            </button>
          </div>
        ) : (
          <div className="p-4">
            <p className="text-xs text-center" style={{ color: theme.colors.muted }}>
              {language === "zh" ? "点击画布中的卡片编辑属性" : "Click a card to edit"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

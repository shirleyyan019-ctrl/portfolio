"use client";

import { useState, useEffect } from "react";
import { usePortfolioStore } from "@/lib/store";
import { Work } from "@/lib/types";
import { X } from "lucide-react";

interface WorkEditModalProps {
  sectionId: string;
  work: Work;
  onClose: () => void;
}

export default function WorkEditModal({ sectionId, work, onClose }: WorkEditModalProps) {
  const { portfolio, language, updateWork, syncToCloud } = usePortfolioStore();
  const { theme } = portfolio;
  const [titleZh, setTitleZh] = useState(work.title.zh || "");
  const [titleEn, setTitleEn] = useState(work.title.en || "");
  const [descZh, setDescZh] = useState(work.description.zh || "");
  const [descEn, setDescEn] = useState(work.description.en || "");
  const [effect, setEffect] = useState<Work["cardEffect"]>(work.cardEffect);
  const [width, setWidth] = useState(String(Math.round(work.size.width)));
  const [height, setHeight] = useState(String(Math.round(work.size.height)));

  useEffect(() => {
    setTitleZh(work.title.zh || "");
    setTitleEn(work.title.en || "");
    setDescZh(work.description.zh || "");
    setDescEn(work.description.en || "");
    setEffect(work.cardEffect);
    setWidth(String(Math.round(work.size.width)));
    setHeight(String(Math.round(work.size.height)));
  }, [work]);

  const inputStyle = {
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
    border: `1px solid ${theme.colors.border}`,
  };

  const handleSave = async () => {
    const parsedWidth = Number.parseInt(width, 10);
    const parsedHeight = Number.parseInt(height, 10);
    updateWork(sectionId, work.id, {
      title: { zh: titleZh, en: titleEn },
      description: { zh: descZh, en: descEn },
      cardEffect: effect,
      size: {
        width: Number.isNaN(parsedWidth) ? work.size.width : Math.min(1200, Math.max(40, parsedWidth)),
        height: Number.isNaN(parsedHeight) ? work.size.height : Math.min(1200, Math.max(40, parsedHeight)),
      },
    });
    await syncToCloud();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-2xl p-4 space-y-4"
        style={{ backgroundColor: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold" style={{ color: theme.colors.foreground }}>
            {language === "zh" ? "编辑作品信息" : "Edit Work"}
          </h3>
          <button onClick={onClose} style={{ color: theme.colors.muted }}>
            <X size={18} />
          </button>
        </div>

        {work.url && (
          <img
            src={work.url}
            alt={work.title.zh}
            className="w-full max-h-40 object-contain rounded-lg"
            style={{ backgroundColor: theme.colors.background }}
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>中文标题</label>
            <input value={titleZh} onChange={(e) => setTitleZh(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>English Title</label>
            <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg outline-none" style={inputStyle} />
          </div>
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>中文描述</label>
          <textarea value={descZh} onChange={(e) => setDescZh(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm rounded-lg outline-none resize-none" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>English Description</label>
          <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm rounded-lg outline-none resize-none" style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>{language === "zh" ? "宽度" : "Width"}</label>
            <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>{language === "zh" ? "高度" : "Height"}</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg outline-none" style={inputStyle} />
          </div>
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: theme.colors.muted }}>{language === "zh" ? "交互效果" : "Effect"}</label>
          <select value={effect} onChange={(e) => setEffect(e.target.value as Work["cardEffect"])} className="w-full px-3 py-2 text-sm rounded-lg outline-none" style={inputStyle}>
            <option value="flip">{language === "zh" ? "翻转" : "Flip"}</option>
            <option value="float">{language === "zh" ? "悬浮" : "Float"}</option>
            <option value="tilt">{language === "zh" ? "倾斜" : "Tilt"}</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm" style={{ backgroundColor: theme.colors.background, color: theme.colors.muted }}>
            {language === "zh" ? "取消" : "Cancel"}
          </button>
          <button onClick={handleSave} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: theme.colors.accent, color: "#fff" }}>
            {language === "zh" ? "保存" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

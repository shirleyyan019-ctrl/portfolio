"use client";

import { useState, useRef } from "react";
import { usePortfolioStore } from "@/lib/store";
import { Upload, X, ImagePlus, Film, Sparkles, Loader2 } from "lucide-react";
import { Work } from "@/lib/types";

interface WorkUploaderProps {
  sectionId: string;
  onClose?: () => void;
}

export default function WorkUploader({ sectionId, onClose }: WorkUploaderProps) {
  const { addWork, portfolio, language, syncToCloud } = usePortfolioStore();
  const [title, setTitle] = useState({ zh: "", en: "" });
  const [description, setDescription] = useState({ zh: "", en: "" });
  const [type, setType] = useState<Work["type"]>("image");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cardEffect, setCardEffect] = useState<Work["cardEffect"]>("tilt");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cardSize, setCardSize] = useState({ width: 300, height: 250 });
  // Flip back image state
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);
  const { theme } = portfolio;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      if (file.type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => {
          const targetWidth = 300;
          const aspectRatio = img.width / img.height;
          const h = Math.min(Math.max(targetWidth / aspectRatio, 150), 400);
          setCardSize({ width: targetWidth, height: h });
        };
        img.src = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
    if (file.type.startsWith("video/")) setType("video");
    else if (file.name.endsWith(".gif")) setType("animation");
    else setType("image");
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBackPreview(reader.result as string);
    reader.readAsDataURL(file);
    setBackFile(file);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.hint || data.details || data.error || "Upload failed");
    return data.url;
  };

  const handleSubmit = async () => {
    if (!selectedFile && !preview) return;
    setUploading(true);
    setUploadError(null);

    let workUrl = preview || "";
    let backUrl = "";

    try {
      if (selectedFile) workUrl = await uploadFile(selectedFile);
      if (backFile) backUrl = await uploadFile(backFile);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      return;
    }

    const work: Work = {
      id: `work-${Date.now()}`,
      title,
      description,
      type,
      url: workUrl,
      backUrl: backUrl || undefined,
      thumbnailUrl: "",
      position: { x: 40, y: 0 },
      size: { width: cardSize.width, height: cardSize.height },
      rotation: 0,
      zIndex: 0,
      cardEffect,
    };

    addWork(sectionId, work);
    await syncToCloud();
    setUploading(false);
    onClose?.();
  };

  const inputStyle = {
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
    border: `1px solid ${theme.colors.border}`,
  };

  const sizeLabel = selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : null;

  return (
    <div
      className="p-3 rounded-xl space-y-3 max-h-[85vh] overflow-y-auto custom-scrollbar"
      style={{ backgroundColor: theme.colors.card, border: `1px solid ${theme.colors.border}` }}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">
          {language === "zh" ? "上传作品" : "Upload"}
        </h4>
        {onClose && (
          <button onClick={onClose} disabled={uploading} style={{ color: theme.colors.muted }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* File Upload Area - smaller */}
      <div
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-opacity-60"
        style={{ borderColor: theme.colors.border }}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {preview ? (
          <div>
            {type === "video" ? (
              <video src={preview} className="max-h-32 mx-auto rounded" controls />
            ) : (
              <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded object-contain" />
            )}
            {sizeLabel && <p className="text-xs mt-1" style={{ color: theme.colors.muted }}>{sizeLabel}</p>}
          </div>
        ) : (
          <div className="space-y-1">
            <Upload size={24} className="mx-auto" style={{ color: theme.colors.muted }} />
            <p className="text-xs" style={{ color: theme.colors.muted }}>
              {language === "zh" ? "点击上传（最大 20MB）" : "Click to upload (max 20MB)"}
            </p>
          </div>
        )}
        <input ref={fileRef} type="file" className="hidden" accept="image/*,video/*,.gif" onChange={handleFileChange} />
      </div>

      {uploadError && <p className="text-xs text-red-400 text-center">{uploadError}</p>}

      {/* Card size - compact */}
      <div>
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-0.5">
              <span style={{ color: theme.colors.muted }}>{language === "zh" ? "宽" : "W"}</span>
              <span style={{ color: theme.colors.foreground }}>{cardSize.width}</span>
            </div>
            <input type="range" min="100" max="500" value={cardSize.width}
              onChange={(e) => setCardSize({ ...cardSize, width: parseInt(e.target.value) })}
              className="w-full" style={{ accentColor: theme.colors.accent }} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-0.5">
              <span style={{ color: theme.colors.muted }}>{language === "zh" ? "高" : "H"}</span>
              <span style={{ color: theme.colors.foreground }}>{cardSize.height}</span>
            </div>
            <input type="range" min="100" max="500" value={cardSize.height}
              onChange={(e) => setCardSize({ ...cardSize, height: parseInt(e.target.value) })}
              className="w-full" style={{ accentColor: theme.colors.accent }} />
          </div>
        </div>
      </div>

      {/* Type + Effect in one row */}
      <div className="flex gap-1.5">
        <div className="flex gap-1 flex-1">
          {[
            { id: "image" as const, icon: ImagePlus },
            { id: "video" as const, icon: Film },
            { id: "animation" as const, icon: Sparkles },
          ].map((t) => (
            <button key={t.id} onClick={() => setType(t.id)} className="flex-1 py-1.5 text-xs rounded-lg flex items-center justify-center gap-1"
              style={{
                backgroundColor: type === t.id ? `${theme.colors.accent}20` : theme.colors.background,
                color: type === t.id ? theme.colors.accent : theme.colors.muted,
                border: `1px solid ${type === t.id ? theme.colors.accent : theme.colors.border}`,
              }}>
              <t.icon size={12} />
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-1">
          {[
            { id: "flip" as const, label: language === "zh" ? "翻转" : "Flip" },
            { id: "float" as const, label: language === "zh" ? "悬浮" : "Float" },
            { id: "tilt" as const, label: language === "zh" ? "倾斜" : "Tilt" },
          ].map((e) => (
            <button key={e.id} onClick={() => setCardEffect(e.id)} className="flex-1 py-1.5 text-xs rounded-lg"
              style={{
                backgroundColor: cardEffect === e.id ? `${theme.colors.accent}20` : theme.colors.background,
                color: cardEffect === e.id ? theme.colors.accent : theme.colors.muted,
                border: `1px solid ${cardEffect === e.id ? theme.colors.accent : theme.colors.border}`,
              }}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Back image for flip effect */}
      {cardEffect === "flip" && (
        <div
          className="border border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors hover:border-opacity-60"
          style={{ borderColor: theme.colors.accent + "60" }}
          onClick={() => !uploading && backFileRef.current?.click()}
        >
          {backPreview ? (
            <div>
              <p className="text-xs mb-1" style={{ color: theme.colors.accent }}>
                {language === "zh" ? "背面图片（点击更换）" : "Back image (click to change)"}
              </p>
              <img src={backPreview} alt="Back" className="max-h-24 mx-auto rounded object-contain" />
            </div>
          ) : (
            <div className="space-y-1">
              <ImagePlus size={20} className="mx-auto" style={{ color: theme.colors.accent }} />
              <p className="text-xs" style={{ color: theme.colors.muted }}>
                {language === "zh" ? "上传背面图片（翻转后显示）" : "Upload back image (shown after flip)"}
              </p>
            </div>
          )}
          <input ref={backFileRef} type="file" className="hidden" accept="image/*" onChange={handleBackFileChange} />
        </div>
      )}

      {/* Title inputs - compact */}
      <div className="space-y-1.5">
        <input type="text" placeholder={language === "zh" ? "标题（中文）" : "Title (Chinese)"}
          value={title.zh} onChange={(e) => setTitle({ ...title, zh: e.target.value })}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg outline-none" style={inputStyle} />
        <input type="text" placeholder={language === "zh" ? "标题（英文）" : "Title (English)"}
          value={title.en} onChange={(e) => setTitle({ ...title, en: e.target.value })}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg outline-none" style={inputStyle} />
      </div>

      {/* Description - compact */}
      <textarea placeholder={language === "zh" ? "描述..." : "Description..."}
        value={description[language] || ""}
        onChange={(e) => setDescription({ ...description, [language]: e.target.value })}
        rows={2} className="w-full px-2.5 py-1.5 text-xs rounded-lg outline-none resize-none" style={inputStyle} />

      {/* Submit */}
      <button onClick={handleSubmit} disabled={(!selectedFile && !preview) || uploading || !title.zh}
        className="w-full py-2 text-xs font-medium rounded-lg transition-all hover:opacity-80 disabled:opacity-40 flex items-center justify-center gap-1.5"
        style={{ backgroundColor: theme.colors.accent, color: "#fff" }}>
        {uploading ? (
          <><Loader2 size={14} className="animate-spin" />{language === "zh" ? "上传中..." : "Uploading..."}</>
        ) : (
          language === "zh" ? "添加作品" : "Add Work"
        )}
      </button>
    </div>
  );
}

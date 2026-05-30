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
  const fileRef = useRef<HTMLInputElement>(null);
  const { theme } = portfolio;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Preview locally
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);

    if (file.type.startsWith("video/")) setType("video");
    else if (file.name.endsWith(".gif")) setType("animation");
    else setType("image");
  };

  const handleSubmit = async () => {
    if (!selectedFile && !preview) return;
    setUploading(true);
    setUploadError(null);

    let workUrl = preview || "";

    // Upload file to cloud if a file is selected
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          const errMsg = data.hint || data.details || data.error || "Upload failed";
          setUploadError(errMsg);
          setUploading(false);
          return;
        }

        workUrl = data.url;
      } catch (err) {
        setUploadError(
          err instanceof Error
            ? err.message
            : language === "zh" ? "上传失败，请重试" : "Upload failed, please retry"
        );
        setUploading(false);
        return;
      }
    }

    const work: Work = {
      id: `work-${Date.now()}`,
      title,
      description,
      type,
      url: workUrl,
      thumbnailUrl: "",
      position: { x: 60, y: 0 },
      size: { width: 240, height: 200 },
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

  // Max size label
  const sizeLabel = selectedFile
    ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`
    : null;

  return (
    <div
      className="p-4 rounded-xl space-y-4"
      style={{
        backgroundColor: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">
          {language === "zh" ? "上传作品" : "Upload Work"}
        </h4>
        {onClose && (
          <button
            onClick={onClose}
            disabled={uploading}
            style={{ color: theme.colors.muted }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* File Upload Area */}
      <div
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-opacity-60"
        style={{ borderColor: theme.colors.border }}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {preview ? (
          <div className="relative">
            {type === "video" ? (
              <video
                src={preview}
                className="max-h-40 mx-auto rounded-lg"
                controls
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="max-h-40 mx-auto rounded-lg"
              />
            )}
            {sizeLabel && (
              <p className="text-xs mt-2" style={{ color: theme.colors.muted }}>
                {sizeLabel}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Upload size={32} className="mx-auto" style={{ color: theme.colors.muted }} />
            <p className="text-sm" style={{ color: theme.colors.muted }}>
              {language === "zh" ? "点击或拖拽上传" : "Click or drag to upload"}
            </p>
            <p className="text-xs" style={{ color: theme.colors.muted }}>
              {language === "zh"
                ? "支持 JPG、PNG、GIF、MP4，最大 20MB"
                : "JPG, PNG, GIF, MP4 supported, max 20MB"}
            </p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,.gif"
          onChange={handleFileChange}
        />
      </div>

      {/* Upload error */}
      {uploadError && (
        <p className="text-xs text-red-400 text-center">{uploadError}</p>
      )}

      {/* Type selection */}
      <div className="flex gap-2">
        {[
          { id: "image" as const, icon: ImagePlus, label: language === "zh" ? "图片" : "Image" },
          { id: "video" as const, icon: Film, label: language === "zh" ? "视频" : "Video" },
          { id: "animation" as const, icon: Sparkles, label: language === "zh" ? "动效" : "Motion" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-colors"
            style={{
              backgroundColor: type === t.id ? `${theme.colors.accent}20` : theme.colors.background,
              color: type === t.id ? theme.colors.accent : theme.colors.muted,
              border: `1px solid ${type === t.id ? theme.colors.accent : theme.colors.border}`,
            }}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Title inputs */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder={language === "zh" ? "作品标题 (中文)" : "Title (Chinese)"}
          value={title.zh}
          onChange={(e) => setTitle({ ...title, zh: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg outline-none"
          style={inputStyle}
        />
        <input
          type="text"
          placeholder={language === "zh" ? "作品标题 (英文)" : "Title (English)"}
          value={title.en}
          onChange={(e) => setTitle({ ...title, en: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg outline-none"
          style={inputStyle}
        />
      </div>

      {/* Description */}
      <textarea
        placeholder={language === "zh" ? "作品描述..." : "Description..."}
        value={description[language] || ""}
        onChange={(e) => setDescription({ ...description, [language]: e.target.value })}
        rows={2}
        className="w-full px-3 py-2 text-sm rounded-lg outline-none resize-none"
        style={inputStyle}
      />

      {/* Card effect */}
      <div>
        <label className="text-xs mb-2 block" style={{ color: theme.colors.muted }}>
          {language === "zh" ? "交互效果" : "Interaction Effect"}
        </label>
        <div className="flex gap-2">
          {[
            { id: "flip" as const, label: language === "zh" ? "翻转" : "Flip" },
            { id: "float" as const, label: language === "zh" ? "悬浮" : "Float" },
            { id: "tilt" as const, label: language === "zh" ? "倾斜" : "Tilt" },
          ].map((e) => (
            <button
              key={e.id}
              onClick={() => setCardEffect(e.id)}
              className="flex-1 py-1.5 text-xs rounded-lg transition-colors"
              style={{
                backgroundColor: cardEffect === e.id ? `${theme.colors.accent}20` : theme.colors.background,
                color: cardEffect === e.id ? theme.colors.accent : theme.colors.muted,
                border: `1px solid ${cardEffect === e.id ? theme.colors.accent : theme.colors.border}`,
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={(!selectedFile && !preview) || uploading}
        className="w-full py-2.5 text-sm font-medium rounded-lg transition-all hover:opacity-80 disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ backgroundColor: theme.colors.accent, color: "#fff" }}
      >
        {uploading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {language === "zh" ? "正在上传..." : "Uploading..."}
          </>
        ) : (
          language === "zh" ? "添加作品" : "Add Work"
        )}
      </button>
    </div>
  );
}

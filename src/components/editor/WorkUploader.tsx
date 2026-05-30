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
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [cardSize, setCardSize] = useState({ width: 300, height: 250 });
  const fileRef = useRef<HTMLInputElement>(null);
  const { theme } = portfolio;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Preview locally
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);

      // Get image dimensions
      if (file.type.startsWith("image/")) {
        const img = new Image();
        img.onload = () => {
          // Calculate card size based on image aspect ratio
          // Target: around 300px width, height proportional
          const targetWidth = 300;
          const aspectRatio = img.width / img.height;
          const calculatedHeight = targetWidth / aspectRatio;

          // Clamp height to reasonable range
          const clampedHeight = Math.min(Math.max(calculatedHeight, 150), 400);
          const clampedWidth = Math.min(Math.max(targetWidth, 150), 400);

          setImageDimensions({ width: img.width, height: img.height });
          setCardSize({ width: clampedWidth, height: clampedHeight });
        };
        img.src = dataUrl;
      }
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
                className="max-h-48 mx-auto rounded-lg"
                controls
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg object-contain"
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

      {/* Image info */}
      {imageDimensions && (
        <p className="text-xs text-center" style={{ color: theme.colors.muted }}>
          {language === "zh" ? "原图尺寸" : "Original size"}: {imageDimensions.width} × {imageDimensions.height}px
        </p>
      )}

      {/* Card size adjustment */}
      {type === "image" && (
        <div>
          <label className="text-xs mb-2 block" style={{ color: theme.colors.muted }}>
            {language === "zh" ? "卡片尺寸" : "Card Size"}
          </label>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="text-xs" style={{ color: theme.colors.muted }}>
                {language === "zh" ? "宽度" : "Width"}
              </label>
              <input
                type="range"
                min="100"
                max="500"
                value={cardSize.width}
                onChange={(e) => setCardSize({ ...cardSize, width: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: theme.colors.accent }}
              />
              <span className="text-xs" style={{ color: theme.colors.muted }}>
                {cardSize.width}px
              </span>
            </div>
            <div className="flex-1">
              <label className="text-xs" style={{ color: theme.colors.muted }}>
                {language === "zh" ? "高度" : "Height"}
              </label>
              <input
                type="range"
                min="100"
                max="500"
                value={cardSize.height}
                onChange={(e) => setCardSize({ ...cardSize, height: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: theme.colors.accent }}
              />
              <span className="text-xs" style={{ color: theme.colors.muted }}>
                {cardSize.height}px
              </span>
            </div>
          </div>
        </div>
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
        disabled={(!selectedFile && !preview) || uploading || !title.zh}
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

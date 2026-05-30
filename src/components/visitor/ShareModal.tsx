"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Link2 } from "lucide-react";
import { usePortfolioStore } from "@/lib/store";

export default function ShareModal() {
  const { isShareModalOpen, setShareModalOpen, language, portfolio } =
    usePortfolioStore();
  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen) return null;

  const shareUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => setShareModalOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md mx-4 p-6 rounded-2xl"
        style={{
          backgroundColor: portfolio.theme.colors.card,
          border: `1px solid ${portfolio.theme.colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShareModalOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors hover:opacity-70"
          style={{ color: portfolio.theme.colors.muted }}
        >
          <X size={20} />
        </button>

        <h3
          className="text-xl font-bold mb-6"
          style={{ color: portfolio.theme.colors.foreground }}
        >
          {language === "zh" ? "分享作品集" : "Share Portfolio"}
        </h3>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: portfolio.theme.colors.background }}
          >
            <QRCodeSVG
              value={shareUrl}
              size={180}
              bgColor="transparent"
              fgColor={portfolio.theme.colors.foreground}
              level="M"
            />
          </div>
        </div>

        <p
          className="text-center text-sm mb-6"
          style={{ color: portfolio.theme.colors.muted }}
        >
          {language === "zh"
            ? "扫描二维码查看作品集"
            : "Scan QR code to view portfolio"}
        </p>

        {/* Link copy */}
        <div
          className="flex items-center gap-2 p-3 rounded-xl"
          style={{
            backgroundColor: portfolio.theme.colors.background,
            border: `1px solid ${portfolio.theme.colors.border}`,
          }}
        >
          <Link2 size={16} style={{ color: portfolio.theme.colors.muted }} />
          <span
            className="flex-1 text-sm truncate"
            style={{ color: portfolio.theme.colors.foreground }}
          >
            {shareUrl}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: portfolio.theme.colors.accent,
              color: "#fff",
            }}
          >
            {copied ? (
              <>
                <Check size={14} />
                {language === "zh" ? "已复制" : "Copied!"}
              </>
            ) : (
              <>
                <Copy size={14} />
                {language === "zh" ? "复制链接" : "Copy"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

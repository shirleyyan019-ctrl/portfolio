"use client";

import { useState, useEffect } from "react";
import { usePortfolioStore } from "@/lib/store";
import EditorToolbar from "@/components/editor/EditorToolbar";
import EditorSidebar from "@/components/editor/EditorSidebar";
import EditorCanvasWrapper from "@/components/editor/EditorCanvasWrapper";
import ShareModal from "@/components/visitor/ShareModal";
import WorkUploader from "@/components/editor/WorkUploader";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditorPage() {
  const {
    portfolio,
    isAuthenticated,
    language,
    setShareModalOpen,
    setEditorSidebar,
  } = usePortfolioStore();
  const router = useRouter();
  const [showUploader, setShowUploader] = useState<string | null>(null);
  const { theme } = portfolio;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/editor/login");
    }
  }, [isAuthenticated, router]);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolio),
      });
      if (response.ok) {
        alert(language === "zh" ? "保存成功！" : "Saved successfully!");
      }
    } catch {
      // localStorage fallback
      localStorage.setItem("portfolio-data", JSON.stringify(portfolio));
      alert(language === "zh" ? "已保存到本地存储" : "Saved to local storage");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: theme.colors.background }}
    >
      <EditorToolbar onSave={handleSave} />

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar />

        <div className="flex-1 flex flex-col">
          {/* Canvas area */}
          <EditorCanvasWrapper />

          {/* Bottom: quick actions */}
          <div
            className="h-14 flex items-center gap-3 px-4 border-t"
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            }}
          >
            <span className="text-xs" style={{ color: theme.colors.muted }}>
              {language === "zh" ? "快速添加作品到板块：" : "Quick add work to section:"}
            </span>
            {portfolio.sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setShowUploader(s.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                style={{
                  backgroundColor: theme.colors.background,
                  color: theme.colors.foreground,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <Plus size={12} />
                {s.title[language] || s.title.zh}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Work uploader modal */}
      {showUploader && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowUploader(null)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <WorkUploader
              sectionId={showUploader}
              onClose={() => setShowUploader(null)}
            />
          </div>
        </div>
      )}

      <ShareModal />
    </div>
  );
}

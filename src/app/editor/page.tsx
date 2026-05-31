"use client";

import { useState, useEffect } from "react";
import { usePortfolioStore } from "@/lib/store";
import EditorToolbar from "@/components/editor/EditorToolbar";
import EditorSidebar from "@/components/editor/EditorSidebar";
import EditorCanvasWrapper from "@/components/editor/EditorCanvasWrapper";
import ShareModal from "@/components/visitor/ShareModal";
import WorkUploader from "@/components/editor/WorkUploader";
import WorkEditModal from "@/components/editor/WorkEditModal";
import { Work } from "@/lib/types";
import { Plus, Loader2, Cloud, CloudOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditorPage() {
  const {
    portfolio,
    isAuthenticated,
    language,
    setShareModalOpen,
    setEditorSidebar,
    syncToCloud,
    cloudSyncStatus,
  } = usePortfolioStore();
  const router = useRouter();
  const [showUploader, setShowUploader] = useState<string | null>(null);
  const [editingWork, setEditingWork] = useState<{ sectionId: string; work: Work } | null>(null);
  const { theme } = portfolio;

  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/editor/login");
    }
  }, [isAuthenticated, router]);

  const handleSave = async () => {
    setSaveMsg(language === "zh" ? "正在同步到云端..." : "Syncing to cloud...");
    await syncToCloud();
    const { cloudSyncStatus: status } = usePortfolioStore.getState();
    if (status === "synced" || status === "idle") {
      setSaveMsg(language === "zh" ? "已保存到云端" : "Saved to cloud");
    } else {
      setSaveMsg(language === "zh" ? "已保存到本地" : "Saved locally");
    }
    setTimeout(() => setSaveMsg(null), 2000);
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

      {/* Save confirmation toast */}
      {saveMsg && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2"
          style={{ backgroundColor: theme.colors.accent, color: "#fff" }}>
          {cloudSyncStatus === "syncing" && <Loader2 size={14} className="animate-spin" />}
          {(cloudSyncStatus === "synced" || cloudSyncStatus === "idle") && <Cloud size={14} />}
          {cloudSyncStatus === "error" && <CloudOff size={14} />}
          {saveMsg}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar />

        <div className="flex-1 flex flex-col">
          {/* Canvas area */}
          <EditorCanvasWrapper
            onEditWork={(sectionId, work) => setEditingWork({ sectionId, work })}
          />

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

      {/* Work editor modal */}
      {editingWork && (
        <WorkEditModal
          sectionId={editingWork.sectionId}
          work={editingWork.work}
          onClose={() => setEditingWork(null)}
        />
      )}

      <ShareModal />
    </div>
  );
}

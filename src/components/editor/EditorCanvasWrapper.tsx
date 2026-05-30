"use client";

import { useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePortfolioStore } from "@/lib/store";

const FabricCanvas = dynamic(() => import("./FabricCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-gray-500">Loading canvas...</p>
    </div>
  ),
});

interface EditorCanvasWrapperProps {
  onWorkSelect?: (workId: string | null) => void;
}

export default function EditorCanvasWrapper({
  onWorkSelect,
}: EditorCanvasWrapperProps) {
  const { portfolio, selectedWorkId, selectWork, updateWork, editorSidebar } =
    usePortfolioStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWorkSelect = useCallback(
    (workId: string | null) => {
      selectWork(workId);
      onWorkSelect?.(workId);
    },
    [selectWork, onWorkSelect]
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden editor-grid"
      style={{
        backgroundColor: portfolio.theme.colors.background,
      }}
    >
      <FabricCanvas
        sections={portfolio.sections}
        selectedWorkId={selectedWorkId}
        onSelectWork={handleWorkSelect}
        onUpdateWork={updateWork}
        theme={portfolio.theme}
      />
    </div>
  );
}

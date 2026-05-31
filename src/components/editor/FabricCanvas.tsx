"use client";

import { useEffect, useRef, useState } from "react";
import { usePortfolioStore } from "@/lib/store";
import { Section, Work, ThemeConfig } from "@/lib/types";

interface FabricCanvasProps {
  sections: Section[];
  selectedWorkId: string | null;
  onSelectWork: (workId: string | null) => void;
  onUpdateWork: (sectionId: string, workId: string, data: Partial<Work>) => void;
  onEditWork?: (sectionId: string, work: Work) => void;
  theme: ThemeConfig;
}

export default function FabricCanvas({
  sections,
  selectedWorkId,
  onSelectWork,
  onUpdateWork,
  onEditWork,
  theme,
}: FabricCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, workId: string) => {
    e.preventDefault();
    setDragging(workId);
    onSelectWork(workId);
    const rect = (e.target as HTMLElement).closest("[data-card]")!.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - offset.x + container.scrollLeft;
      const y = e.clientY - rect.top - offset.y + container.scrollTop;

      // Find the work and update position
      for (const section of sections) {
        const work = section.works.find(w => w.id === dragging);
        if (work) {
          // Update position in store (debounced by React)
          onUpdateWork(section.id, work.id, {
            position: { x: Math.max(0, x), y: Math.max(0, y) },
          });
          break;
        }
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset, sections, onUpdateWork]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto p-8"
      style={{ backgroundColor: theme.colors.background }}
    >
      {sections.filter(s => s.visible).map(section => (
        <div key={section.id} className="mb-12">
          {/* Section title */}
          <h2
            className="text-xl font-bold mb-6"
            style={{ color: theme.colors.foreground }}
          >
            {section.title.zh}
          </h2>

          {/* Works grid */}
          {section.works.length > 0 ? (
            <div className="flex flex-wrap gap-5">
              {section.works.map(work => {
                const isSelected = selectedWorkId === work.id;
                return (
                  <div
                    key={work.id}
                    data-card
                    className="relative cursor-move select-none"
                    style={{
                      width: work.size.width,
                      height: work.size.height,
                      borderRadius: theme.spacing.cardRadius,
                      backgroundColor: theme.colors.card,
                      border: `2px solid ${isSelected ? theme.colors.accent : theme.colors.border}`,
                      boxShadow: isSelected
                        ? `0 0 0 3px ${theme.colors.accent}40`
                        : "0 4px 12px rgba(0,0,0,0.15)",
                      transition: dragging === work.id ? "none" : "box-shadow 0.2s",
                    }}
                    onMouseDown={(e) => handleMouseDown(e, work.id)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onEditWork?.(section.id, work);
                    }}
                    onClick={() => onSelectWork(work.id)}
                  >
                    {/* Image */}
                    {work.url ? (
                      <img
                        src={work.url}
                        alt={work.title.zh}
                        className="w-full object-cover"
                        style={{
                          height: work.size.height - 36,
                          borderRadius: `${theme.spacing.cardRadius}px ${theme.spacing.cardRadius}px 0 0`,
                        }}
                        draggable={false}
                      />
                    ) : (
                      <div
                        className="w-full flex items-center justify-center"
                        style={{ height: work.size.height - 36 }}
                      >
                        <span className="text-xs" style={{ color: theme.colors.muted }}>
                          No image
                        </span>
                      </div>
                    )}

                    {/* Title bar */}
                    <div
                      className="absolute bottom-0 left-0 right-0 px-3 flex items-center"
                      style={{
                        height: 36,
                        borderRadius: `0 0 ${theme.spacing.cardRadius}px ${theme.spacing.cardRadius}px`,
                        background: `linear-gradient(to right, ${theme.colors.card}, ${theme.colors.card})`,
                      }}
                    >
                      <span
                        className="text-xs font-medium truncate"
                        style={{ color: theme.colors.cardText }}
                      >
                        {work.title.zh || "Untitled"}
                      </span>
                      {work.cardEffect === "flip" && (
                        <span
                          className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${theme.colors.accent}30`, color: theme.colors.accent }}
                        >
                          FLIP
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="flex items-center justify-center py-16 rounded-xl border-2 border-dashed"
              style={{ borderColor: theme.colors.border, color: theme.colors.muted }}
            >
              <p className="text-sm">
                {sections.length > 0 ? "暂无作品，点击底部按钮添加" : "No works yet"}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

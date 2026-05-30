"use client";

import { useEffect, useRef } from "react";
import { usePortfolioStore } from "@/lib/store";
import { Section, Work, ThemeConfig } from "@/lib/types";
import * as fabric from "fabric";

interface FabricCanvasProps {
  sections: Section[];
  selectedWorkId: string | null;
  onSelectWork: (workId: string | null) => void;
  onUpdateWork: (sectionId: string, workId: string, data: Partial<Work>) => void;
  theme: ThemeConfig;
}

export default function FabricCanvas({
  sections,
  selectedWorkId,
  onSelectWork,
  onUpdateWork,
  theme,
}: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const workMapRef = useRef<Map<string, fabric.Group>>(new Map());

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 320,
      height: window.innerHeight - 64 - 56,
      backgroundColor: "transparent",
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        const id = (obj as any).workId as string | undefined;
        if (id) onSelectWork(id);
      }
    });

    canvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        const id = (obj as any).workId as string | undefined;
        if (id) onSelectWork(id);
      }
    });

    canvas.on("selection:cleared", () => {
      onSelectWork(null);
    });

    // Object modified - only update position after drag
    canvas.on("object:modified", (e) => {
      const obj = e.target;
      if (!obj) return;

      const id = (obj as any).workId as string | undefined;
      const sectionId = (obj as any).sectionId as string | undefined;
      if (!id || !sectionId) return;

      // Only update position, keep the stored size
      onUpdateWork(sectionId, id, {
        position: { x: obj.left || 0, y: obj.top || 0 },
        rotation: obj.angle || 0,
      });

      // Reset any accidental scale
      if (obj.scaleX !== 1 || obj.scaleY !== 1) {
        const workMap = workMapRef.current.get(id);
        if (workMap) {
          const originalWidth = (workMap as any)._originalWidth || 240;
          const originalHeight = (workMap as any)._originalHeight || 200;
          obj.set({ scaleX: 1, scaleY: 1, width: originalWidth, height: originalHeight });
        }
      }
      obj.setCoords();
      canvas.renderAll();
    });

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth - 320,
        height: window.innerHeight - 64 - 56,
      });
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [onSelectWork, onUpdateWork]);

  // Render works
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.clear();
    workMapRef.current.clear();

    let yOffset = 40;

    sections.forEach((section) => {
      if (!section.visible) return;

      // Section title
      const title = new fabric.Text(section.title.zh || "Section", {
        left: 40,
        top: yOffset,
        fontSize: 24,
        fontWeight: "bold",
        fill: theme.colors.foreground,
        selectable: false,
        evented: false,
      });
      canvas.add(title);
      yOffset += 50;

      if (section.works.length === 0) {
        yOffset += 20;
        return;
      }

      let xOffset = 40;
      const cardGap = 20;

      section.works.forEach((work) => {
        const cardWidth = work.size.width || 240;
        const cardHeight = work.size.height || 200;
        const radius = theme.spacing.cardRadius;

        // Background rect
        const bg = new fabric.Rect({
          width: cardWidth,
          height: cardHeight,
          fill: theme.colors.card,
          rx: radius,
          ry: radius,
          stroke: theme.colors.border,
          strokeWidth: 1,
          shadow: new fabric.Shadow({
            color: "rgba(0,0,0,0.15)",
            blur: 10,
            offsetX: 0,
            offsetY: 4,
          }),
        });

        const objects: fabric.Object[] = [bg];

        // Load image
        if (work.url) {
          fabric.FabricImage.fromURL(work.url, { crossOrigin: "anonymous" }).then((img) => {
            const padding = 8;
            const titleHeight = 36;
            const imgMaxWidth = cardWidth - padding * 2;
            const imgMaxHeight = cardHeight - titleHeight - padding * 2;

            const scaleX = imgMaxWidth / (img.width || 1);
            const scaleY = imgMaxHeight / (img.height || 1);
            const scale = Math.min(scaleX, scaleY);

            const scaledWidth = (img.width || 200) * scale;
            const scaledHeight = (img.height || 200) * scale;

            img.set({
              left: (cardWidth - scaledWidth) / 2,
              top: padding,
              scaleX: scale,
              scaleY: scale,
              selectable: false,
              evented: false,
            });

            // Add to group
            (group as any).add(img);
            canvas.renderAll();
          });
        } else {
          const text = new fabric.Text(work.title.zh || "Empty", {
            left: cardWidth / 2,
            top: cardHeight / 2,
            fontSize: 14,
            fill: theme.colors.muted,
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
          });
          objects.push(text);
        }

        // Title text
        const titleText = new fabric.Textbox(work.title.zh || "Untitled", {
          text: work.title.zh || "Untitled",
          width: cardWidth - 16,
          left: 8,
          top: cardHeight - 36,
          fontSize: 12,
          fontWeight: "bold",
          fill: theme.colors.cardText,
          fontFamily: "Inter, sans-serif",
          selectable: false,
          evented: false,
        });
        objects.push(titleText);

        // Create group
        const group = new fabric.Group(objects, {
          left: work.position.x || xOffset,
          top: work.position.y || yOffset,
          angle: work.rotation || 0,
        });

        (group as any).workId = work.id;
        (group as any).sectionId = section.id;
        (group as any)._originalWidth = cardWidth;
        (group as any)._originalHeight = cardHeight;

        canvas.add(group);
        workMapRef.current.set(work.id, group);

        xOffset += cardWidth + cardGap;
      });

      const maxHeight = Math.max(...section.works.map(w => w.size.height || 200));
      yOffset += maxHeight + 50;
    });

    canvas.renderAll();
  }, [sections, theme]);

  // Highlight selected work
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.discardActiveObject();

    if (selectedWorkId) {
      const group = workMapRef.current.get(selectedWorkId);
      if (group) {
        canvas.setActiveObject(group);
      }
    }

    canvas.renderAll();
  }, [selectedWorkId]);

  return (
    <div className="w-full h-full overflow-auto" style={{ backgroundColor: theme.colors.background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

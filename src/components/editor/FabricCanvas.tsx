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
  const objectsMap = useRef<Map<string, fabric.Object>>(new Map());

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 320,
      height: window.innerHeight - 64,
      backgroundColor: "transparent",
      selection: true,
    });

    fabricRef.current = canvas;

    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0];
      if (obj && (obj as any).workId) {
        onSelectWork((obj as any).workId);
      }
    });

    canvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0];
      if (obj && (obj as any).workId) {
        onSelectWork((obj as any).workId);
      }
    });

    canvas.on("selection:cleared", () => {
      onSelectWork(null);
    });

    canvas.on("object:modified", (e) => {
      const obj = e.target;
      if (obj && (obj as any).workId && (obj as any).sectionId) {
        const workId = (obj as any).workId;
        const sectionId = (obj as any).sectionId;
        onUpdateWork(sectionId, workId, {
          position: { x: obj.left || 0, y: obj.top || 0 },
          size: { width: obj.width || 200, height: obj.height || 200 },
          rotation: obj.angle || 0,
        });
      }
    });

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth - 320,
        height: window.innerHeight - 64,
      });
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Render sections and works on canvas
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.getObjects().forEach((obj) => canvas.remove(obj));
    objectsMap.current.clear();

    let yOffset = 60;

    sections.forEach((section) => {
      if (!section.visible) return;

      // Section title
      const titleText = new fabric.Text(
        section.title.zh || "Section",
        {
          left: 60,
          top: yOffset,
          fontSize: 28,
          fontWeight: "bold",
          fill: theme.colors.foreground,
          selectable: false,
          evented: false,
        }
      );
      canvas.add(titleText);
      yOffset += 50;

      // Works
      let xOffset = 60;
      section.works.forEach((work) => {
        const cardWidth = work.size.width || 200;
        const cardHeight = work.size.height || 200;

        const cardGroup: fabric.Object[] = [];

        // Card background
        const bg = new fabric.Rect({
          width: cardWidth,
          height: cardHeight,
          fill: theme.colors.card,
          rx: theme.spacing.cardRadius,
          ry: theme.spacing.cardRadius,
          stroke: theme.colors.border,
          strokeWidth: 1,
        });
        cardGroup.push(bg);

        // Work title
        const workTitle = new fabric.Text(
          work.title.zh || "Work",
          {
            left: 12,
            top: cardHeight - 40,
            fontSize: 13,
            fill: theme.colors.cardText,
            selectable: false,
            evented: false,
          }
        );
        cardGroup.push(workTitle);

        const group = new fabric.Group(cardGroup, {
          left: work.position.x || xOffset,
          top: work.position.y || yOffset,
          angle: work.rotation || 0,
        });

        (group as any).workId = work.id;
        (group as any).sectionId = section.id;

        canvas.add(group);
        objectsMap.current.set(work.id, group);

        xOffset += cardWidth + theme.spacing.cardGap;
      });

      if (section.works.length > 0) {
        yOffset += 250;
      }

      yOffset += theme.spacing.sectionGap / 2;
    });

    canvas.renderAll();
  }, [sections, theme]);

  // Highlight selected work
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const obj = selectedWorkId
      ? objectsMap.current.get(selectedWorkId)
      : null;

    if (obj) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
    } else {
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [selectedWorkId]);

  return (
    <canvas ref={canvasRef} />
  );
}

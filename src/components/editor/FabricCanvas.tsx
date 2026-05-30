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
  const workMapRef = useRef<Map<string, { group: fabric.Group; img: fabric.Image; bg: fabric.Rect }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

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

    // Before scaling - save original aspect ratio
    canvas.on("before:transform", (e) => {
      const obj = e.transform?.target;
      if (obj && (obj as any).workId) {
        (obj as any)._originalWidth = obj.width;
        (obj as any)._originalHeight = obj.height;
      }
    });

    // During scaling - maintain aspect ratio
    canvas.on("object:scaling", (e) => {
      const obj = e.target;
      if (!obj || !(obj as any).workId) return;

      const workMap = workMapRef.current.get((obj as any).workId as string);
      if (!workMap) return;

      // Calculate new size maintaining aspect ratio
      const scaleX = obj.scaleX || 1;
      const scaleY = obj.scaleY || 1;

      // Use the larger scale to maintain aspect ratio
      const uniformScale = Math.max(scaleX, scaleY);

      // Update group size
      const newWidth = ((obj as any)._originalWidth || 200) * uniformScale;
      const newHeight = ((obj as any)._originalHeight || 200) * uniformScale;

      obj.set({
        scaleX: 1,
        scaleY: 1,
        width: newWidth,
        height: newHeight,
      });

      // Update image size proportionally
      const img = workMap.img;
      if (img) {
        const imgScale = uniformScale / (obj as any)._originalScale || 1;
        img.set({
          scaleX: (img as any)._originalScaleX * imgScale,
          scaleY: (img as any)._originalScaleY * imgScale,
        });
        img.setCoords();
      }

      obj.setCoords();
      canvas.renderAll();
    });

    // Object modified - save new size
    canvas.on("object:modified", (e) => {
      const obj = e.target;
      if (!obj) return;

      const id = (obj as any).workId as string | undefined;
      const sectionId = (obj as any).sectionId as string | undefined;
      if (!id || !sectionId) return;

      // Calculate final scale
      const workMap = workMapRef.current.get(id);
      let finalWidth = obj.width || 200;
      let finalHeight = obj.height || 200;

      if (workMap?.img) {
        const imgScaleX = workMap.img.scaleX / ((workMap.img as any)._originalScaleX || 1);
        const imgScaleY = workMap.img.scaleY / ((workMap.img as any)._originalScaleY || 1);
        finalWidth = (workMap.img as any)._originalWidth * workMap.img.scaleX;
        finalHeight = (workMap.img as any)._originalHeight * workMap.img.scaleY;
      }

      onUpdateWork(sectionId, id, {
        position: { x: obj.left || 0, y: obj.top || 0 },
        size: { width: finalWidth, height: finalHeight },
        rotation: obj.angle || 0,
      });

      obj.set({ scaleX: 1, scaleY: 1 });
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

        // Create group with bg only initially
        const group = new fabric.Group([bg], {
          left: work.position.x || xOffset,
          top: work.position.y || yOffset,
          angle: work.rotation || 0,
        });

        (group as any).workId = work.id;
        (group as any).sectionId = section.id;
        (group as any)._originalWidth = cardWidth;
        (group as any)._originalHeight = cardHeight;
        (group as any)._originalScale = 1;

        canvas.add(group);

        // Load and add image
        if (work.url) {
          fabric.FabricImage.fromURL(work.url, { crossOrigin: "anonymous" }).then((img) => {
            // Calculate image bounds within card (leave room for title)
            const padding = 8;
            const titleHeight = 40;
            const imgMaxWidth = cardWidth - padding * 2;
            const imgMaxHeight = cardHeight - titleHeight - padding * 2;

            // Calculate scale to fit
            const scaleX = imgMaxWidth / (img.width || 1);
            const scaleY = imgMaxHeight / (img.height || 1);
            const scale = Math.min(scaleX, scaleY);

            const scaledWidth = (img.width || 200) * scale;
            const scaledHeight = (img.height || 200) * scale;

            // Center the image horizontally
            const imgLeft = (cardWidth - scaledWidth) / 2;
            const imgTop = padding;

            img.set({
              left: imgLeft,
              top: imgTop,
              scaleX: scale,
              scaleY: scale,
              selectable: false,
              evented: false,
            });

            // Store original values for scaling calculations
            (img as any)._originalWidth = scaledWidth;
            (img as any)._originalHeight = scaledHeight;
            (img as any)._originalScaleX = scale;
            (img as any)._originalScaleY = scale;

            // Add image to group
            (group as any).add(img);
            (group as any).canvas?.renderAll();

            // Store reference
            workMapRef.current.set(work.id, { group, img, bg });

            canvas.renderAll();
          });
        } else {
          // No image - show placeholder text
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
          (group as any).add(text);
        }

        // Title text
        const titlePadding = 8;
        const titleText = new fabric.Textbox(work.title.zh || "Untitled", {
          text: work.title.zh || "Untitled",
          width: cardWidth - titlePadding * 2,
          left: titlePadding,
          top: cardHeight - 36,
          fontSize: 12,
          fontWeight: "bold",
          fill: theme.colors.cardText,
          fontFamily: "Inter, sans-serif",
          selectable: false,
          evented: false,
        });
        (group as any).add(titleText);

        xOffset += cardWidth + cardGap;
      });

      // Find max height in this row
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
      const entry = workMapRef.current.get(selectedWorkId);
      if (entry?.group) {
        canvas.setActiveObject(entry.group);
      }
    }

    canvas.renderAll();
  }, [selectedWorkId]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto" style={{ backgroundColor: theme.colors.background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

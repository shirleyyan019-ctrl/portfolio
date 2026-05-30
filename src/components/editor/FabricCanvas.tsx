"use client";

import { useEffect, useRef, useCallback, useState } from "react";
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

interface WorkObject {
  workId: string;
  sectionId: string;
  fabricObject: fabric.Object;
  image?: fabric.Image;
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
  const workObjectsRef = useRef<Map<string, WorkObject>>(new Map());
  const [imagesLoaded, setImagesLoaded] = useState(false);

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

    // Selection events
    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        const workObj = (obj as any).data as WorkObject | undefined;
        if (workObj?.workId) {
          onSelectWork(workObj.workId);
        }
      }
    });

    canvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        const workObj = (obj as any).data as WorkObject | undefined;
        if (workObj?.workId) {
          onSelectWork(workObj.workId);
        }
      }
    });

    canvas.on("selection:cleared", () => {
      onSelectWork(null);
    });

    // Object modified (resize/move)
    canvas.on("object:modified", (e) => {
      const obj = e.target;
      if (!obj) return;

      const workObj = (obj as any).data as WorkObject | undefined;
      if (!workObj?.workId) return;

      onUpdateWork(workObj.sectionId, workObj.workId, {
        position: { x: obj.left || 0, y: obj.top || 0 },
        size: {
          width: (obj.width || 200) * (obj.scaleX || 1),
          height: (obj.height || 200) * (obj.scaleY || 1),
        },
        rotation: obj.angle || 0,
      });

      // Reset scale after applying to size
      obj.set({ scaleX: 1, scaleY: 1, width: obj.width, height: obj.height });
      obj.setCoords();
      canvas.renderAll();
    });

    // Resize handler
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

  // Render works on canvas
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Clear existing objects
    canvas.clear();
    workObjectsRef.current.clear();
    setImagesLoaded(false);

    let yOffset = 40;

    const loadPromises: Promise<void>[] = [];

    sections.forEach((section) => {
      if (!section.visible) return;

      // Section title (non-selectable)
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
      const maxRowHeight = 200;

      section.works.forEach((work) => {
        const cardWidth = work.size.width || 200;
        const cardHeight = work.size.height || 200;

        const loadImagePromise = new Promise<void>((resolve) => {
          if (work.url) {
            fabric.FabricImage.fromURL(work.url, { crossOrigin: "anonymous" })
              .then((img) => {
                // Scale image to fit card size
                const scale = Math.min(cardWidth / (img.width || 1), cardHeight / (img.height || 1));
                const imgWidth = (img.width || 200) * scale;
                const imgHeight = (img.height || 200) * scale;

                img.set({
                  left: 0,
                  top: 0,
                  scaleX: scale,
                  scaleY: scale,
                  selectable: false,
                  evented: false,
                });

                // Card background with rounded corners
                const bg = new fabric.Rect({
                  width: cardWidth,
                  height: cardHeight,
                  fill: theme.colors.card,
                  rx: theme.spacing.cardRadius,
                  ry: theme.spacing.cardRadius,
                  stroke: theme.colors.border,
                  strokeWidth: 1,
                  shadow: new fabric.Shadow({
                    color: "rgba(0,0,0,0.2)",
                    blur: 8,
                    offsetX: 0,
                    offsetY: 2,
                  }),
                });

                // Title text
                const titleText = new fabric.Textbox(work.title.zh || "Untitled", {
                  text: work.title.zh || "Untitled",
                  width: cardWidth - 16,
                  left: 8,
                  top: cardHeight - 36,
                  fontSize: 12,
                  fontWeight: "bold",
                  fill: theme.colors.cardText,
                  selectable: false,
                  evented: false,
                });

                // Create group
                const group = new fabric.Group([bg, img, titleText], {
                  left: work.position.x || xOffset,
                  top: work.position.y || yOffset,
                  angle: work.rotation || 0,
                  hasControls: true,
                  hasBorders: true,
                  cornerColor: theme.colors.accent,
                  cornerStyle: "circle",
                  cornerSize: 10,
                  transparentCorners: false,
                  borderColor: theme.colors.accent,
                  borderScaleFactor: 2,
                });

                (group as any).data = { workId: work.id, sectionId: section.id };

                canvas.add(group);
                workObjectsRef.current.set(work.id, {
                  workId: work.id,
                  sectionId: section.id,
                  fabricObject: group,
                  image: img,
                });

                xOffset += cardWidth + 20;
                resolve();
              })
              .catch(() => {
                // Fallback: just create a placeholder
                const bg = new fabric.Rect({
                  width: cardWidth,
                  height: cardHeight,
                  fill: theme.colors.card,
                  rx: theme.spacing.cardRadius,
                  ry: theme.spacing.cardRadius,
                  stroke: theme.colors.border,
                  strokeWidth: 1,
                });
                const text = new fabric.Text(work.title.zh || "No preview", {
                  left: cardWidth / 2,
                  top: cardHeight / 2,
                  fontSize: 12,
                  fill: theme.colors.muted,
                  originX: "center",
                  originY: "center",
                });
                const group = new fabric.Group([bg, text], {
                  left: work.position.x || xOffset,
                  top: work.position.y || yOffset,
                  angle: work.rotation || 0,
                  hasControls: true,
                  hasBorders: true,
                  cornerColor: theme.colors.accent,
                  cornerStyle: "circle",
                  cornerSize: 10,
                });
                (group as any).data = { workId: work.id, sectionId: section.id };
                canvas.add(group);
                workObjectsRef.current.set(work.id, {
                  workId: work.id,
                  sectionId: section.id,
                  fabricObject: group,
                });
                xOffset += cardWidth + 20;
                resolve();
              });
          } else {
            // No image, just placeholder
            const bg = new fabric.Rect({
              width: cardWidth,
              height: cardHeight,
              fill: theme.colors.card,
              rx: theme.spacing.cardRadius,
              ry: theme.spacing.cardRadius,
              stroke: theme.colors.border,
              strokeWidth: 1,
              strokeDashArray: [5, 5],
            });
            const text = new fabric.Text(work.title.zh || "Empty", {
              left: cardWidth / 2,
              top: cardHeight / 2,
              fontSize: 12,
              fill: theme.colors.muted,
              originX: "center",
              originY: "center",
            });
            const group = new fabric.Group([bg, text], {
              left: work.position.x || xOffset,
              top: work.position.y || yOffset,
              angle: work.rotation || 0,
              hasControls: true,
              hasBorders: true,
              cornerColor: theme.colors.accent,
              cornerStyle: "circle",
              cornerSize: 10,
            });
            (group as any).data = { workId: work.id, sectionId: section.id };
            canvas.add(group);
            workObjectsRef.current.set(work.id, {
              workId: work.id,
              sectionId: section.id,
              fabricObject: group,
            });
            xOffset += cardWidth + 20;
            resolve();
          }
        });

        loadPromises.push(loadImagePromise);
      });

      yOffset += maxRowHeight + 40;
    });

    // Update imagesLoaded after all images attempt to load
    Promise.all(loadPromises).then(() => {
      canvas.renderAll();
      setImagesLoaded(true);
    });

    canvas.renderAll();
  }, [sections, theme]);

  // Highlight selected work
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (selectedWorkId) {
      const workObj = workObjectsRef.current.get(selectedWorkId);
      if (workObj?.fabricObject) {
        canvas.setActiveObject(workObj.fabricObject);
        canvas.renderAll();
      }
    } else {
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, [selectedWorkId]);

  return (
    <div className="w-full h-full overflow-auto bg-gray-900/50">
      <canvas ref={canvasRef} />
    </div>
  );
}

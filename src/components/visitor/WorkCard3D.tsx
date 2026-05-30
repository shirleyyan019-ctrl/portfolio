"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Work } from "@/lib/types";
import { usePortfolioStore } from "@/lib/store";

interface WorkCard3DProps {
  work: Work;
  index: number;
}

export default function WorkCard3D({ work, index }: WorkCard3DProps) {
  const { language, portfolio } = usePortfolioStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (work.cardEffect === "flip") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleFlip = () => {
    if (work.cardEffect === "flip") {
      setIsFlipped(!isFlipped);
    }
  };

  const title = work.title[language] || work.title.zh;
  const description = work.description[language] || work.description.zh;
  const radius = portfolio.theme.spacing.cardRadius;

  const getEffectStyles = () => {
    switch (work.cardEffect) {
      case "tilt":
        return { style: { rotateX, rotateY } };
      case "float":
        return {
          animate: isHovered ? { y: -12, scale: 1.03 } : { y: 0, scale: 1 },
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className="perspective-1000"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        ref={cardRef}
        className="preserve-3d relative cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleFlip}
        {...getEffectStyles()}
        style={{
          width: work.size.width,
          height: work.size.height,
          ...getEffectStyles().style,
        }}
      >
        {/* Front */}
        <motion.div
          className="absolute inset-0 backface-hidden overflow-hidden"
          style={{
            borderRadius: radius,
            backgroundColor: portfolio.theme.colors.card,
            border: `1px solid ${portfolio.theme.colors.border}`,
          }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {work.url && (
            <div className="relative w-full h-full">
              {work.type === "video" ? (
                <video
                  src={work.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay={isHovered}
                  poster={work.thumbnailUrl || undefined}
                />
              ) : work.type === "animation" ? (
                <img
                  src={work.url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={work.url}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}

              {/* Overlay */}
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                }}
              >
                <div>
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: portfolio.theme.colors.cardText }}
                  >
                    {title}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Empty placeholder */}
          {!work.url && (
            <div className="w-full h-full flex items-center justify-center">
              <p style={{ color: portfolio.theme.colors.muted }}>
                {title}
              </p>
            </div>
          )}
        </motion.div>

        {/* Back */}
        <motion.div
          className="absolute inset-0 backface-hidden overflow-hidden p-5 flex flex-col justify-between"
          style={{
            borderRadius: radius,
            backgroundColor: portfolio.theme.colors.card,
            border: `1px solid ${portfolio.theme.colors.border}`,
          }}
          animate={{ rotateY: isFlipped ? 0 : -180 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: portfolio.theme.colors.cardText }}
            >
              {title}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: portfolio.theme.colors.muted }}
            >
              {description}
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: portfolio.theme.colors.accent,
                color: "#fff",
              }}
            >
              {work.type === "image"
                ? "图片"
                : work.type === "video"
                ? "视频"
                : "动效"}
            </span>
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: `${portfolio.theme.colors.accent}20`,
                color: portfolio.theme.colors.accent,
              }}
            >
              {work.cardEffect === "flip"
                ? "翻转"
                : work.cardEffect === "float"
                ? "悬浮"
                : "倾斜"}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

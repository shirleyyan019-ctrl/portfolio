"use client";

import { motion } from "framer-motion";
import { usePortfolioStore } from "@/lib/store";
import { Section } from "@/lib/types";
import WorkCard3D from "./WorkCard3D";

interface SectionBlockProps {
  section: Section;
}

export default function SectionBlock({ section }: SectionBlockProps) {
  const { language, portfolio } = usePortfolioStore();
  const title = section.title[language] || section.title.zh;
  const gap = portfolio.theme.spacing.cardGap;

  if (!section.visible) return null;

  return (
    <section
      className="page-transition"
      style={{ marginBottom: portfolio.theme.spacing.sectionGap }}
    >
      <motion.h2
        className="text-3xl md:text-4xl font-bold mb-10 tracking-tight"
        style={{ color: portfolio.theme.colors.foreground }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h2>

      {section.works.length > 0 ? (
        <div
          className="flex flex-wrap"
          style={{ gap }}
        >
          {section.works.map((work, i) => (
            <WorkCard3D key={work.id} work={work} index={i} />
          ))}
        </div>
      ) : (
        <div
          className="flex items-center justify-center py-20 rounded-xl border-2 border-dashed"
          style={{
            borderColor: portfolio.theme.colors.border,
            color: portfolio.theme.colors.muted,
          }}
        >
          <p>
            {language === "zh"
              ? "暂无作品，进入编辑器添加"
              : "No works yet. Go to editor to add."}
          </p>
        </div>
      )}
    </section>
  );
}

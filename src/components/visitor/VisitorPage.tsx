"use client";

import { motion } from "framer-motion";
import { usePortfolioStore } from "@/lib/store";
import SectionBlock from "./SectionBlock";
import PersonalInfo from "./PersonalInfo";
import ShareModal from "./ShareModal";
import { Share, Globe, Pencil } from "lucide-react";
import Link from "next/link";

export default function VisitorPage() {
  const { portfolio, language, setLanguage, setShareModalOpen } =
    usePortfolioStore();
  const { sections, personalInfo, theme } = portfolio;

  const name = personalInfo.name[language] || personalInfo.name.zh;
  const tagline = personalInfo.title[language] || personalInfo.title.zh;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl"
        style={{
          backgroundColor: `${theme.colors.background}cc`,
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: theme.colors.foreground }}
          >
            {name}
          </span>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
              style={{
                color: theme.colors.muted,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <Globe size={14} />
              {language === "zh" ? "EN" : "中"}
            </button>

            {/* Share */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
              style={{
                color: theme.colors.muted,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <Share size={14} />
              {language === "zh" ? "分享" : "Share"}
            </button>

            {/* Editor link */}
            <Link
              href="/editor"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all hover:opacity-80"
              style={{
                backgroundColor: theme.colors.accent,
                color: "#fff",
              }}
            >
              <Pencil size={14} />
              {language === "zh" ? "编辑" : "Edit"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p
            className="text-base mb-4"
            style={{ color: theme.colors.accent }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {language === "zh" ? "你好，我是" : "Hello, I'm"}
          </motion.p>
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
            style={{ color: theme.colors.foreground }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {name}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl max-w-xl"
            style={{ color: theme.colors.muted }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {tagline}
          </motion.p>

          {/* Quick nav pills */}
          <motion.div
            className="flex flex-wrap gap-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {sections
              .filter((s) => s.visible)
              .map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
                  style={{
                    backgroundColor: theme.colors.card,
                    color: theme.colors.foreground,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  {s.title[language] || s.title.zh}
                </a>
              ))}
            <a
              href="#about"
              className="px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
              style={{
                backgroundColor: theme.colors.card,
                color: theme.colors.foreground,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              {language === "zh" ? "个人信息" : "About"}
            </a>
          </motion.div>
        </div>
      </header>

      {/* Sections */}
      <main className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {sections.map((section) => (
            <div key={section.id} id={section.id}>
              <SectionBlock section={section} />
            </div>
          ))}

          {/* About Section */}
          <div id="about">
            <PersonalInfo />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center"
        style={{ borderTop: `1px solid ${theme.colors.border}` }}
      >
        <p className="text-xs" style={{ color: theme.colors.muted }}>
          Portfolio Builder &copy; {new Date().getFullYear()}
        </p>
      </footer>

      {/* Share Modal */}
      <ShareModal />
    </div>
  );
}

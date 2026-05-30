"use client";

import { motion } from "framer-motion";
import { Mail, Globe, User } from "lucide-react";
import { usePortfolioStore } from "@/lib/store";

export default function PersonalInfo() {
  const { language, portfolio } = usePortfolioStore();
  const { personalInfo } = portfolio;

  const name = personalInfo.name[language] || personalInfo.name.zh;
  const title = personalInfo.title[language] || personalInfo.title.zh;
  const bio = personalInfo.bio[language] || personalInfo.bio.zh;

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
        {language === "zh" ? "关于我" : "About Me"}
      </motion.h2>

      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Avatar */}
        <motion.div
          className="shrink-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {personalInfo.avatar ? (
            <img
              src={personalInfo.avatar}
              alt={name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover"
              style={{
                borderRadius: portfolio.theme.spacing.cardRadius,
                border: `2px solid ${portfolio.theme.colors.border}`,
              }}
            />
          ) : (
            <div
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: portfolio.theme.colors.card,
                border: `2px solid ${portfolio.theme.colors.border}`,
              }}
            >
              <User
                size={48}
                style={{ color: portfolio.theme.colors.muted }}
              />
            </div>
          )}
        </motion.div>

        {/* Info */}
        <div className="flex-1 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3
              className="text-2xl font-bold"
              style={{ color: portfolio.theme.colors.foreground }}
            >
              {name}
            </h3>
            <p
              className="text-base mt-1"
              style={{ color: portfolio.theme.colors.accent }}
            >
              {title}
            </p>
          </motion.div>

          <motion.p
            className="text-base leading-relaxed max-w-xl"
            style={{ color: portfolio.theme.colors.muted }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {bio}
          </motion.p>

          {/* Contact */}
          <motion.div
            className="flex flex-wrap gap-4 pt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {personalInfo.contact.email && (
              <a
                href={`mailto:${personalInfo.contact.email}`}
                className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                style={{ color: portfolio.theme.colors.muted }}
              >
                <Mail size={16} />
                {personalInfo.contact.email}
              </a>
            )}
            {personalInfo.contact.website && (
              <a
                href={personalInfo.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                style={{ color: portfolio.theme.colors.muted }}
              >
                <Globe size={16} />
                {personalInfo.contact.website}
              </a>
            )}
          </motion.div>

          {/* Social links */}
          {personalInfo.contact.social.length > 0 && (
            <motion.div
              className="flex gap-3 pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {personalInfo.contact.social.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs rounded-full transition-all hover:scale-105"
                  style={{
                    backgroundColor: portfolio.theme.colors.card,
                    color: portfolio.theme.colors.foreground,
                    border: `1px solid ${portfolio.theme.colors.border}`,
                  }}
                >
                  {s.platform}
                </a>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

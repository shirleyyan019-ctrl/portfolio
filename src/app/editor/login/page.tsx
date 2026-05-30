"use client";

import { useState } from "react";
import { usePortfolioStore } from "@/lib/store";
import { Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, language, portfolio } = usePortfolioStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  const { theme } = portfolio;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      router.push("/editor");
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{
          backgroundColor: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: `${theme.colors.accent}20`,
            }}
          >
            <Lock size={28} style={{ color: theme.colors.accent }} />
          </div>
          <h2
            className="text-xl font-bold"
            style={{ color: theme.colors.foreground }}
          >
            {language === "zh" ? "编辑登录" : "Editor Login"}
          </h2>
          <p className="text-sm mt-1" style={{ color: theme.colors.muted }}>
            {language === "zh"
              ? "请输入编辑密码以进入编辑模式"
              : "Enter password to access editor"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={language === "zh" ? "输入密码" : "Enter password"}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.foreground,
              border: `1px solid ${error ? "#ef4444" : theme.colors.border}`,
            }}
            autoFocus
          />

          {error && (
            <p className="text-xs text-red-400">
              {language === "zh" ? "密码错误，请重试" : "Wrong password, try again"}
            </p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: theme.colors.accent, color: "#fff" }}
          >
            {language === "zh" ? "进入编辑" : "Enter Editor"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs transition-colors hover:opacity-80"
            style={{ color: theme.colors.muted }}
          >
            {language === "zh" ? "← 返回首页" : "← Back to home"}
          </a>
        </div>
      </div>
    </div>
  );
}

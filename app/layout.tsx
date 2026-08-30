import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "李家豪｜AI 体验产品设计师",
  description:
    "李家豪（Leo.li）AI 体验产品设计作品集，聚焦 AI 问答、金融智能产品、复杂系统与 AI 辅助设计工作流。",
  openGraph: {
    title: "李家豪｜AI 体验产品设计师",
    description:
      "AI 体验产品设计师，关注可理解、可控、可信的智能产品体验。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

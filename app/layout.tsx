import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "李家豪｜AI 产品体验设计师",
  description:
    "李家豪（Leo.li）AI 体验产品设计作品集，聚焦 AI 问答、金融智能产品、复杂系统与 AI 辅助设计工作流。",
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "李家豪｜AI 产品体验设计师",
    description:
      "AI 产品体验设计师，从交互流程到设计系统，打磨清晰、好用的产品。",
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

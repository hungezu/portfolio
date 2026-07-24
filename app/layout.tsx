import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "李家豪｜高级 UX/UI 设计师",
  description:
    "李家豪（Leo.li）UX/UI 设计作品集，聚焦复杂系统处理、AI 产品体验、企业财税、政企平台与数据可视化。",
  openGraph: {
    title: "李家豪｜高级 UX/UI 设计师",
    description:
      "高级 UX/UI 设计师，具备复杂系统处理与 AI 产品体验经验。",
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

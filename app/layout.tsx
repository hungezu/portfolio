import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "李家豪 · UI/UX & Interaction Designer",
  description:
    "李家豪 UI/UX 与交互设计作品集，聚焦 B 端复杂系统、移动端体验、组件规范与可交付产品设计。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

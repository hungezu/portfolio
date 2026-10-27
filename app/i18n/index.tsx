"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import english from "./messages.en.json";
import "./language-switch.css";

export type Locale = "zh-CN" | "en";
const storageKey = "leo-portfolio-language";
const messages = english as Record<string, string>;
const escapedKeys = Object.keys(messages).filter(key => key.trim() && !/^\s+[\u3400-\u9fff]\s*$/.test(key)).sort((a, b) => b.length - a.length)
  .map(key => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const fragments = new RegExp(escapedKeys.join("|"), "g");

export function translateText(text: string, locale: Locale): string {
  if (locale === "zh-CN" || !/[\u3400-\u9fff，。；：（）、]/.test(text)) return text;
  const annotations = /^已标注\s*(\d+)\s*处$/.exec(text);
  if (annotations) return `${annotations[1]} annotations`;
  const metricQuery = /^按(.+)查询$/.exec(text);
  if (metricQuery) return `Query ${translateText(metricQuery[1], locale)}`;
  if (messages[text] !== undefined) return messages[text];
  const normalized = text.replace(/\s+/g, " ").trim();
  if (messages[normalized] !== undefined) return messages[normalized];
  // Compose labels containing a project name, number, or other runtime value.
  return text.replace(fragments, match => messages[match])
    .replace(/(20\d{2})\s*年/g, "$1")
    .replace(/（/g, " (").replace(/）/g, ")").replace(/：/g, ": ")
    .replace(/、/g, ", ").replace(/，/g, ", ").replace(/。/g, ".").replace(/；/g, "; ");
}

function initialLocale(): Locale {
  if (typeof window === "undefined") return "zh-CN";
  try { return window.localStorage.getItem(storageKey) === "en" ? "en" : "zh-CN"; }
  catch { return "zh-CN"; }
}

const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({ locale: "zh-CN", setLocale: () => {} });

const metadata: Record<string, [string, string]> = {
  home: ["李家豪｜AI 体验产品设计师", "李家豪（Leo.li）AI 体验产品设计作品集，聚焦 AI 问答、金融智能产品、复杂系统与 AI 辅助设计工作流。"],
  gkx: ["GKX｜门户与多系统体验设计｜李家豪", "GKX 项目案例：统一门户与多系统设计，梳理业务任务、操作反馈、AI 原型和设计交付核对。"],
  "zhaocai-smart": ["招财 Smart｜对话体验与回答规范｜李家豪", "招财 Smart 设计案例，聚焦财务问数中的口径确认、任务控制与 Markdown 回答规范，以原始设计稿和示例交互说明设计取舍。"],
  "tax-cloud": ["税纪云｜李家豪", "税纪云 2.0 跨端体验与全税种申报平台设计案例。"],
  "energy-tax": ["国家能源集团报税平台｜李家豪", "企业报税平台从 0 到 1 的界面与组件规范设计案例。"],
  "data-visualisation": ["可视化大屏｜李家豪", "多行业数据可视化大屏的信息层级、图表编排与视觉设计案例。"],
};

export function LocaleProvider({ children, projectSlug }: { children: ReactNode; projectSlug?: string }) {
  const [locale, updateLocale] = useState<Locale>("zh-CN");
  const readingPosition = useRef<{ element: HTMLElement | null; top: number; y: number } | null>(null);
  const setLocale = useCallback((next: Locale) => {
    if (next === document.documentElement.lang) return;
    const candidates = [...document.querySelectorAll<HTMLElement>("main section[id], main article[id], main header[id]")]
      .filter(element => element.getBoundingClientRect().top <= window.innerHeight * .3);
    const element = candidates.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0] ?? null;
    readingPosition.current = { element, top: element?.getBoundingClientRect().top ?? 0, y: window.scrollY };
    updateLocale(next);
    try { window.localStorage.setItem(storageKey, next); } catch { /* Keep the current-session choice when storage is unavailable. */ }
  }, []);

  useLayoutEffect(() => { updateLocale(initialLocale()); }, []);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    const position = readingPosition.current;
    if (position) {
      const y = position.element?.isConnected
        ? window.scrollY + position.element.getBoundingClientRect().top - position.top : position.y;
      window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
      readingPosition.current = null;
    }
  }, [locale]);

  useEffect(() => {
    const [title, description] = metadata[projectSlug ?? "home"] ?? metadata.home;
    document.title = translateText(title, locale);
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]']) {
      const meta = document.querySelector<HTMLMetaElement>(selector);
      if (meta) meta.content = translateText(description, locale);
    }
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = document.title;
  }, [locale, projectSlug]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey) setLocale(event.newValue === "en" ? "en" : "zh-CN");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [setLocale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const { locale, setLocale } = useContext(LocaleContext);
  const t = useCallback(<T,>(value: T): T => (typeof value === "string" ? translateText(value, locale) : value) as T, [locale]);
  const localize = useCallback(<T,>(value: T): T => {
    function walk(item: unknown): unknown {
      if (typeof item === "string") return translateText(item, locale);
      if (Array.isArray(item)) return item.map(walk);
      if (item && typeof item === "object" && !('$$typeof' in item)) {
        return Object.fromEntries(Object.entries(item).map(([key, field]) => [key, walk(field)]));
      }
      return item;
    }
    return walk(value) as T;
  }, [locale]);
  return { locale, setLocale, t, localize };
}

export function LanguageSwitch() {
  const { locale, setLocale } = useI18n();
  return <div className="language-switch" role="group" aria-label={locale === "en" ? "Language" : "语言"}>
    <button type="button" lang="zh-CN" aria-pressed={locale === "zh-CN"} onClick={() => setLocale("zh-CN")}>中文</button>
    <button type="button" lang="en" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
    <button className="language-switch-compact" type="button" lang={locale === "en" ? "zh-CN" : "en"}
      aria-label={locale === "en" ? "Switch to Chinese" : "切换到英文"}
      onClick={() => setLocale(locale === "en" ? "zh-CN" : "en")}>{locale === "en" ? "中文" : "EN"}</button>
  </div>;
}

const originalLanguage = { locale: "zh-CN" as const, setLocale: () => {} };
export function OriginalLanguage({ children }: { children: ReactNode }) {
  return <LocaleContext.Provider value={originalLanguage}>{children}</LocaleContext.Provider>;
}

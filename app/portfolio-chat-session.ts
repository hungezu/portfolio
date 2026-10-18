import { chatKnowledge, collectChatReferences, parseChatReplyContext } from "./chat-knowledge";
import type { ChatReplyContext, ChatReference } from "./chat-knowledge";

export type PortfolioChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  references?: ChatReference[];
  context?: ChatReplyContext;
  state?: "stopped" | "fallback";
  retryQuery?: string;
};
export type PortfolioChatMode = "unknown" | "api" | "local" | "local-fallback" | "guardrail";
export type PortfolioChatSession = {
  messages: PortfolioChatMessage[];
  draft: string;
  mode: PortfolioChatMode;
  /** null is the homepage; undefined identifies a session saved before page tracking existed. */
  pageProjectSlug?: string | null;
  /** The current subject is separate from historical message metadata after page navigation. */
  activeContext?: ChatReplyContext;
};

const SESSION_KEY = "portfolio-chat-session-v1";
const SESSION_VERSION = 3;
const MAX_MESSAGES = 40;
const MAX_SERIALIZED_LENGTH = 128_000;
const MODES: readonly PortfolioChatMode[] = ["unknown", "api", "local", "local-fallback", "guardrail"];

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function parseChatReference(value: unknown): ChatReference | undefined {
  if (!record(value) || typeof value.label !== "string" || !value.label.trim()
    || typeof value.href !== "string" || value.href.length > 300
    || (value.kind !== "section" && value.kind !== "project")) return undefined;
  const href = value.href;
  if (!href.startsWith("/portfolio/") || /[\\\u0000-\u0020\u007f]/.test(href) || href.includes("//")) return undefined;
  try {
    const url = new URL(href, "https://portfolio.invalid");
    const decodedPath = decodeURIComponent(url.pathname);
    if (url.origin !== "https://portfolio.invalid" || !url.pathname.startsWith("/portfolio/")
      || !decodedPath.startsWith("/portfolio/") || /[\\\u0000-\u0020\u007f]/.test(decodedPath)
      || decodedPath.includes("//") || decodedPath.split("/").some(part => part === "." || part === "..")) return undefined;
  } catch {
    return undefined;
  }
  return { label: value.label.trim().slice(0, 80), href, kind: value.kind };
}

function safeMessage(value: unknown, refreshKnowledge = false): PortfolioChatMessage | undefined {
  if (!record(value) || typeof value.id !== "string" || !/^[a-zA-Z0-9_.:-]{1,80}$/.test(value.id)
    || (value.role !== "assistant" && value.role !== "user")
    || typeof value.content !== "string" || !value.content.trim()) return undefined;
  const message: PortfolioChatMessage = {
    id: value.id,
    role: value.role,
    content: value.content.trim().slice(0, value.role === "assistant" ? 1800 : 600),
  };
  // References and answer metadata belong to assistant messages only.
  if (value.role === "assistant") {
    if (Array.isArray(value.references)) {
      const references = value.references.slice(0, 12).map(parseChatReference).filter((reference): reference is ChatReference => Boolean(reference)).slice(0, 3);
      if (references.length) message.references = references;
    }
    const context = parseChatReplyContext(value.context);
    if (context) message.context = context;
    // Older replies can be refreshed from trusted IDs without embedding retired names in the bundle.
    if (refreshKnowledge && value.state !== "stopped" && context?.entryIds.length) {
      const entries = context.entryIds.map(id => chatKnowledge.find(entry => entry.id === id)).filter(entry => entry !== undefined);
      if (entries.length) {
        message.content = entries.map(entry => `**${entry.title}**\n\n${entry.content}`).join("\n\n").slice(0, 1800);
        const references = collectChatReferences(entries, 3);
        if (references.length) message.references = references;
        else delete message.references;
      }
    }
    if (refreshKnowledge && value.state !== "stopped" && !context?.entryIds.length) {
      message.content = message.content
        .replace("我是 Leo 的作品集助手。可以帮你找案例、看经历，也聊设计思路和协作方式。", "我是李家豪的 AI 分身。可以聊聊我的项目经历、设计思路和协作方式。")
        .replace("我可以帮你了解 Leo 在这个项目中的职责、关键决策和交付内容。", "可以聊聊我在这个项目中的职责、关键决策和交付内容。")
        .replace("我是 Leo 的作品集助手。可以聊他的设计能力、工作经历、项目与协作方式", "我是李家豪的 AI 分身。可以聊聊我的设计能力、工作经历、项目与协作方式")
        .replace("我可以帮你了解 Leo 的项目、设计职责和工作方式", "可以继续聊我的项目、设计职责和工作方式");
    }
    if (value.state === "stopped" || value.state === "fallback") message.state = value.state;
    if (typeof value.retryQuery === "string" && value.retryQuery.trim()) message.retryQuery = value.retryQuery.trim().slice(0, 600);
  }
  return message;
}

function safeSession(value: unknown, refreshKnowledge = false): PortfolioChatSession | null {
  if (!record(value) || !Array.isArray(value.messages) || typeof value.draft !== "string") return null;
  const seenIds = new Set<string>();
  const valid = value.messages.map(message => safeMessage(message, refreshKnowledge)).filter((message): message is PortfolioChatMessage => {
    if (!message || seenIds.has(message.id)) return false;
    seenIds.add(message.id);
    return true;
  });
  if (!valid.length) return null;
  const first = valid[0];
  const messages = valid.length <= MAX_MESSAGES ? valid
    : first?.role === "assistant" ? [first, ...valid.slice(-(MAX_MESSAGES - 1))] : valid.slice(-MAX_MESSAGES);
  const pageProjectSlug = value.pageProjectSlug === null ? null
    : parseChatReplyContext({ projectSlug: value.pageProjectSlug, entryIds: [] })?.projectSlug;
  const activeContext = parseChatReplyContext(value.activeContext);
  return {
    messages,
    draft: value.draft.slice(0, 600),
    mode: MODES.includes(value.mode as PortfolioChatMode) ? value.mode as PortfolioChatMode : "unknown",
    ...(pageProjectSlug !== undefined ? { pageProjectSlug } : {}),
    ...(activeContext ? { activeContext } : {}),
  };
}

/** A tab's sessionStorage survives navigation, while request and panel state stay in memory. */
export function readChatSession(storage: Pick<Storage, "getItem">): PortfolioChatSession | null {
  try {
    const raw = storage.getItem(SESSION_KEY);
    if (!raw || raw.length > MAX_SERIALIZED_LENGTH) return null;
    const saved: unknown = JSON.parse(raw);
    if (!record(saved) || ![1, 2, SESSION_VERSION].includes(saved.version as number)) return null;
    return safeSession(saved, saved.version !== SESSION_VERSION);
  } catch {
    return null;
  }
}

export function writeChatSession(storage: Pick<Storage, "setItem">, session: PortfolioChatSession): void {
  try {
    const safe = safeSession(session);
    if (!safe) return;
    let raw = JSON.stringify({ version: SESSION_VERSION, ...safe });
    // Keep writes readable even with a full history of unusually large references and retry metadata.
    while (raw.length > MAX_SERIALIZED_LENGTH && safe.messages.length > 1) {
      safe.messages.splice(safe.messages[0].role === "assistant" ? 1 : 0, 1);
      raw = JSON.stringify({ version: SESSION_VERSION, ...safe });
    }
    if (raw.length <= MAX_SERIALIZED_LENGTH) storage.setItem(SESSION_KEY, raw);
  } catch {
    // Browsing and chatting remain available when sessionStorage is blocked or full.
  }
}

export function clearChatSession(storage: Pick<Storage, "removeItem">): void {
  try {
    storage.removeItem(SESSION_KEY);
  } catch {
    // Reset still clears React state if storage access is unavailable.
  }
}

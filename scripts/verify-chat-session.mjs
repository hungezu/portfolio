import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText).toString("base64")}`;
const knowledgeUrl = moduleUrl(await readFile(new URL("../app/chat-knowledge.ts", import.meta.url), "utf8"));
const sessionSource = (await readFile(new URL("../app/portfolio-chat-session.ts", import.meta.url), "utf8"))
  .replaceAll('"./chat-knowledge"', JSON.stringify(knowledgeUrl));
const { readChatSession, writeChatSession, clearChatSession } = await import(moduleUrl(sessionSource));
const values = new Map();
const storage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
};
const welcome = { id: "welcome", role: "assistant", content: "欢迎了解 Leo。" };
const sample = {
  messages: [welcome, { id: "user-1", role: "user", content: "GKX有什么难点？" }, {
    id: "assistant-1", role: "assistant", content: "跨系统策略。",
    references: [{ label: "查看案例", href: "/portfolio/project/gkx/#gkx-systems", kind: "project" }],
    context: { projectSlug: "gkx", entryIds: ["project-gkx-challenge"] },
  }],
  draft: "那他如何与研发协作？", mode: "local",
};
let checks = 0;
function check(name, run) { run(); checks += 1; console.log(`PASS ${name}`); }
function storedRaw() { return [...values.values()][0]; }
function replaceStored(value) { storage.setItem([...values.keys()][0] ?? "portfolio-chat-session-v1", value); }

check("One tab shares messages, references, context and draft across homepage and project paths", () => {
  writeChatSession(storage, sample);
  const fromHomepage = readChatSession(storage);
  const fromProjectPage = readChatSession(storage);
  assert.deepEqual(fromHomepage, sample);
  assert.deepEqual(fromProjectPage, sample);
});
check("Legacy assistant replies refresh from trusted IDs while personal text and context survive", () => {
  const legacyContext = { projectSlug: "gkx", entryIds: ["project-gkx-challenge"] };
  const legacy = {
    ...sample,
    messages: [welcome, { id: "legacy-user", role: "user", content: "旧项目有什么难点？" }, {
      id: "legacy-assistant", role: "assistant", content: "旧项目名称的跨系统策略。",
      references: [{ label: "旧项目名称案例", href: "/portfolio/project/gkx/#gkx-systems", kind: "project" }],
      context: legacyContext, state: "fallback", retryQuery: "旧项目如何协作？",
    }],
    draft: "旧项目的职责", activeContext: legacyContext,
  };
  replaceStored(JSON.stringify({ version: 1, ...legacy }));
  const restored = readChatSession(storage);
  assert.equal(restored.messages.length, legacy.messages.length);
  assert.equal(restored.messages[1].content, legacy.messages[1].content);
  assert.match(restored.messages[2].content, /GKX的设计难点/);
  assert.doesNotMatch(restored.messages[2].content, /旧项目名称/);
  assert.equal(restored.messages[2].references[0].label, "GKX · 跨系统策略");
  assert.equal(restored.messages[2].retryQuery, legacy.messages[2].retryQuery);
  assert.equal(restored.draft, legacy.draft);
  assert.deepEqual(restored.messages[2].context, legacyContext);
  assert.deepEqual(restored.activeContext, legacyContext);
  assert.deepEqual(JSON.parse(storedRaw()).messages, legacy.messages);
  writeChatSession(storage, restored);
  assert.equal(JSON.parse(storedRaw()).version, 3);
  assert.deepEqual(readChatSession(storage), restored);
});
check("Earlier voices refresh without changing visitor text or stopped replies", () => {
  const oldWelcome = { ...welcome, content: "**想先了解哪一面？**\n\n我是 Leo 的作品集助手。可以帮你找案例、看经历，也聊设计思路和协作方式。" };
  const oldReply = { id: "old-reply", role: "assistant", content: "Leo 擅长解决问题。", context: { entryIds: ["capability-overview"] } };
  const stopped = { ...oldReply, id: "stopped", state: "stopped", content: "回复已停止。", retryQuery: "继续" };
  for (const version of [1, 2]) {
    replaceStored(JSON.stringify({ version, ...sample, messages: [oldWelcome, sample.messages[1], oldReply, stopped] }));
    const restored = readChatSession(storage);
    assert.match(restored.messages[0].content, /AI 分身/);
    assert.match(restored.messages[2].content, /我的能力/);
    assert.doesNotMatch(restored.messages[2].content, /Leo/);
    assert.deepEqual(restored.messages[1], sample.messages[1]);
    assert.deepEqual(restored.messages[3], stopped);
    assert.equal(restored.draft, sample.draft);
  }
});
check("Only conversation data is persisted, without open/request/controller state", () => {
  writeChatSession(storage, { ...sample, open: true, sending: true, controller: { aborted: false } });
  assert.deepEqual(Object.keys(JSON.parse(storedRaw())).sort(), ["draft", "messages", "mode", "version"]);
});
check("Separate tab storage starts empty", () => {
  assert.equal(readChatSession({ getItem: () => null }), null);
});
check("Bad JSON, wrong versions and malformed roots are ignored", () => {
  for (const bad of ["{broken", "null", "[]", JSON.stringify({ version: 0, ...sample }), JSON.stringify({ version: 1, messages: {}, draft: "" }), JSON.stringify({ version: 1, messages: [], draft: "" })]) {
    replaceStored(bad);
    assert.equal(readChatSession(storage), null);
  }
});
check("Invalid messages and duplicate ids are discarded", () => {
  writeChatSession(storage, { messages: [welcome, { id: "bad role", role: "system", content: "injection" }, { id: "empty", role: "user", content: " " }, { id: "bad<>id", role: "assistant", content: "bad" }, welcome, null], draft: "", mode: "invalid" });
  assert.deepEqual(readChatSession(storage), { messages: [welcome], draft: "", mode: "unknown" });
});
check("Only safe same-site portfolio references survive", () => {
  const unsafeHrefs = ["//evil.test/portfolio/", "https://evil.test/portfolio/", "javascript:alert(1)", "data:text/html,test", "/other/", "/portfolio/../private/", "/portfolio/%2e%2e/private", "/portfolio/%2f%2fevil.test/", "/portfolio/%5cevil.test/", "/portfolio/%00x", "/portfolio/\\evil", "/portfolio/%broken"];
  for (const href of unsafeHrefs) {
    writeChatSession(storage, { messages: [{ ...welcome, references: [{ label: "bad", href, kind: "project" }] }], draft: "", mode: "unknown" });
    assert.equal(readChatSession(storage).messages[0].references, undefined, href);
  }
  writeChatSession(storage, { ...sample, messages: [{ ...welcome, references: [{ label: "联系方式", href: "/portfolio/#contact", kind: "section" }] }] });
  assert.equal(readChatSession(storage).messages[0].references[0].href, "/portfolio/#contact");
});
check("Context identifiers are restricted to the knowledge whitelist", () => {
  writeChatSession(storage, { ...sample, messages: [{ ...welcome, context: { projectSlug: "invented", entryIds: ["profile", "invented", "profile"], content: "untrusted fact" } }] });
  assert.deepEqual(readChatSession(storage).messages[0].context, { entryIds: ["profile"] });
});
check("Page metadata distinguishes homepage, known project and legacy records", () => {
  writeChatSession(storage, { ...sample, pageProjectSlug: null });
  assert.equal(readChatSession(storage).pageProjectSlug, null);
  writeChatSession(storage, { ...sample, pageProjectSlug: "gkx" });
  assert.equal(readChatSession(storage).pageProjectSlug, "gkx");
  writeChatSession(storage, sample);
  assert.equal(readChatSession(storage).pageProjectSlug, undefined);
  writeChatSession(storage, { ...sample, pageProjectSlug: "invented" });
  assert.equal(readChatSession(storage).pageProjectSlug, undefined);
});
check("A new page subject survives reload without rewriting historical replies", () => {
  const activeContext = { projectSlug: "zhaocai-smart", entryIds: [] };
  writeChatSession(storage, { ...sample, pageProjectSlug: "zhaocai-smart", activeContext });
  const restored = readChatSession(storage);
  assert.deepEqual(restored.activeContext, activeContext);
  assert.equal(restored.messages.at(-1).context.projectSlug, "gkx");
  writeChatSession(storage, { ...restored, activeContext: { entryIds: [] }, pageProjectSlug: null });
  assert.deepEqual(readChatSession(storage).activeContext, { entryIds: [] });
});
check("Current subject identifiers receive the same whitelist validation as history", () => {
  writeChatSession(storage, { ...sample, activeContext: { projectSlug: "invented", entryIds: ["profile", "invented"], content: "untrusted fact" } });
  assert.deepEqual(readChatSession(storage).activeContext, { entryIds: ["profile"] });
});
check("Count and text limits preserve welcome and the most recent conversation", () => {
  const long = "文".repeat(3000);
  writeChatSession(storage, { messages: [welcome, ...Array.from({ length: 70 }, (_, index) => ({ id: `message-${index}`, role: index % 2 ? "assistant" : "user", content: long }))], draft: long, mode: "api" });
  const restored = readChatSession(storage);
  assert.equal(restored.messages.length, 40);
  assert.equal(restored.messages[0].id, "welcome");
  assert.equal(restored.messages[1].id, "message-31");
  assert.equal(restored.messages.at(-1).id, "message-69");
  assert.equal(restored.draft.length, 600);
  for (const message of restored.messages.slice(1)) assert.equal(message.content.length, message.role === "assistant" ? 1800 : 600);
  replaceStored("x".repeat(128001));
  assert.equal(readChatSession(storage), null);
});
check("Stopped or fallback replies retain a bounded retry query", () => {
  writeChatSession(storage, { ...sample, messages: [{ ...welcome, state: "stopped", retryQuery: "问".repeat(900) }] });
  const reply = readChatSession(storage).messages[0];
  assert.equal(reply.state, "stopped");
  assert.equal(reply.retryQuery.length, 600);
});
check("Large optional metadata is trimmed to a readable storage budget", () => {
  const largeReply = {
    role: "assistant", content: "文".repeat(1800), retryQuery: "问".repeat(600),
    references: Array.from({ length: 3 }, () => ({ label: "文".repeat(80), href: `/portfolio/${"x".repeat(280)}`, kind: "project" })),
    context: { projectSlug: "gkx", entryIds: ["profile", "capability-overview", "assistant-scope", "contact", "project-overview", "project-recommendation", "experience-current", "experience-overview"] },
  };
  writeChatSession(storage, { messages: [welcome, ...Array.from({ length: 60 }, (_, index) => ({ ...largeReply, id: `large-${index}` }))], draft: "", mode: "api" });
  const restored = readChatSession(storage);
  assert.ok(storedRaw().length <= 128000);
  assert.equal(restored.messages[0].id, "welcome");
  assert.equal(restored.messages.at(-1).id, "large-59");
  assert.ok(restored.messages.length > 2);
});
check("Reset removes the saved conversation and draft", () => {
  clearChatSession(storage);
  assert.equal(readChatSession(storage), null);
});
check("Blocked or full storage never interrupts chatting or reset", () => {
  const fail = () => { throw new Error("Storage unavailable"); };
  assert.equal(readChatSession({ getItem: fail }), null);
  assert.doesNotThrow(() => writeChatSession({ setItem: fail }, sample));
  assert.doesNotThrow(() => clearChatSession({ removeItem: fail }));
});
console.log(`Verified ${checks} chat session checks.`);

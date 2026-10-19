"use client";

import { useEffect, useRef, useState } from "react";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import "./zhaocai-conversation-continuation.css";

type Turn = { id: number; question: string; kind: "quarter" | "compare" | "compare-clarify" | "cause" | "scope" | "unsupported" };
const suggestions = ["只看四季度", "四季度比一季度增长多少？", "为什么会增长？", "那华南分公司呢？"];

export function ZhaocaiConversationContinuation({ onSource }: { onSource: () => void }) {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [period, setPeriod] = useState("全年");
  const [announcement, setAnnouncement] = useState("");
  const latest = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (turns.length) latest.current?.focus({ preventScroll: true });
  }, [turns.length]);
  const send = (value: string) => {
    const text = value.trim();
    if (!text) return;
    const isComparison = /比.*一季度|增[长加]多少|变化多少/.test(text);
    const kind: Turn["kind"] = /华南|华东|华北|分公司/.test(text) ? "scope" : /为什么|原因|归因/.test(text) ? "cause" : isComparison ? (/四季度|第四季度/.test(text) || period === "四季度" ? "compare" : "compare-clarify") : /四季度|第四季度/.test(text) ? "quarter" : "unsupported";
    if (kind === "quarter" || kind === "compare") setPeriod("四季度");
    setTurns(current => [...current, { id: (current.at(-1)?.id ?? 0) + 1, question: text, kind }]);
    setQuestion("");
    setAnnouncement("追问已完成，统计时间、组织与指标继续保留。");
  };
  return <section className="zc-followup" aria-label="连续追问">
    <header><div><h4>沿着这份结果继续问</h4><p>时间、组织和指标随对话保留。</p></div>{turns.length ? <button type="button" onClick={() => { setTurns([]); setPeriod("全年"); setAnnouncement("已清空追问，保留原始查询结果。"); input.current?.focus(); }}><RotateCcw size={14} aria-hidden="true"/>清空追问</button> : null}</header>
    <div className="zc-followup-context" aria-label="追问沿用的条件"><span>2024 年 · {period}</span><span>全集团</span><span>净利润</span></div>
    {turns.length ? <div className="zc-followup-thread">{turns.map((turn, index) => <div className="zc-followup-turn" key={turn.id}>
      <p className="zc-followup-question"><span>你</span>{turn.question}</p>
      <div className="zc-followup-answer" ref={index === turns.length - 1 ? latest : undefined} tabIndex={-1} aria-label={`第 ${turn.id} 次追问的回答`}>
        <span>招财 Smart</span>
        {turn.kind === "quarter" ? <><h4>四季度净利润为 1.71 亿元</h4><p>统计范围缩小为 2024 年四季度；组织与净利润口径沿用上一问。</p><dl><div><dt>本次调整</dt><dd>全年 → 四季度</dd></div><div><dt>继续沿用</dt><dd>2024 年 / 全集团 / 净利润</dd></div></dl></> : null}
        {turn.kind === "compare" ? <><h4>比一季度增加 0.39 亿元</h4><p>四季度 1.71 亿元，一季度 1.32 亿元，增幅为 <strong>29.55%</strong>。</p><p className="zc-followup-formula">（1.71 − 1.32）÷ 1.32 × 100% = 29.55%</p><p>这是同年不同季度的比较；同比需要上年同期数据。</p></> : null}
        {turn.kind === "compare-clarify" ? <><h4>你想用哪个季度与一季度比较？</h4><p>当前范围是全年，尚未确定比较季度。确认后会沿用全集团净利润口径。</p><button className="zc-followup-source" type="button" onClick={() => send("四季度比一季度增长多少？")}>用四季度比较</button></> : null}
        {turn.kind === "cause" ? <><h4>当前数据可以说明变化，尚不能判断原因</h4><p>本次结果只包含季度净利润，没有收入、成本、费用或非经常性损益明细。</p><p>下一步可按相同期间和组织核对这些明细，再判断各项因素的影响。</p></> : null}
        {turn.kind === "scope" ? <><h4>切换组织后，需要重新查询</h4><p>当前示例只提供全集团数据，没有分公司明细，因此不沿用集团数值作答。</p><dl><div><dt>待调整</dt><dd>{turn.question.match(/华南分公司|华东分公司|华北分公司/)?.[0] ?? "分公司"}</dd></div><div><dt>保留条件</dt><dd>2024 年 / 净利润</dd></div></dl><p>你可以继续查看集团结果，或在完整数据环境中按新组织发起查询。</p></> : null}
        {turn.kind === "unsupported" ? <><h4>这份结果还不足以回答这个问题</h4><p>当前可继续查看四季度、比较一季度与四季度，或核对增长判断的边界。请选择下方追问，原查询条件会保留。</p></> : null}
        {turn.kind === "quarter" || turn.kind === "compare" ? <button className="zc-followup-source" type="button" onClick={onSource}>依据：本次季度净利润数据</button> : null}
      </div>
    </div>)}</div> : null}
    <div className="zc-followup-suggestions" role="group" aria-label="建议追问">{suggestions.map(text => <button type="button" key={text} onClick={() => send(text)}>{text}</button>)}</div>
    <form onSubmit={event => { event.preventDefault(); send(question); }}><label className="zc4-sr-only" htmlFor="zc-followup-question">继续追问</label><textarea id="zc-followup-question" ref={input} value={question} onChange={event => setQuestion(event.target.value)} placeholder="继续追问，例如：比一季度增长多少？" rows={2} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(question); } }}/><button type="submit" disabled={!question.trim()} aria-label="发送追问"><ArrowUp aria-hidden="true" size={18}/></button></form>
    <span className="zc4-sr-only" role="status">{announcement}</span>
  </section>;
}

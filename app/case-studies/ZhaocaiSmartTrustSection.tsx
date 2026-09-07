"use client";

import { type CSSProperties } from "react";
import { publicAsset } from "../portfolio-data";
import "./zhaocai-smart-02.css";

const customPosition = (values: Record<string, string>) => values as CSSProperties;

export function ZhaocaiSmartTrustSection() {
  return (
    <section className="zcs-business" id="strategy" data-zcv3-section aria-labelledby="zcs-business-title">
      <header className="zcs-framework-header">
        <p className="zcs-eyebrow">招财 Smart · 可信机制的建立</p>
        <h2 className="zcs-title" id="zcs-business-title">从模糊提问到可信结果，建立可确认、可核对的人机协作机制</h2>
      </header>

      <figure className="zcs-framework-figure" aria-label="问题背景、设计决策与价值目标">
        <div className="zcs-framework-scroll" tabIndex={0} role="region" aria-label="设计价值框架，可横向滚动">
          <div className="zcs-framework-crop">
            <img
              className="zcs-framework-image"
              src={publicAsset("/assets/projects/zhaocai-smart/zhaocai-smart-framework.png")}
              width="1723"
              height="913"
              decoding="async"
              alt="问题不清楚：查询前对齐意图；判断难：建立可信机制；专业门槛高：降低专业门槛；流程闭环难：重构任务工作流。价值目标为更易用、更可信、更高效。"
            />
          </div>
        </div>
        <p className="zcs-framework-hint">左右滑动查看完整框架</p>
      </figure>

      <section className="zcs-native-flow" aria-labelledby="zcs-flow-title">
        <header>
          <h3 className="zcs-title" id="zcs-flow-title">人机协作：从业务提问到分析结果</h3>
          <p className="zcs-intro">用户确认业务含义，AI 整理条件，数据服务执行查询。</p>
        </header>

        <figure className="zcs-figure" aria-label="用户、AI 助手与数据服务的查询协作流程">
          <div className="zcs-scroll" tabIndex={0} role="region" aria-label="查询流程图，可横向滚动" aria-describedby="zcs-flow-description">
            <div className="zcs-chart">
              <ol className="zcs-stages" aria-label="查询阶段">
                <li className="zcs-stage">提出问题</li>
                <li className="zcs-stage">识别条件</li>
                <li className="zcs-stage zcs-stage--confirm">确认口径</li>
                <li className="zcs-stage">执行查询</li>
                <li className="zcs-stage">结果复用</li>
              </ol>

              <p className="zcs-role" style={customPosition({ "--y": "28.888889%" })}>业务用户</p>
              <p className="zcs-role" style={customPosition({ "--y": "58.333333%" })}>AI 助手</p>
              <p className="zcs-role" style={customPosition({ "--y": "86.666667%" })}>数据服务</p>

              <svg className="zcs-wires" viewBox="0 0 1200 720" aria-hidden="true" focusable="false">
                <defs>
                  <marker id="zcs-arrow-neutral" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" fill="#777580" /></marker>
                  <marker id="zcs-arrow-purple" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" fill="#7456d7" /></marker>
                </defs>
                <path className="zcs-guide" d="M0 312H1188 M0 524H1188" />
                <path className="zcs-guide zcs-guide--vertical" d="M124 124V700 M340 124V700 M552 124V700 M764 124V700 M976 124V700" />
                <path className="zcs-wire" d="M234 258V408Q234 420 246 420H341" markerEnd="url(#zcs-arrow-neutral)" />
                <path className="zcs-wire" d="M551 420H658" />
                <path className="zcs-wire" d="M658 420H765" markerEnd="url(#zcs-arrow-neutral)" />
                <path className="zcs-wire zcs-wire--confirm zcs-wire--optional" d="M446 370V220Q446 208 458 208H553" markerEnd="url(#zcs-arrow-purple)" />
                <path className="zcs-wire zcs-wire--confirm" d="M658 258V408" markerEnd="url(#zcs-arrow-purple)" />
                <circle className="zcs-junction" cx="658" cy="420" r="5" />
                <path className="zcs-wire" d="M870 470V574" markerEnd="url(#zcs-arrow-neutral)" />
                <path className="zcs-wire" d="M975 624H1070Q1082 624 1082 612V470" markerEnd="url(#zcs-arrow-neutral)" />
                <path className="zcs-wire" d="M1082 370V258" markerEnd="url(#zcs-arrow-neutral)" />
                <g className="zcs-signal zcs-signal--clarify">
                  <path className="zcs-signal-trace zcs-signal-trace--halo" pathLength="100" d="M446 370V220Q446 208 458 208H553" />
                  <path className="zcs-signal-trace zcs-signal-trace--core" pathLength="100" d="M446 370V220Q446 208 458 208H553" />
                </g>
                <g className="zcs-signal zcs-signal--result" style={customPosition({ "--zcs-glow-delay": "5s" })}>
                  <path className="zcs-signal-trace zcs-signal-trace--halo" pathLength="100" d="M975 624H1070Q1082 624 1082 612V470" />
                  <path className="zcs-signal-trace zcs-signal-trace--core" pathLength="100" d="M975 624H1070Q1082 624 1082 612V470" />
                </g>
              </svg>

              <p className="zcs-node" style={customPosition({ "--x": "19.5%", "--y": "28.888889%" })}>提出分析问题</p>
              <p className="zcs-node" style={customPosition({ "--x": "37.166667%", "--y": "58.333333%" })}>识别查询条件</p>
              <p className="zcs-node zcs-node--confirm zcs-node--key" style={customPosition({ "--x": "54.833333%", "--y": "28.888889%" })}>确认利润口径</p>
              <p className="zcs-node" style={customPosition({ "--x": "72.5%", "--y": "58.333333%" })}>发起数据查询</p>
              <p className="zcs-node" style={customPosition({ "--x": "72.5%", "--y": "86.666667%" })}>查询业务数据</p>
              <p className="zcs-node zcs-node--key" style={customPosition({ "--x": "90.166667%", "--y": "58.333333%", "--zcs-glow-delay": "5s" })}>生成分析结果</p>
              <p className="zcs-node" style={customPosition({ "--x": "90.166667%", "--y": "28.888889%" })}>查看并保存</p>

              <span className="zcs-caption zcs-caption--optional" style={customPosition({ "--x": "38.5%", "--y": "38.888889%" })}>存在歧义</span>
              <span className="zcs-caption" style={customPosition({ "--x": "56.166667%", "--y": "38.888889%" })}>确认后继续</span>
              <span className="zcs-caption" style={customPosition({ "--x": "46%", "--y": "63.333333%" })}>条件完整，直接查询</span>
              <span className="zcs-caption" style={customPosition({ "--x": "73.833333%", "--y": "69.444444%" })}>查询条件</span>
              <span className="zcs-caption" style={customPosition({ "--x": "91.5%", "--y": "77.5%" })}>返回数据</span>
            </div>
          </div>
          <p className="zcs-scroll-hint">左右滑动查看完整流程</p>
          <figcaption className="zcs-note"><span>仅在关键条件存在歧义时，请用户确认。</span></figcaption>
          <p className="zcs-sr-only" id="zcs-flow-description">用户提出问题后，AI 识别查询条件。条件完整时直接发起查询；存在歧义时请用户确认利润口径，再继续查询。数据服务返回数据后，AI 生成分析结果，用户查看并保存。</p>
        </figure>

        <div className="zcs-rules">
          <h4>何时直接查询，何时需要澄清</h4>
          <p className="zcs-rules-intro">按已识别条件推进，只补齐影响查询的关键信息。</p>
          <div className="zcs-examples">
            <article className="zcs-example" aria-label="条件完整的提问示例">
              <span className="zcs-example-label">条件完整</span>
              <span className="zcs-example-title">查看 2024 年全集团<br />净利润变化</span>
              <span className="zcs-example-copy">时间、范围与指标均已明确。<br />直接查询，保持任务连续。</span>
            </article>
            <article className="zcs-example zcs-example--ambiguous" aria-label="口径存在歧义的提问示例">
              <span className="zcs-example-label">口径存在歧义</span>
              <span className="zcs-example-title">查看 2024 年全集团<br /><u>利润</u>变化</span>
              <span className="zcs-example-copy">「利润」可能对应不同统计口径。<br />只确认歧义项，保留已识别条件。</span>
            </article>
          </div>
          <p className="zcs-boundary"><strong>协作边界：</strong>AI 整理与执行，用户确认业务含义。</p>
        </div>
      </section>
    </section>
  );
}

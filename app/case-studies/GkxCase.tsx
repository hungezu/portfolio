"use client";

import { type Project } from "../portfolio-data";
import { ProjectLocator } from "../project-locator";
import "./gkx-case.css";

export type GkxCaseProps = { project: Project };

const sections = [
  ["gkx-overview", "项目概览"],
  ["gkx-background", "项目背景"],
] as const;

export function GkxCase({ project }: GkxCaseProps) {
  return <article className="gkx-case">
    <ProjectLocator sections={sections} ariaLabel="深圳国际科技信息中心项目章节定位" />
    <header id="gkx-overview" className="gkx-hero">
      <h1>{project.title}</h1>
      <p className="gkx-hero__subtitle">科技信息服务、战略咨询与 AI 教育</p>
    </header>

    <section id="gkx-background" className="gkx-background-block">
      <header><h2>项目背景与我的角色</h2><p>国科信是一个面向科技信息服务、战略研究与 AI 教育的综合平台。以智慧服务门户为统一入口，连接多个业务系统与公共能力。</p></header>
      <dl id="gkx-scope" className="gkx-project-brief">
        <div><dt>我的角色</dt><dd><strong>项目设计负责人</strong><span>整体视觉与 UX/UI · 核心系统设计 · 设计规范与多方方案评审 · AI 原型支持</span></dd></div>
      </dl>
      <div className="gkx-business-map" aria-label="产品业务架构简图">
        <div className="gkx-map-entry"><strong>智慧服务门户</strong><span>统一的用户入口</span></div>
        <div className="gkx-map-directions">
          <div><h3>AI 战略咨询</h3><p>科技情报挖掘与知识服务 · 科技信息展示<br />新型高端智库 · 科技专题服务</p></div>
          <div><h3>AI 教育</h3><p>科创教育平台<br />学、玩、练、训</p></div>
        </div>
        <div className="gkx-map-foundation">
          <div className="gkx-map-base"><strong>公共支撑</strong><p>社区运营、内容运营、用户与权限</p></div>
          <div className="gkx-map-base"><strong>底层能力</strong><p>智能体开发、知识图谱、深度挖掘算法、模型训练与推理</p></div>
        </div>
      </div>
    </section>
  </article>;
}

"use client";
import { useI18n } from "../i18n";
import { Button } from "@arco-design/web-react";
import { IconArrowLeft, IconArrowRight } from "@arco-design/web-react/icon";
import "./gkx-standards-applications.css";

export type GkxStandardsApplicationAsset = { src: string; alt: string; caption: string; width: number; height: number };
type AssetKey = "paperList" | "paperDetail" | "paperEdit" | "importError" | "workflowBuilder" | "maas";
const applications: Array<{ page: string; topic: string; check: string; examples: Array<{ label: string; assetKey: AssetKey }> }> = [
  { page: "流程设计器", topic: "流程设计 · 页面类型", check: "列表保留流程身份与发布状态；画布组织节点关系，属性面板配置当前节点。", examples: [{ label: "流程图稿", assetKey: "workflowBuilder" }] },
  { page: "MaaS 模型广场", topic: "资源目录 · 规范应用对照", check: "类别、能力与厂商用于筛选；模型状态与后续入口留在候选卡片中。", examples: [{ label: "模型界面", assetKey: "maas" }] },
  { page: "对象列表与单条处理", topic: "管理列表 · 对话框", check: "详情与编辑围绕同一记录；核对提交反馈、未保存修改与返回后的列表条件。", examples: [{ label: "列表", assetKey: "paperList" }, { label: "详情", assetKey: "paperDetail" }] },
  { page: "批量导入异常", topic: "批量导入 · 上传", check: "错误反馈定位到问题行，并提供重新上传入口；完整恢复流程需结合实现核对。", examples: [{ label: "反馈界面", assetKey: "importError" }] },
];
export function GkxStandardsApplications({ assets, onOpen, onReturn }: {
  assets: Record<AssetKey, GkxStandardsApplicationAsset>;
  onOpen: (asset: GkxStandardsApplicationAsset, trigger: HTMLButtonElement) => void;
  onReturn?: () => void;
}) {
  const { t } = useI18n();
  return <article id="gkx-standards-applications" className="gkx-standards-applications" aria-label={t("GKX页面与设计规范的对应示例")} tabIndex={-1}>
    {onReturn && <Button type="outline" icon={<IconArrowLeft aria-hidden="true" />} onClick={onReturn}>{t("返回刚才位置")}</Button>}
    <div className="gkx-standard-uses">{applications.map(item => <section key={item.page}>
      <header><h3>{t(item.page)}</h3><p>{t(item.topic)}</p></header>
      <p className="gkx-standard-use-check">{t(item.check)}</p>
      <div className="gkx-standard-use-actions">{item.examples.map(example => <button type="button" key={example.assetKey} onClick={event => onOpen(assets[example.assetKey], event.currentTarget)}>{t(example.label)}<IconArrowRight aria-hidden="true" /></button>)}</div>
    </section>)}</div>
  </article>;
}

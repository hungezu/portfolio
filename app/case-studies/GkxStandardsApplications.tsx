"use client";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { publicAsset } from "../portfolio-data";
import { Button } from "@arco-design/web-react";
import { IconArrowLeft, IconArrowRight } from "@arco-design/web-react/icon";
import { GkxEvidenceCarousel } from "./GkxEvidenceCarousel";
import { GkxEvidenceSurface } from "./GkxEvidenceSurface";
import "./gkx-standards-applications.css";
import "./gkx-standards-stage.css";

export type GkxStandardsApplicationAsset = { src: string; alt: string; caption: string; width: number; height: number };
type AssetKey = "paperList" | "paperDetail" | "paperEdit" | "importError" | "workflowBuilder" | "maas";
const applications: Array<{
  id: string; page: string; check: string;
  preview: { assetKey: AssetKey; viewBox: string; compactViewBox: string };
  supplemental?: Array<{ label: string; assetKey: AssetKey }>;
}> = [
  { id: "workflow", page: "流程设计器", check: "列表保留流程身份与发布状态；画布组织节点关系，属性面板配置当前节点。", preview: { assetKey: "workflowBuilder", viewBox: "854 258 856 490", compactViewBox: "854 258 856 490" } },
  { id: "maas", page: "MaaS 模型广场", check: "本例展示我设计的模型选择流程：按类别、能力与厂商筛选，再通过卡片查看模型状态、进入后续操作，说明共用控件如何适配资源选择。", preview: { assetKey: "maas", viewBox: "226 168 1130 382", compactViewBox: "244 284 386 242" } },
  { id: "record", page: "对象列表与单条处理", check: "详情与编辑围绕同一记录；核对提交反馈、未保存修改与返回后的列表条件。", preview: { assetKey: "paperDetail", viewBox: "384 32 672 736", compactViewBox: "384 32 672 736" }, supplemental: [{ label: "列表", assetKey: "paperList" }, { label: "编辑", assetKey: "paperEdit" }] },
  { id: "import", page: "批量导入异常", check: "错误反馈定位到问题行，并提供重新上传入口；完整恢复流程需结合实现核对。", preview: { assetKey: "importError", viewBox: "464 104 512 592", compactViewBox: "464 104 512 592" } },
];
export function GkxStandardsApplications({ assets, onOpen, onReturn }: {
  assets: Record<AssetKey, GkxStandardsApplicationAsset>;
  onOpen: (asset: GkxStandardsApplicationAsset, trigger: HTMLButtonElement) => void;
  onReturn?: () => void;
}) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(2);
  const fromReference = Boolean(onReturn);
  useEffect(() => {
    if (fromReference) setActiveIndex(2);
  }, [fromReference]);
  return <article id="gkx-standards-applications" className="gkx-standards-applications" aria-label={t("GKX页面与设计规范的对应示例")} tabIndex={-1}>
    {onReturn && <Button type="outline" icon={<IconArrowLeft aria-hidden="true" />} onClick={onReturn}>{t("返回刚才位置")}</Button>}
    <GkxEvidenceCarousel
      className="gkx-standards-stage"
      label={t("GKX页面与设计规范的对应示例")}
      previousLabel={t("上一类页面")}
      nextLabel={t("下一类页面")}
      tabsLabel={t("选择规范应用页面")}
      reserveHeight={false}
      activeIndex={activeIndex}
      onIndexChange={setActiveIndex}
      items={applications.map(item => {
        const asset = assets[item.preview.assetKey];
        const openLabel = t(`查看原图：${asset.caption}`);
        return {
          id: item.id,
          title: t(item.page),
          content: <div className="gkx-standard-stage__content">
            <div className="gkx-standard-stage__copy">
              <p className="gkx-standard-stage__check">{t(item.check)}</p>
              {item.supplemental && <div className="gkx-standard-stage__actions">{item.supplemental.map(example => <button type="button" key={example.assetKey} aria-label={t(`查看原图：${assets[example.assetKey].caption}`)} onClick={event => onOpen(assets[example.assetKey], event.currentTarget)}>{t(example.label)}<IconArrowRight aria-hidden="true" /></button>)}</div>}
            </div>
            <figure className="gkx-standard-stage__figure">
              <GkxEvidenceSurface><button type="button" className="gkx-standard-stage__image" style={{ maxWidth: Math.min(1000, Number(item.preview.viewBox.split(/\s+/)[2])) }} aria-label={openLabel} onClick={event => onOpen(asset, event.currentTarget)}>
                <svg className="gkx-standard-stage__wide" viewBox={item.preview.viewBox} role="img" aria-label={t(asset.alt)}><image href={publicAsset(asset.src)} width={asset.width} height={asset.height} /></svg>
                <svg className="gkx-standard-stage__compact" viewBox={item.preview.compactViewBox} role="img" aria-label={t(asset.alt)}><image href={publicAsset(asset.src)} width={asset.width} height={asset.height} /></svg>
              </button></GkxEvidenceSurface>
            </figure>
          </div>,
        };
      })}
    />
  </article>;
}

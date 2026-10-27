"use client";
import { useI18n } from "../i18n";


import { Button, Table } from "@arco-design/web-react";
import { IconArrowLeft, IconArrowRight, IconImage } from "@arco-design/web-react/icon";
import "./gkx-standards-applications.css";

export type GkxStandardsApplicationAsset = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

type AssetKey = "paperList" | "paperDetail" | "paperEdit" | "importError";

type StandardsApplication = {
  key: string;
  page: string;
  topic: string;
  check: string;
  examples: Array<{ label: string; assetKey: AssetKey }>;
};

const applications: StandardsApplication[] = [
  {
    key: "paper-list",
    page: "论文管理列表",
    topic: "管理列表 · 表格",
    check: "查找目标、筛选范围和操作顺序是否一致。",
    examples: [{ label: "查看列表", assetKey: "paperList" }],
  },
  {
    key: "paper-detail-edit",
    page: "论文详情与编辑",
    topic: "对象详情 · 对话框",
    check: "对象信息、字段与返回路径是否明确。",
    examples: [
      { label: "详情", assetKey: "paperDetail" },
      { label: "编辑", assetKey: "paperEdit" },
    ],
  },
  {
    key: "import-error",
    page: "批量导入异常",
    topic: "批量导入 · 上传",
    check: "错误行是否清楚，能否修改后重新上传。",
    examples: [{ label: "查看反馈", assetKey: "importError" }],
  },
];

export function GkxStandardsApplications({ assets, onOpen, onReturn }: {
  assets: Record<AssetKey, GkxStandardsApplicationAsset>;
  onOpen: (asset: GkxStandardsApplicationAsset, trigger: HTMLButtonElement) => void;
  onReturn?: () => void;
}) {
  const { t, localize } = useI18n();
  return <article id="gkx-standards-applications" className="gkx-standards-applications" aria-labelledby="gkx-standards-applications-title" tabIndex={-1}>
    {t(onReturn && <div className="gkx-standards-applications__return-context"><span>{t("来自 AI 实践 · 复用规则")}</span><Button type="outline" icon={<IconArrowLeft aria-hidden="true" />} className="gkx-standards-applications__return" onClick={onReturn}>{t("返回刚才位置")}</Button></div>)}
    <header>
      <h4 id="gkx-standards-applications-title">{t("这些规范如何用于GKX")}</h4>
      <p>{t("以论文管理的三个任务为例，将公开目录中的规范主题与核对重点对应到具体界面。")}</p>
    </header>
    <Table<StandardsApplication>
      aria-label={t("GKX页面与设计规范的对应示例")}
      rowKey="key"
      data={localize(applications)}
      pagination={false}
      hover={false}
      size="default"
      tableLayoutFixed
      border={{ wrapper: false, headerCell: false, bodyCell: false }}
      scroll={{ x: 1080 }}
      columns={localize([
        { title: "实际页面", dataIndex: "page", width: 180 },
        { title: "规范主题", dataIndex: "topic", width: 250 },
        { title: "核对重点", dataIndex: "check", width: 370 },
        {
          title: "界面示例",
          dataIndex: "examples",
          width: 280,
          render: (_value: StandardsApplication["examples"], record: StandardsApplication) => <div className="gkx-standards-applications__actions">
            {record.examples.map(example => <Button
              key={example.assetKey}
              type="outline"
              className="gkx-standards-applications__open"
              icon={<IconImage aria-hidden="true" />}
              aria-label={t(`查看${record.page}的${example.label.replace(/^查看/, "")}界面示例`)}
              onClick={event => {
                if (event.currentTarget instanceof HTMLButtonElement) onOpen(assets[example.assetKey], event.currentTarget);
              }}
            >
              <span>{t(example.label)}</span>
              <IconArrowRight aria-hidden="true" />
            </Button>)}
          </div>,
        },
      ])}
    />
  </article>;
}

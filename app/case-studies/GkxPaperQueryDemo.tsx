"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button, Card, ConfigProvider, Empty, Input, Link, Pagination, Select, Space, Table } from "@arco-design/web-react";
import zhCN from "@arco-design/web-react/es/locale/zh-CN";
import enUS from "@arco-design/web-react/es/locale/en-US";
import type { ColumnProps } from "@arco-design/web-react/es/Table/interface";
import { useI18n } from "../i18n";
import { emptyRecordQuery, queryResearchRecords, researchRecords, researchRecordsEnglish, type QueryLayout, type RecordKind, type RecordQuery, type ResearchRecord } from "./gkx-paper-query";
import { GkxSegmentedControl } from "./GkxSegmentedControl";
import "./gkx-paper-query-demo.css";

export function GkxPaperQueryDemo() {
  const { locale } = useI18n();
  const english = locale === "en";
  const label = (zh: string, en: string) => english ? en : zh;
  const id = useId();
  const containerRef = useRef<HTMLElement>(null);
  const [kind, setKind] = useState<RecordKind>("paper");
  const [layout, setLayout] = useState<QueryLayout>("unified");
  const [draft, setDraft] = useState<RecordQuery>(() => emptyRecordQuery("unified"));
  const [applied, setApplied] = useState<RecordQuery>(() => emptyRecordQuery("unified"));
  const [announcement, setAnnouncement] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const records = (english ? researchRecordsEnglish : researchRecords)[kind];
  const institutions = [...new Set(records.map(record => record.institution))];
  const rows = queryResearchRecords(records, applied);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  const visibleRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const recordName = kind === "paper" ? label("论文", "paper") : label("专利", "patent");
  const titleLabel = kind === "paper" ? label("论文标题", "Paper title") : label("专利标题", "Patent title");
  const popupContainer = () => containerRef.current ?? document.body;
  const paginationSelectProps = { "aria-label": label("每页条数", "Records per page"), getPopupContainer: popupContainer };
  // Paired sample data changes language; do not retain a filter in the other language.
  useEffect(() => {
    setDraft(emptyRecordQuery(layout)); setApplied(emptyRecordQuery(layout)); setPage(1); setAnnouncement("");
  }, [locale]);
  function resetView(nextLayout = layout) {
    setDraft(emptyRecordQuery(nextLayout)); setApplied(emptyRecordQuery(nextLayout)); setPage(1);
  }
  function clearConditions() {
    resetView();
    setAnnouncement(label(`已清空条件，显示全部 ${records.length} 条${recordName}记录。`, `Filters cleared. Showing all ${records.length} ${recordName} records.`));
  }
  function switchKind(next: RecordKind) {
    if (next === kind) return;
    setKind(next); resetView();
    setAnnouncement(label(`已切换至${next === "paper" ? "论文" : "专利"}记录，查询规则保持一致。`, `Switched to ${next} records. The same query rules apply.`));
  }
  function switchLayout(next: QueryLayout) {
    if (next === layout) return;
    setLayout(next); resetView(next);
    setAnnouncement(label(`已切换至${next === "unified" ? "统一查询" : "原查询"}布局，查询条件已清空。`, `Switched to the ${next} query layout. Filters cleared.`));
  }
  function submitQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setApplied(draft); setPage(1);
    const count = queryResearchRecords(records, draft).length;
    setAnnouncement(label(`查询完成，找到 ${count} 条${recordName}记录。`, `Query complete. Found ${count} ${recordName} ${count === 1 ? "record" : "records"}.`));
  }
  const columns: ColumnProps<ResearchRecord>[] = [
    { title: "ID", dataIndex: "id", width: 176 },
    { title: titleLabel, dataIndex: "title", width: 248, ellipsis: true, render: (value: string) => <span title={value}>{value}</span> },
    { title: label("关键词", "Keywords"), dataIndex: "keywords", width: 224, ellipsis: true, render: (value: string[]) => <span title={value.join(english ? ", " : "、")}>{value.join(english ? ", " : "、")}</span> },
    { title: label("作者", "Author"), dataIndex: "author", width: 94 },
    { title: label("作者机构", "Institution"), dataIndex: "institution", width: 202, ellipsis: true },
    { title: label("操作", "Actions"), width: 180, render: (_, record) => <Space size={12}>
      <Link disabled hoverable={false} aria-label={label(`查看 ${record.id} 详情（演示不可用）`, `View ${record.id} details (unavailable in this demo)`)}>{label("详情", "Details")}</Link>
      <Link disabled hoverable={false} aria-label={label(`编辑 ${record.id}（演示不可用）`, `Edit ${record.id} (unavailable in this demo)`)}>{label("编辑", "Edit")}</Link>
      <Link disabled hoverable={false} status="error" aria-label={label(`删除 ${record.id}（演示不可用）`, `Delete ${record.id} (unavailable in this demo)`)}>{label("删除", "Delete")}</Link>
    </Space> },
  ];
  return <section ref={containerRef} className="gkx-paper-demo" aria-label={label("记录管理交互复现", "Record query reconstruction")} lang={english ? "en" : "zh-CN"}>
    <ConfigProvider locale={english ? enUS : zhCN} autoInsertSpaceInButton={false} getPopupContainer={popupContainer}>
      <Card className="gkx-paper-demo__panel">
        <div className="gkx-paper-demo__controlbar">
          <span className="gkx-paper-demo__sample">{label("本页复现 · 虚构示例记录", "Reconstruction · Fictional sample records")}</span>
          <GkxSegmentedControl<QueryLayout> label={label("查询布局对照", "Compare query layouts")} value={layout} onChange={switchLayout} options={[{ label: label("原查询布局", "Original layout"), value: "original" }, { label: label("统一查询布局", "Shared layout"), value: "unified" }]} />
          <div className="gkx-paper-demo__reuse"><GkxSegmentedControl<RecordKind> label={label("切换记录类型", "Choose record type")} value={kind} onChange={switchKind} options={[{ label: label("论文记录", "Papers"), value: "paper" }, { label: label("专利记录", "Patents"), value: "patent" }]} /></div>
        </div>
        <div className="gkx-paper-demo__workspace"><div className="gkx-paper-demo__workarea">
          <form className="gkx-paper-demo__form" onSubmit={submitQuery}>
            {layout === "original" && <div className="gkx-paper-demo__field"><label htmlFor={`${id}-record-id`}>ID:</label><Input autoComplete="off" id={`${id}-record-id`} aria-label="ID" style={{ width: "var(--gkx-query-width, 280px)" }} value={draft.recordId} onChange={recordId => setDraft({ ...draft, recordId })} placeholder={kind === "paper" ? label("如 P001", "e.g. P001") : label("如 Z001", "e.g. Z001")} /></div>}
            <div className="gkx-paper-demo__field"><label htmlFor={`${id}-query`}>{layout === "unified" ? label("搜索：", "Search:") : label("名称/标题：", "Title:")}</label><Input autoComplete="off" id={`${id}-query`} aria-label={layout === "unified" ? label("搜索", "Search") : titleLabel} style={{ width: "var(--gkx-query-width, 280px)" }} value={draft.text} onChange={text => setDraft({ ...draft, text })} placeholder={layout === "unified" ? label(`请输入${recordName}标题/关键词`, `Search ${recordName} titles or keywords`) : label("请输入标题", "Enter a title")} /></div>
            {layout === "unified" && <div className="gkx-paper-demo__field"><label htmlFor={`${id}-institution`}>{label("作者机构：", "Institution:")}</label><Select id={`${id}-institution`} aria-label={label("作者机构", "Institution")} style={{ width: "var(--gkx-query-width, 220px)" }} value={draft.institution} onChange={institution => setDraft({ ...draft, institution })} options={[{ label: label("全部机构", "All institutions"), value: "" }, ...institutions]} getPopupContainer={popupContainer} /></div>}
            <Space size={10}><Button type="primary" htmlType="submit">{label("查询", "Search")}</Button><Button onClick={clearConditions}>{label("重置", "Reset")}</Button></Space>
          </form>
          <div className="gkx-paper-demo__table-space"><p className="gkx-paper-demo__table-hint">{label("左右滑动查看完整表格", "Scroll horizontally to read the full table")}</p>
            <Table<ResearchRecord> aria-label={label(`${recordName}查询结果`, `${kind === "paper" ? "Paper" : "Patent"} search results`)} rowKey="id" columns={columns} data={visibleRows} pagination={false} size="middle" tableLayoutFixed border={{ wrapper: true, headerCell: false, bodyCell: false }} scroll={{ x: 1160 }} rowSelection={{ type: "checkbox", checkAll: true, columnWidth: 36, selectedRowKeys: [], checkboxProps: record => ({ disabled: true, "aria-label": label(`选择记录 ${record.id}（演示不可用）`, `Select ${record.id} (unavailable in this demo)`) }) }} noDataElement={<Empty description={<div>{label(`没有找到匹配的${recordName}`, `No matching ${recordName} records`)}<div><Button type="text" onClick={clearConditions}>{label("清空查询条件", "Clear filters")}</Button></div></div>} />} />
          </div>
          <div className="gkx-paper-demo__pagination"><Pagination current={currentPage} pageSize={pageSize} total={rows.length} showTotal={total => label(`共计 ${total} 条`, `${total} ${total === 1 ? "record" : "records"}`)} sizeCanChange sizeOptions={[10, 5]} showJumper={false} onChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1); }} selectProps={paginationSelectProps} /></div>
        </div></div>
        <p className="gkx-paper-demo__feedback" role="status" aria-live="polite" aria-atomic="true">{announcement || label("搜索覆盖标题与关键词，机构独立筛选；仅查询与筛选可操作，行操作不在本次复现范围内。", "Search titles and keywords, then filter by institution. This reconstruction supports queries and filters; row actions are unavailable.")}</p>
      </Card>
    </ConfigProvider>
  </section>;
}

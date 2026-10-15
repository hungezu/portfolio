"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Alert, Button, Card, ConfigProvider, Descriptions, Empty, Form, Input, Link, List, Modal, Pagination, Radio, Select, Space, Table } from "@arco-design/web-react";
import { IconFile, IconPlus } from "@arco-design/web-react/icon";
import zhCN from "@arco-design/web-react/es/locale/zh-CN";
import type { ColumnProps } from "@arco-design/web-react/es/Table/interface";
import { emptyRecordQuery, queryResearchRecords, researchRecords, type QueryLayout, type RecordKind, type RecordQuery, type ResearchRecord } from "./gkx-paper-query";
import "./gkx-paper-query-demo.css";

type ModalState = { action: "detail" | "edit" | "delete"; record: ResearchRecord } | { action: "add" | "import" };
type RecordFields = { title: string; keywords: string; author: string; institution: string };
const blankFields = (): RecordFields => ({ title: "", keywords: "", author: "", institution: "清华大学" });
const institutions = ["清华大学", "北京大学", "复旦大学"];
const importExample = [
  { title: "多模态知识检索方法研究", keywords: ["知识检索", "多模态"], author: "沈知", institution: "清华大学" },
  { title: "面向科研数据的语义关联方法", keywords: ["语义关联", "科研数据"], author: "陆川", institution: "北京大学" },
];

export function GkxPaperQueryDemo() {
  const id = useId();
  const containerRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [kind, setKind] = useState<RecordKind>("paper");
  const [layout, setLayout] = useState<QueryLayout>("unified");
  const [records, setRecords] = useState(() => ({ paper: [...researchRecords.paper], patent: [...researchRecords.patent] }));
  const [draft, setDraft] = useState<RecordQuery>(() => emptyRecordQuery("unified"));
  const [applied, setApplied] = useState<RecordQuery>(() => emptyRecordQuery("unified"));
  const [announcement, setAnnouncement] = useState("");
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [fields, setFields] = useState<RecordFields>(blankFields);
  const [importReady, setImportReady] = useState(false);
  const [modalError, setModalError] = useState("");
  const rows = queryResearchRecords(records[kind], applied);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const recordName = kind === "paper" ? "论文" : "专利";
  const popupContainer = () => containerRef.current ?? document.body;
  const paginationSelectProps = { "aria-label": "每页条数", getPopupContainer: popupContainer };

  function resetView(nextLayout = layout) {
    const empty = emptyRecordQuery(nextLayout);
    setDraft(empty); setApplied(empty); setSelected([]); setPage(1);
  }
  function clearConditions() {
    resetView();
    setAnnouncement(`已清空条件，显示全部 ${records[kind].length} 条${recordName}记录。`);
  }
  function switchKind(next: RecordKind) {
    if (next === kind) return;
    setKind(next); resetView();
    setAnnouncement(`已切换至${next === "paper" ? "论文" : "专利"}管理，查询规则保持一致。`);
  }
  function switchLayout(next: QueryLayout) {
    if (next === layout) return;
    setLayout(next); resetView(next);
    setAnnouncement(`已切换至${next === "unified" ? "统一查询" : "原查询"}布局，查询条件已清空。`);
  }
  function submitQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setApplied(draft); setPage(1); setSelected([]);
    setAnnouncement(`查询完成，找到 ${queryResearchRecords(records[kind], draft).length} 条${recordName}记录。`);
  }
  function openModal(next: ModalState) {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModalError("");
    if (next.action === "edit") setFields({ ...next.record, keywords: next.record.keywords.join("、") });
    else setFields(blankFields());
    if (next.action === "import") setImportReady(false);
    setModal(next);
  }
  function closeModal() { setModal(null); }
  function restoreFocus() {
    if (openerRef.current?.isConnected) openerRef.current.focus();
    else document.getElementById(`${id}-query`)?.focus();
  }
  function nextRecordId(list: ResearchRecord[], offset = 0) {
    const next = Math.max(0, ...list.map((record) => Number(record.id.slice(1)) || 0)) + 1 + offset;
    return `${kind === "paper" ? "P" : "Z"}${String(next).padStart(3, "0")}`;
  }
  function saveRecord() {
    const keywords = fields.keywords.split(/[、,，]/).map((word) => word.trim()).filter(Boolean);
    if (!fields.title.trim() || !fields.author.trim() || !keywords.length) { setModalError("请填写标题、关键词与作者。"); return; }
    const record: ResearchRecord = {
      id: modal?.action === "edit" ? modal.record.id : nextRecordId(records[kind]),
      title: fields.title.trim(), author: fields.author.trim(), institution: fields.institution, keywords,
    };
    setRecords((previous) => ({ ...previous, [kind]: modal?.action === "edit" ? previous[kind].map((item) => item.id === record.id ? record : item) : [...previous[kind], record] }));
    setPage(1); setAnnouncement(`已${modal?.action === "edit" ? "保存修改" : "新增记录"}。本次修改仅保留在当前演示中。`); closeModal();
  }
  function deleteRecord() {
    if (modal?.action !== "delete") return;
    const recordId = modal.record.id;
    setRecords((previous) => ({ ...previous, [kind]: previous[kind].filter((record) => record.id !== recordId) }));
    setSelected((previous) => previous.filter((key) => key !== recordId));
    setPage(1); setAnnouncement(`已删除示例记录 ${recordId}。刷新页面可恢复原始示例数据。`); closeModal();
  }
  function importRecords() {
    if (!importReady) return;
    const additions: ResearchRecord[] = importExample.map((record, index) => ({ ...record, id: nextRecordId(records[kind], index), title: kind === "paper" ? record.title : record.title.replace("方法研究", "方法") }));
    setRecords((previous) => ({ ...previous, [kind]: [...previous[kind], ...additions] }));
    resetView(); setAnnouncement(`已导入 ${additions.length} 条示例记录，仅用于当前本地演示。`); closeModal();
  }

  const columns: ColumnProps<ResearchRecord>[] = [
    { title: "ID", dataIndex: "id", width: 176 },
    { title: `${recordName}标题`, dataIndex: "title", width: 248, ellipsis: true, render: (value: string) => <span title={value}>{value}</span> },
    { title: "关键词", dataIndex: "keywords", width: 224, ellipsis: true, render: (value: string[]) => <span title={value.join("、")}>{value.join("、")}</span> },
    { title: "作者", dataIndex: "author", width: 94 },
    { title: "作者机构", dataIndex: "institution", width: 202, ellipsis: true },
    { title: "操作", width: 144, render: (_, record) => <Space size={12}>
      <Link disabled hoverable={false} aria-label={`查看 ${record.id} 详情`}>详情</Link>
      <Link disabled hoverable={false} aria-label={`编辑 ${record.id}`}>编辑</Link>
      <Link disabled hoverable={false} status="error" aria-label={`删除 ${record.id}`}>删除</Link>
    </Space> },
  ];
  const modalTitle = modal?.action === "detail" ? `${recordName}详情` : modal?.action === "edit" ? `编辑${recordName}` : modal?.action === "delete" ? `删除${recordName}` : modal?.action === "import" ? "批量导入" : `新增${recordName}`;

  return (
    <section ref={containerRef} className="gkx-paper-demo" aria-label="记录管理交互复现">
      <ConfigProvider locale={zhCN} autoInsertSpaceInButton={false} getPopupContainer={popupContainer}>
        <Card className="gkx-paper-demo__panel">
        <div className="gkx-paper-demo__controlbar">
          <span className="gkx-paper-demo__sample">本次复现 · 示例数据</span>
          <div role="group" aria-label="查询布局对照"><Radio.Group type="button" size="default" value={layout} onChange={switchLayout} options={[{ label: "原查询布局", value: "original" }, { label: "统一查询布局", value: "unified" }]} /></div>
          <div className="gkx-paper-demo__reuse" role="group" aria-label="复用演示：切换记录类型"><span>复用演示</span><Radio.Group type="button" size="default" value={kind} onChange={switchKind} options={[{ label: "论文记录", value: "paper" }, { label: "专利记录", value: "patent" }]} /></div>
        </div>
        <div className="gkx-paper-demo__workspace">
          <div className="gkx-paper-demo__workarea">
            <form className="gkx-paper-demo__form" onSubmit={submitQuery}>
              {layout === "original" && <div className="gkx-paper-demo__field"><label htmlFor={`${id}-record-id`}>ID：</label><Input autoComplete="off" id={`${id}-record-id`} aria-label="ID" style={{ width: "var(--gkx-query-width, 280px)" }} value={draft.recordId} onChange={(value) => setDraft({ ...draft, recordId: value })} placeholder={kind === "paper" ? "如 P001" : "如 Z001"} /></div>}
              <div className="gkx-paper-demo__field"><label htmlFor={`${id}-query`}>{layout === "unified" ? "搜索：" : "名称/标题："}</label><Input autoComplete="off" id={`${id}-query`} aria-label={layout === "unified" ? "搜索" : "名称/标题"} style={{ width: "var(--gkx-query-width, 280px)" }} value={draft.text} onChange={(value) => setDraft({ ...draft, text: value })} placeholder={layout === "unified" ? `请输入${recordName}标题/关键词` : "请输入"} /></div>
              {layout === "unified" && <div className="gkx-paper-demo__field"><label htmlFor={`${id}-institution`}>筛选条件：</label><Select id={`${id}-institution`} aria-label="作者机构" style={{ width: "var(--gkx-query-width, 220px)" }} value={draft.institution} onChange={(value) => setDraft({ ...draft, institution: value })} options={[{ label: "全部机构", value: "" }, ...institutions]} getPopupContainer={popupContainer} /></div>}
              <Space size={10}><Button type="primary" htmlType="submit">查询</Button><Button onClick={clearConditions}>重置</Button></Space>
            </form>
            <div className="gkx-paper-demo__toolbar"><Space size={16}><Button type="primary" icon={<IconPlus />} disabled>新增</Button><Button disabled>批量导入</Button></Space>{selected.length > 0 && <span>已选 {selected.length} 条</span>}</div>
            <div className="gkx-paper-demo__table-space">
              <p className="gkx-paper-demo__table-hint">左右滑动查看完整表格</p>
              <Table<ResearchRecord> aria-label={`${recordName}查询结果`} rowKey="id" columns={columns} data={visibleRows} pagination={false} size="middle" tableLayoutFixed border={{ wrapper: true, headerCell: false, bodyCell: false }} scroll={{ x: 1124 }} rowSelection={{ type: "checkbox", checkAll: true, columnWidth: 36, selectedRowKeys: selected, onChange: setSelected, checkboxProps: (record) => ({ disabled: true, "aria-label": `选择记录 ${record.id}` }) }} noDataElement={<Empty description={<div>没有找到匹配的{recordName}<div><Button type="text" onClick={clearConditions}>清空查询条件</Button></div></div>} />} />
            </div>
            <div className="gkx-paper-demo__pagination"><Pagination current={currentPage} pageSize={pageSize} total={rows.length} showTotal={(total) => `共计 ${total} 条`} sizeCanChange sizeOptions={[10, 5]} showJumper={false} onChange={(next) => { setPage(next); setSelected([]); }} onPageSizeChange={(size) => { setPageSize(size); setPage(1); setSelected([]); }} selectProps={paginationSelectProps} /></div>
          </div>
        </div>
        <p className="gkx-paper-demo__feedback" role="status" aria-live="polite" aria-atomic="true">{announcement || "搜索覆盖标题与关键词；机构作为独立筛选。本区域仅演示查询与筛选。"}</p>
        </Card>
        <Modal title={modalTitle} visible={Boolean(modal)} onCancel={closeModal} afterClose={restoreFocus} footer={null} getPopupContainer={popupContainer} getChildrenPopupContainer={(node) => node.closest(".arco-modal") ?? popupContainer()} autoFocus focusLock escToExit unmountOnExit style={{ width: 560, maxWidth: "calc(100vw - 40px)" }}>
          {modal?.action === "detail" ? <><Descriptions column={1} data={[{ label: "ID", value: modal.record.id }, { label: `${recordName}标题`, value: modal.record.title }, { label: "关键词", value: modal.record.keywords.join("、") }, { label: "作者", value: modal.record.author }, { label: "作者机构", value: modal.record.institution }]} /><div className="gkx-paper-demo__dialog-actions"><Button type="primary" onClick={closeModal}>关闭</Button></div></> : modal?.action === "delete" ? <><p>确定删除“{modal.record.title}”吗？本次操作仅影响示例数据，刷新页面可恢复。</p><div className="gkx-paper-demo__dialog-actions"><Button onClick={closeModal}>取消</Button><Button type="primary" status="danger" onClick={deleteRecord}>确认删除</Button></div></> : modal?.action === "import" ? <><p>使用本次复现的示例文件，验证批量导入。数据仅保留在当前演示中。</p><List size="small" bordered dataSource={[{ title: `${recordName}管理示例.xlsx` }]} render={(file) => <List.Item actions={[<Button key="sample" type="text" onClick={() => setImportReady(true)}>使用示例文件</Button>]}><List.Item.Meta avatar={<IconFile />} title={file.title} description="2 条示例记录" /></List.Item>} />{importReady && <div className="gkx-paper-demo__import-preview"><Alert type="success" content="已读取 2 条记录，可导入" /><List size="small" dataSource={importExample} render={(record) => <List.Item><List.Item.Meta title={record.title} description={`${record.author} · ${record.institution}`} /></List.Item>} /></div>}<div className="gkx-paper-demo__dialog-actions"><Button onClick={closeModal}>取消</Button><Button type="primary" disabled={!importReady} onClick={importRecords}>导入示例记录</Button></div></> : modal && <Form layout="vertical" onSubmit={saveRecord}>
            <Form.Item label={`${recordName}标题`} required><Input id={`${id}-edit-title`} aria-label={`${recordName}标题`} value={fields.title} onChange={(value) => setFields({ ...fields, title: value })} /></Form.Item>
            <Form.Item label="关键词" required><Input aria-label="关键词" value={fields.keywords} onChange={(value) => setFields({ ...fields, keywords: value })} placeholder="多个关键词以顿号或逗号分隔" /></Form.Item>
            <Form.Item label="作者" required><Input aria-label="作者" value={fields.author} onChange={(value) => setFields({ ...fields, author: value })} /></Form.Item>
            <Form.Item label="作者机构"><Select aria-label="作者机构" value={fields.institution} onChange={(value) => setFields({ ...fields, institution: value })} options={institutions} /></Form.Item>
            {modalError && <Alert type="error" content={modalError} />}
            <div className="gkx-paper-demo__dialog-actions"><Button onClick={closeModal}>取消</Button><Button type="primary" htmlType="submit">保存</Button></div>
          </Form>}
        </Modal>
      </ConfigProvider>
    </section>
  );
}

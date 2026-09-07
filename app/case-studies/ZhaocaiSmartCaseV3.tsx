"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Bot from "lucide-react/dist/esm/icons/bot.mjs";
import CheckCircle2 from "lucide-react/dist/esm/icons/circle-check.mjs";
import Copy from "lucide-react/dist/esm/icons/copy.mjs";
import Expand from "lucide-react/dist/esm/icons/expand.mjs";
import GripVertical from "lucide-react/dist/esm/icons/grip-vertical.mjs";
import History from "lucide-react/dist/esm/icons/history.mjs";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard.mjs";
import MessageSquarePlus from "lucide-react/dist/esm/icons/message-square-plus.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import Square from "lucide-react/dist/esm/icons/square.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import { publicAsset } from "../portfolio-data";
import { ZhaocaiSmartTrustSection } from "./ZhaocaiSmartTrustSection";
import "./zhaocai-smart-v3.css";

const demoFinance = {
  isExample: true,
  unit: "万元",
  source: "年度经营数据（示例）",
  metrics: {
    netProfit: {
      label: "净利润",
      data: {
        2024: {
          "组织 A": [500, 600, 750, 850],
          "组织 B": [400, 500, 600, 700],
          "组织 C": [300, 400, 450, 550],
        },
        2023: {
          "组织 A": [420, 500, 680, 730],
          "组织 B": [330, 420, 530, 580],
          "组织 C": [250, 330, 390, 440],
        },
      },
    },
    totalProfit: {
      label: "利润总额",
      data: {
        2024: {
          "组织 A": [600, 720, 900, 1080],
          "组织 B": [500, 600, 750, 850],
          "组织 C": [400, 480, 550, 570],
        },
        2023: {
          "组织 A": [500, 600, 760, 900],
          "组织 B": [420, 500, 650, 720],
          "组织 C": [330, 400, 490, 530],
        },
      },
    },
  },
} as const;

const organizations = ["组织 A", "组织 B", "组织 C"] as const;
const quarters = ["Q1", "Q2", "Q3", "Q4"] as const;
const locatorSections = [
  ["overview", "项目概览"],
  ["strategy", "业务场景"],
  ["core", "核心交互"],
  ["markdown", "输出规范"],
  ["gallery", "补充交付"],
] as const;
const markdownTabs = ["标题", "正文", "表格", "引用", "公式", "代码"] as const;
const processSteps = ["理解问题", "匹配指标", "查询数据", "生成结果"] as const;
const rawMaterials = [
  [
    "11",
    "项目背景",
    "/assets/projects/zhaocai-smart/11-project-background.png",
  ],
  [
    "12",
    "智能问数介绍",
    "/assets/projects/zhaocai-smart/12-smart-query-introduction.png",
  ],
  [
    "13",
    "语义澄清",
    "/assets/projects/zhaocai-smart/13-semantic-clarification.png",
  ],
  [
    "14",
    "过程可视化",
    "/assets/projects/zhaocai-smart/14-process-visualization.png",
  ],
  ["15", "看板交互", "/assets/projects/zhaocai-smart/15-board-interaction.png"],
  [
    "16",
    "Markdown 规范",
    "/assets/projects/zhaocai-smart/16-markdown-specification.png",
  ],
  ["17", "页面总览", "/assets/projects/zhaocai-smart/17-page-overview.png"],
] as const;

type MetricKey = keyof typeof demoFinance.metrics;
type Scope = "全集团" | (typeof organizations)[number];
type SupportedYear = 2023 | 2024;
type TaskStatus =
  | "idle"
  | "clarifying"
  | "running"
  | "completed"
  | "empty"
  | "failed"
  | "cancelled";
type MarkdownTab = (typeof markdownTabs)[number];
type BoardMode = "sort" | "merge";
type BoardCardId = "quarter" | "organization" | "summary";
type LightboxItem = { src: string; alt: string; title: string };

const numberFormat = new Intl.NumberFormat("zh-CN");
const boardCards: BoardCardId[] = ["quarter", "organization", "summary"];
const boardLabels: Record<BoardCardId, string> = {
  quarter: "季度趋势",
  organization: "组织对比",
  summary: "年度摘要",
};

function getSeries(metric: MetricKey, year: SupportedYear, scope: Scope) {
  const yearData = demoFinance.metrics[metric].data[year];
  if (scope !== "全集团") return [...yearData[scope]];
  return quarters.map((_, index) =>
    organizations.reduce((sum, org) => sum + yearData[org][index], 0),
  );
}

function getSnapshot(metric: MetricKey, year: SupportedYear, scope: Scope) {
  const current = getSeries(metric, year, scope);
  const previous = year === 2024 ? getSeries(metric, 2023, scope) : null;
  const total = current.reduce((sum, value) => sum + value, 0);
  const previousTotal =
    previous?.reduce((sum, value) => sum + value, 0) ?? null;
  const yoy = previousTotal ? (total / previousTotal - 1) * 100 : null;
  const organizationTotals = organizations.map((org) => ({
    name: org,
    value: getSeries(metric, year, org).reduce((sum, value) => sum + value, 0),
  }));
  return { current, previous, total, previousTotal, yoy, organizationTotals };
}

function SectionLabel({ number, name }: { number: string; name: string }) {
  return (
    <p className="zcv3-section-label">
      <span>{number}</span> / {name}
    </p>
  );
}

function Conditions({
  year,
  metric,
  scope,
  pending = false,
}: {
  year: SupportedYear;
  metric: MetricKey;
  scope: Scope;
  pending?: boolean;
}) {
  return (
    <dl className="zcv3-conditions">
      <div>
        <dt>时间</dt>
        <dd>{year} 年</dd>
      </div>
      <div>
        <dt>范围</dt>
        <dd>{scope}</dd>
      </div>
      <div>
        <dt>指标</dt>
        <dd>{pending ? "待确认" : demoFinance.metrics[metric].label}</dd>
      </div>
    </dl>
  );
}

function AppSidebar({
  historyOpen,
  onHistory,
  onNew,
  onBoard,
}: {
  historyOpen: boolean;
  onHistory: () => void;
  onNew: () => void;
  onBoard: () => void;
}) {
  return (
    <aside className="zcv3-app-sidebar">
      <strong>招财 Smart</strong>
      <button type="button" onClick={onNew}>
        <MessageSquarePlus size={17} />
        新建对话
      </button>
      <nav>
        <button type="button" className="active">
          <Bot size={17} />
          智能问数
        </button>
        <button type="button" onClick={onBoard}>
          <LayoutDashboard size={17} />
          经营看板
        </button>
        <button type="button" aria-pressed={historyOpen} onClick={onHistory}>
          <History size={17} />
          历史查询
        </button>
      </nav>
    </aside>
  );
}

function TrendChart({
  snapshot,
  metricLabel,
}: {
  snapshot: ReturnType<typeof getSnapshot>;
  metricLabel: string;
}) {
  const all = [...snapshot.current, ...(snapshot.previous ?? [])];
  const min = Math.min(...all) * 0.86;
  const max = Math.max(...all) * 1.08;
  const y = (value: number) => 174 - ((value - min) / (max - min || 1)) * 136;
  const x = (index: number) => 78 + index * 145;
  return (
    <svg
      className="zcv3-chart"
      viewBox="0 0 580 214"
      role="img"
      aria-label={`${metricLabel}季度趋势示例`}
    >
      {[0, 1, 2, 3].map((index) => {
        const value = min + ((max - min) / 3) * index;
        const lineY = y(value);
        return (
          <g key={index}>
            <line x1="58" x2="550" y1={lineY} y2={lineY} />
            <text x="50" y={lineY + 4} textAnchor="end">
              {Math.round(value)}
            </text>
          </g>
        );
      })}
      {snapshot.previous && (
        <polyline
          className="previous"
          points={snapshot.previous
            .map((value, index) => `${x(index)},${y(value)}`)
            .join(" ")}
        />
      )}
      <polyline
        className="current"
        points={snapshot.current
          .map((value, index) => `${x(index)},${y(value)}`)
          .join(" ")}
      />
      {snapshot.current.map((value, index) => (
        <g key={quarters[index]}>
          <circle cx={x(index)} cy={y(value)} r="4" />
          <text className="axis" x={x(index)} y="202" textAnchor="middle">
            {quarters[index]}
          </text>
        </g>
      ))}
    </svg>
  );
}

function OrganizationBars({
  snapshot,
  metricLabel,
}: {
  snapshot: ReturnType<typeof getSnapshot>;
  metricLabel: string;
}) {
  const max = Math.max(
    ...snapshot.organizationTotals.map((item) => item.value),
  );
  return (
    <svg
      className="zcv3-chart is-bars"
      viewBox="0 0 580 214"
      role="img"
      aria-label={`${metricLabel}组织对比示例`}
    >
      {[0, 1, 2, 3].map((index) => {
        const value = (max / 3) * index;
        const lineY = 174 - (value / max) * 136;
        return (
          <g key={index}>
            <line x1="58" x2="550" y1={lineY} y2={lineY} />
            <text x="50" y={lineY + 4} textAnchor="end">
              {Math.round(value)}
            </text>
          </g>
        );
      })}
      {snapshot.organizationTotals.map((item, index) => {
        const height = (item.value / max) * 130;
        const x = 100 + index * 160;
        return (
          <g key={item.name}>
            <rect x={x} y={174 - height} width="72" height={height} rx="7" />
            <text
              className="value"
              x={x + 36}
              y={166 - height}
              textAnchor="middle"
            >
              {numberFormat.format(item.value)}
            </text>
            <text className="axis" x={x + 36} y="202" textAnchor="middle">
              {item.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HeroProductPreview() {
  return (
    <div className="zcv3-hero-stage" aria-label="招财 Smart 产品体验示意">
      <div className="zcv3-app-shell is-preview">
        <aside className="zcv3-app-sidebar is-static">
          <strong>招财 Smart</strong>
          <span>
            <MessageSquarePlus size={17} />
            新建对话
          </span>
          <nav>
            <span className="active">
              <Bot size={17} />
              智能问数
            </span>
            <span>
              <LayoutDashboard size={17} />
              经营看板
            </span>
            <span>
              <History size={17} />
              历史查询
            </span>
          </nav>
        </aside>
        <main>
          <header>
            <span>交互演示 · 示例数据</span>
            <b>月度经营分析</b>
          </header>
          <div className="zcv3-preview-query">查看 2024 年集团利润变化</div>
          <section className="zcv3-preview-answer">
            <div>
              <Bot size={18} />
              <b>请确认利润口径</b>
            </div>
            <p>已识别 2024 年与全集团，仅需确认指标。</p>
            <div>
              <span className="selected">净利润</span>
              <span>利润总额</span>
            </div>
          </section>
        </main>
      </div>
      <aside>
        <span>澄清细节</span>
        <b>保留已知条件</b>
        <Conditions year={2024} metric="netProfit" scope="全集团" pending />
      </aside>
    </div>
  );
}

function FormatExample({
  tab,
  onCopy,
  copied,
}: {
  tab: MarkdownTab;
  onCopy: () => void;
  copied: boolean;
}) {
  if (tab === "表格")
    return (
      <table>
        <thead>
          <tr>
            <th>项目</th>
            <th>金额</th>
            <th>变化</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>示例 A</td>
            <td>1,200.00</td>
            <td>+12.5%</td>
          </tr>
          <tr>
            <td>示例 B</td>
            <td>-320.00</td>
            <td>-3.0%</td>
          </tr>
          <tr>
            <td>示例 C</td>
            <td>—</td>
            <td>暂无同期</td>
          </tr>
        </tbody>
      </table>
    );
  if (tab === "引用")
    return (
      <blockquote>
        结论与数据来源保持关联。<cite>来源说明示例</cite>
      </blockquote>
    );
  if (tab === "公式")
    return (
      <div className="zcv3-formula">
        <span>同比增长率</span>
        <b>(本期 ÷ 同期 − 1) × 100%</b>
      </div>
    );
  if (tab === "代码")
    return (
      <div className="zcv3-code">
        <button type="button" onClick={onCopy}>
          <Copy size={15} />
          {copied ? "已复制" : "复制代码"}
        </button>
        <pre>
          <code>{`SELECT quarter, SUM(profit)\nFROM annual_data\nGROUP BY quarter;`}</code>
        </pre>
      </div>
    );
  if (tab === "标题")
    return (
      <div>
        <h3>年度经营分析</h3>
        <h4>核心结论</h4>
        <p>标题层级帮助用户快速定位。</p>
      </div>
    );
  return (
    <div>
      <p>正文保持适当行宽，将结论、依据与补充说明分段呈现。</p>
      <p>长回答仍可通过标题快速浏览。</p>
    </div>
  );
}

export function ZhaocaiSmartCase() {
  const [activeSection, setActiveSection] = useState("overview");
  const [query, setQuery] = useState("查看 2024 年集团利润变化");
  const [year, setYear] = useState<SupportedYear>(2024);
  const [scope, setScope] = useState<Scope>("全集团");
  const [metric, setMetric] = useState<MetricKey>("netProfit");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("clarifying");
  const [processStep, setProcessStep] = useState(1);
  const [longWait, setLongWait] = useState(false);
  const [validation, setValidation] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(true);
  const [markdown, setMarkdown] = useState<MarkdownTab>("表格");
  const [sourceOpen, setSourceOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [boardMode, setBoardMode] = useState<BoardMode>("sort");
  const [boardOrder, setBoardOrder] = useState<BoardCardId[]>(boardCards);
  const [savedQueryIds, setSavedQueryIds] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [draggedCard, setDraggedCard] = useState<BoardCardId | null>(null);
  const [dragOverCard, setDragOverCard] = useState<BoardCardId | null>(null);
  const [mergeCandidate, setMergeCandidate] = useState<BoardCardId | null>(
    null,
  );
  const [mergedCards, setMergedCards] = useState<BoardCardId[]>([]);
  const [lastMerged, setLastMerged] = useState<BoardCardId | null>(null);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const taskTimers = useRef<number[]>([]);
  const boardHydrated = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const dialogTrigger = useRef<HTMLButtonElement | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lightboxTrigger = useRef<HTMLButtonElement | null>(null);
  const snapshot = useMemo(
    () => getSnapshot(metric, year, scope),
    [metric, year, scope],
  );
  const metricLabel = demoFinance.metrics[metric].label;
  const currentQueryId = `${year}-${scope}-${metric}`;

  const clearTask = () => {
    taskTimers.current.forEach((id) => window.clearTimeout(id));
    taskTimers.current = [];
  };
  const setDirectState = (status: TaskStatus, step = 1, waiting = false) => {
    clearTask();
    setTaskStatus(status);
    setProcessStep(step);
    setLongWait(waiting);
  };
  const runTask = (nextMetric = metric, nextYear = year, nextScope = scope) => {
    clearTask();
    setMetric(nextMetric);
    setYear(nextYear);
    setScope(nextScope);
    setTaskStatus("running");
    setLongWait(false);
    setProcessStep(0);
    setValidation("");
    [1, 2, 3].forEach((step, index) =>
      taskTimers.current.push(
        window.setTimeout(() => setProcessStep(step), 420 * (index + 1)),
      ),
    );
    taskTimers.current.push(
      window.setTimeout(() => setTaskStatus("completed"), 1850),
    );
  };

  useEffect(() => () => clearTask(), []);
  useEffect(() => {
    const nodes = [
      ...document.querySelectorAll<HTMLElement>("[data-zcv3-section]"),
    ];
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const marker = window.innerHeight * 0.22;
        const current = nodes.reduce(
          (active, node) =>
            node.getBoundingClientRect().top <= marker ? node : active,
          nodes[0],
        );
        if (current?.id) setActiveSection(current.id);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("zhaocai-board-demo-v2") || "null",
      );
      if (saved?.version === 2) {
        if (Array.isArray(saved.order)) setBoardOrder(saved.order);
        if (Array.isArray(saved.merged)) setMergedCards(saved.merged);
        if (Array.isArray(saved.queries)) setSavedQueryIds(saved.queries);
      }
    } catch {
      /* use defaults */
    }
    window.requestAnimationFrame(() => {
      boardHydrated.current = true;
    });
  }, []);
  useEffect(() => {
    if (!boardHydrated.current) return;
    try {
      localStorage.setItem(
        "zhaocai-board-demo-v2",
        JSON.stringify({
          version: 2,
          order: boardOrder,
          merged: mergedCards,
          queries: savedQueryIds,
        }),
      );
    } catch {
      /* storage unavailable */
    }
  }, [boardOrder, mergedCards, savedQueryIds]);
  useEffect(() => {
    if (!mergeCandidate) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMergeCandidate(null);
        window.requestAnimationFrame(() => dialogTrigger.current?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mergeCandidate]);
  useEffect(() => {
    if (!lightbox) return;
    lightboxRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
        window.requestAnimationFrame(() => lightboxTrigger.current?.focus());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const parseAndSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    const value = query.trim();
    const parsedYear = value.includes("2023")
      ? 2023
      : value.includes("2024")
        ? 2024
        : null;
    const parsedScope =
      organizations.find((org) => value.includes(org)) ??
      (value.includes("集团") ? "全集团" : null);
    const parsedMetric: MetricKey | null = value.includes("净利润")
      ? "netProfit"
      : value.includes("利润总额")
        ? "totalProfit"
        : null;
    if (!parsedYear || !parsedScope || !value.includes("利润")) {
      clearTask();
      setTaskStatus("idle");
      setValidation(
        "当前演示支持 2023／2024 年、全集团或组织 A／B／C，以及净利润或利润总额。可直接使用下方样例。",
      );
      return;
    }
    setYear(parsedYear);
    setScope(parsedScope);
    setValidation("");
    if (!parsedMetric) {
      clearTask();
      setTaskStatus("clarifying");
      return;
    }
    runTask(parsedMetric, parsedYear, parsedScope);
  };
  const chooseMetric = (nextMetric: MetricKey) => {
    setMetric(nextMetric);
    setQuery(
      `查看 ${year} 年${scope}${demoFinance.metrics[nextMetric].label}变化`,
    );
    runTask(nextMetric, year, scope);
  };
  const modifyConditions = () => {
    clearTask();
    setTaskStatus("idle");
    setLongWait(false);
    setValidation("");
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };
  const fillSample = (value: string) => {
    clearTask();
    setQuery(value);
    setTaskStatus("idle");
    setLongWait(false);
    setValidation("");
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };
  const resetConversation = () => {
    clearTask();
    setQuery("");
    setTaskStatus("idle");
    setValidation("");
    setHistoryOpen(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };
  const saveCurrent = () => {
    if (savedQueryIds.includes(currentQueryId))
      setSaveMessage("该查询已保存在当前浏览器中，没有重复创建卡片。");
    else {
      setSavedQueryIds((current) => [...current, currentQueryId]);
      setSaveMessage("已保存到当前浏览器的演示看板。");
    }
  };
  const resetBoard = () => {
    setBoardOrder(boardCards);
    setMergedCards([]);
    setSavedQueryIds([]);
    setSaveMessage("演示已重置。");
  };
  const moveCard = (id: BoardCardId, direction: -1 | 1) =>
    setBoardOrder((current) => {
      const from = current.indexOf(id);
      const to = from + direction;
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  const handleDrop = (target: BoardCardId) => {
    if (!draggedCard || draggedCard === target) {
      setDraggedCard(null);
      setDragOverCard(null);
      return;
    }
    if (boardMode === "merge") {
      setMergeCandidate(draggedCard);
      setDraggedCard(null);
      setDragOverCard(null);
      return;
    }
    setBoardOrder((current) => {
      const next = current.filter((id) => id !== draggedCard);
      next.splice(next.indexOf(target), 0, draggedCard);
      return next;
    });
    setDraggedCard(null);
    setDragOverCard(null);
  };
  const confirmMerge = () => {
    if (!mergeCandidate) return;
    if (!mergedCards.includes(mergeCandidate))
      setMergedCards((current) => [...current, mergeCandidate]);
    setLastMerged(mergeCandidate);
    setMergeCandidate(null);
    setSaveMessage("已加入合集，可撤销或移出。");
    window.requestAnimationFrame(() => dialogTrigger.current?.focus());
  };
  const closeMerge = () => {
    setMergeCandidate(null);
    window.requestAnimationFrame(() => dialogTrigger.current?.focus());
  };
  const undoMerge = () => {
    if (!lastMerged) return;
    setMergedCards((current) => current.filter((id) => id !== lastMerged));
    setLastMerged(null);
    setSaveMessage("已撤销加入合集。");
  };
  const openLightbox = (item: LightboxItem, trigger: HTMLButtonElement) => {
    lightboxTrigger.current = trigger;
    setLightbox(item);
  };
  const closeLightbox = () => {
    setLightbox(null);
    window.requestAnimationFrame(() => lightboxTrigger.current?.focus());
  };
  const formatAmount = (value: number) =>
    `${numberFormat.format(value)} ${demoFinance.unit}`;
  const yoyText = snapshot.yoy === null ? "—" : `+${snapshot.yoy.toFixed(1)}%`;

  return (
    <section className="zcv3-page" aria-label="招财 Smart 项目案例">
      <nav className="zhaocai-locator" aria-label="案例章节定位">
        <span aria-hidden="true" />
        {locatorSections.map(([id, label], index) => (
          <a
            href={`#${id}`}
            className={activeSection === id ? "active" : ""}
            aria-current={activeSection === id ? "location" : undefined}
            onClick={() => setActiveSection(id)}
            key={id}
          >
            <b>{String(index + 1).padStart(2, "0")}</b>
            <em>{label}</em>
          </a>
        ))}
      </nav>
      <main className="zcv3-main">
        <section
          id="overview"
          data-zcv3-section
          className="zcv3-section zcv3-hero"
        >
          <div className="zcv3-hero-head">
            <div>
              <SectionLabel number="01" name="项目概览" />
              <h1>
                招财 <em>Smart</em>
              </h1>
              <p>企业财务问数 · 交互设计</p>
            </div>
            <dl>
              <div>
                <dt>项目时间</dt>
                <dd>2025.07—2025.11</dd>
              </div>
              <div>
                <dt>我的角色</dt>
                <dd>UX / UI 设计师</dd>
              </div>
              <div>
                <dt>简介</dt>
                <dd>面向企业财务经营分析的 AI 问数平台。</dd>
              </div>
              <div>
                <dt>工作范围</dt>
                <dd>问数交互、看板编辑、模型输出规范。</dd>
              </div>
            </dl>
          </div>
          <HeroProductPreview />
        </section>

        <ZhaocaiSmartTrustSection />

        <section id="core" data-zcv3-section className="zcv3-section zcv3-core">
          <SectionLabel number="03A" name="语义澄清" />
          <article id="clarification" className="zcv3-block">
            <header>
              <h2>语义澄清</h2>
              <p>确认有歧义的指标，保留已识别的条件。</p>
            </header>
            <div className="zcv3-demo-label">
              <span>交互演示 · 示例数据</span>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    fillSample("查看 2024 年集团利润变化");
                    setYear(2024);
                    setScope("全集团");
                    setTaskStatus("clarifying");
                  }}
                >
                  模糊问题
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("查看 2024 年集团净利润变化");
                    runTask("netProfit", 2024, "全集团");
                  }}
                >
                  完整问题
                </button>
              </div>
            </div>
            <div className="zcv3-query-demo">
              <div className="zcv3-app-shell">
                <AppSidebar
                  historyOpen={historyOpen}
                  onHistory={() => setHistoryOpen((open) => !open)}
                  onNew={resetConversation}
                  onBoard={() =>
                    document
                      .getElementById("board")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                />
                <main>
                  <header>
                    <b>智能问数</b>
                    <span>有限范围前端演示</span>
                  </header>
                  {historyOpen && (
                    <div className="zcv3-history">
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("查看 2024 年集团净利润变化");
                          runTask("netProfit", 2024, "全集团");
                          setHistoryOpen(false);
                        }}
                      >
                        2024 年集团净利润变化
                      </button>
                    </div>
                  )}
                  <div className="zcv3-thread">
                    <div className="zcv3-user-bubble">
                      {query || "输入一个支持的演示问题"}
                    </div>
                    {taskStatus === "clarifying" && (
                      <section className="zcv3-clarify-card">
                        <header>
                          <Bot size={18} />
                          <b>请确认利润口径</b>
                        </header>
                        <p>
                          已识别 {year} 年与{scope}，仅需确认指标。
                        </p>
                        <Conditions
                          year={year}
                          metric={metric}
                          scope={scope}
                          pending
                        />
                        <div role="radiogroup" aria-label="利润口径">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={metric === "netProfit"}
                            onClick={() => setMetric("netProfit")}
                          >
                            <i />
                            净利润
                          </button>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={metric === "totalProfit"}
                            onClick={() => setMetric("totalProfit")}
                          >
                            <i />
                            利润总额
                          </button>
                        </div>
                        <footer>
                          <button
                            type="button"
                            onClick={() => chooseMetric(metric)}
                          >
                            确认并查询
                          </button>
                          <button type="button" onClick={modifyConditions}>
                            重新输入
                          </button>
                        </footer>
                      </section>
                    )}
                    {taskStatus === "completed" && (
                      <section className="zcv3-complete-card">
                        <CheckCircle2 size={20} />
                        <div>
                          <b>查询已完成</b>
                          <span>
                            {year} 年 / {metricLabel} / {scope}
                          </span>
                        </div>
                        <button type="button" onClick={modifyConditions}>
                          修改条件
                        </button>
                      </section>
                    )}
                  </div>
                  <form className="zcv3-query-form" onSubmit={parseAndSubmit}>
                    <input
                      ref={inputRef}
                      value={query}
                      disabled={taskStatus === "running"}
                      onChange={(event) => {
                        clearTask();
                        setQuery(event.target.value);
                        setTaskStatus("idle");
                        setLongWait(false);
                      }}
                      placeholder="输入支持的财务查询"
                      aria-label="财务查询"
                    />
                    <button
                      type="submit"
                      disabled={!query.trim() || taskStatus === "running"}
                    >
                      {taskStatus === "running" ? "提交中" : "发送"}
                    </button>
                  </form>
                  {validation && (
                    <p className="zcv3-validation">{validation}</p>
                  )}
                  <div className="zcv3-samples">
                    <button
                      type="button"
                      onClick={() => fillSample("查看 2024 年集团利润变化")}
                    >
                      填入模糊问题
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        fillSample("查看 2024 年集团净利润变化")
                      }
                    >
                      填入完整问题
                    </button>
                  </div>
                </main>
              </div>
              <aside className="zcv3-clarify-zoom">
                <span>澄清局部</span>
                <h3>请确认利润口径</h3>
                <div role="radiogroup" aria-label="局部利润口径">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={metric === "netProfit"}
                    onClick={() => setMetric("netProfit")}
                  >
                    <i />
                    净利润
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={metric === "totalProfit"}
                    onClick={() => setMetric("totalProfit")}
                  >
                    <i />
                    利润总额
                  </button>
                </div>
                <dl>
                  <div>
                    <dt>条件完整</dt>
                    <dd>直接查询</dd>
                  </div>
                  <div>
                    <dt>口径不明</dt>
                    <dd>提供候选项</dd>
                  </div>
                </dl>
                <details>
                  <summary>方案取舍</summary>
                  <table>
                    <thead>
                      <tr>
                        <th>方案推演</th>
                        <th>适用条件</th>
                        <th>本次判断</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>开放追问</td>
                        <td>无法形成有效候选</td>
                        <td>保留重新输入入口</td>
                      </tr>
                      <tr>
                        <td>候选口径</td>
                        <td>指标字典提供少量选项</td>
                        <td>本示例采用</td>
                      </tr>
                    </tbody>
                  </table>
                </details>
              </aside>
            </div>
          </article>

          <article id="process" className="zcv3-block zcv3-process-block">
            <SectionLabel number="03B" name="执行反馈" />
            <header>
              <h2>执行反馈</h2>
              <p>进度可展开，异常保留查询条件。</p>
            </header>
            <div className="zcv3-demo-label">
              <span>演示状态</span>
              <div>
                {(
                  [
                    "running",
                    "waiting",
                    "completed",
                    "empty",
                    "failed",
                    "cancelled",
                  ] as const
                ).map((state) => (
                  <button
                    type="button"
                    aria-pressed={
                      state === "waiting"
                        ? taskStatus === "running" && longWait
                        : taskStatus === state
                    }
                    onClick={() =>
                      state === "waiting"
                        ? setDirectState("running", 2, true)
                        : setDirectState(state, state === "completed" ? 3 : 1)
                    }
                    key={state}
                  >
                    {
                      {
                        running: "查询中",
                        waiting: "等待较久",
                        completed: "完成",
                        empty: "空结果",
                        failed: "失败",
                        cancelled: "已停止",
                      }[state]
                    }
                  </button>
                ))}
              </div>
            </div>
            <div className="zcv3-process-demo">
              <section className="zcv3-process-main">
                <header>
                  <div>
                    <span>当前任务</span>
                    <b>
                      查看 {year} 年{scope}
                      {metricLabel}变化
                    </b>
                  </div>
                  <Conditions year={year} metric={metric} scope={scope} />
                </header>
                {taskStatus === "running" && (
                  <div className="zcv3-running">
                    <div
                      className={`zcv3-wait-notice${longWait ? " visible" : ""}`}
                    >
                      <span>等待较久</span>
                      <p>查询仍在进行，可以继续等待或停止。</p>
                      <div>
                        <button
                          type="button"
                          onClick={() => setDirectState("completed", 3)}
                        >
                          继续等待
                        </button>
                        <button
                          type="button"
                          onClick={() => setDirectState("cancelled")}
                        >
                          停止查询
                        </button>
                      </div>
                    </div>
                    <ol className={stepsExpanded ? "expanded" : ""}>
                      {processSteps.map((step, index) => (
                        <li
                          className={
                            index < processStep
                              ? "done"
                              : index === processStep
                                ? "active"
                                : ""
                          }
                          key={step}
                        >
                          <span>
                            {index < processStep ? (
                              <CheckCircle2 size={15} />
                            ) : (
                              index + 1
                            )}
                          </span>
                          <b>{step}</b>
                          {stepsExpanded && (
                            <small>
                              {index === processStep
                                ? "当前步骤"
                                : index < processStep
                                  ? "已完成"
                                  : "等待"}
                            </small>
                          )}
                        </li>
                      ))}
                    </ol>
                    <div className="zcv3-skeleton">
                      <i />
                      <i />
                      <i />
                    </div>
                    <footer>
                      <button
                        type="button"
                        onClick={() => setStepsExpanded((value) => !value)}
                      >
                        {stepsExpanded ? "收起步骤" : "展开步骤"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirectState("cancelled")}
                      >
                        <Square size={15} />
                        停止查询
                      </button>
                    </footer>
                  </div>
                )}
                {taskStatus === "completed" && (
                  <div className="zcv3-result-state">
                    <CheckCircle2 size={24} />
                    <h3>分析完成</h3>
                    <strong>
                      {formatAmount(snapshot.total)} · 同比 {yoyText}
                    </strong>
                    <TrendChart snapshot={snapshot} metricLabel={metricLabel} />
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById("markdown")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                      >
                        查看结果
                      </button>
                      <button type="button" onClick={saveCurrent}>
                        保存到看板
                      </button>
                    </div>
                  </div>
                )}
                {taskStatus === "empty" && (
                  <StatusPanel
                    title="当前范围暂无数据"
                    text="查询条件已保留，可以调整范围或重试。"
                    onPrimary={modifyConditions}
                    primary="调整范围"
                    onSecondary={() => runTask()}
                    secondary="重试"
                  />
                )}
                {taskStatus === "failed" && (
                  <StatusPanel
                    title="本次查询未完成"
                    text="查询条件已保留，可以重试或修改条件。"
                    onPrimary={() => runTask()}
                    primary="重试"
                    onSecondary={modifyConditions}
                    secondary="修改条件"
                  />
                )}
                {taskStatus === "cancelled" && (
                  <StatusPanel
                    title="查询已停止"
                    text="查询条件已保留，旧任务不会覆盖当前状态。"
                    onPrimary={() => runTask()}
                    primary="重新查询"
                    onSecondary={modifyConditions}
                    secondary="修改条件"
                  />
                )}
                {taskStatus === "idle" || taskStatus === "clarifying" ? (
                  <StatusPanel
                    title="等待确认查询条件"
                    text="完成指标口径确认后开始查询。"
                    onPrimary={() =>
                      document
                        .getElementById("clarification")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    primary="返回确认"
                  />
                ) : null}
              </section>
              <aside>
                <span>状态样例</span>
                <button
                  type="button"
                  onClick={() => setDirectState("running", 2, true)}
                >
                  <b>等待较久</b>
                  <small>继续等待或停止查询</small>
                </button>
                <button type="button" onClick={() => setDirectState("empty")}>
                  <b>空结果</b>
                  <small>保留条件并支持恢复</small>
                </button>
              </aside>
            </div>
          </article>

          <article id="board" className="zcv3-block zcv3-board-block">
            <SectionLabel number="03C" name="看板编辑" />
            <header>
              <h2>看板编辑</h2>
              <p>拖拽排序与合集管理。</p>
            </header>
            <div className="zcv3-demo-label">
              <span>交互演示 · 当前浏览器保存</span>
              <div>
                <button
                  type="button"
                  aria-pressed={boardMode === "sort"}
                  onClick={() => setBoardMode("sort")}
                >
                  排序
                </button>
                <button
                  type="button"
                  aria-pressed={boardMode === "merge"}
                  onClick={() => setBoardMode("merge")}
                >
                  合集
                </button>
                <button type="button" onClick={resetBoard}>
                  <RotateCcw size={15} />
                  重置演示
                </button>
              </div>
            </div>
            <section className={`zcv3-board is-${boardMode}`}>
              <header>
                <div>
                  <b>
                    {year} 年{scope}
                    {metricLabel}看板
                  </b>
                  <span>{demoFinance.source}</span>
                </div>
                <button type="button" onClick={saveCurrent}>
                  保存当前查询
                </button>
              </header>
              {saveMessage && (
                <p className="zcv3-board-message">
                  {saveMessage}
                  {lastMerged && (
                    <button type="button" onClick={undoMerge}>
                      撤销
                    </button>
                  )}
                </p>
              )}
              <div className="zcv3-board-grid">
                {boardOrder.map((cardId, index) => (
                  <article
                    className={`zcv3-board-card${dragOverCard === cardId ? (boardMode === "sort" ? " is-insert" : " is-merge-target") : ""}${mergedCards.includes(cardId) ? " is-merged" : ""}`}
                    draggable
                    onDragStart={() => setDraggedCard(cardId)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverCard(cardId);
                    }}
                    onDragLeave={() => setDragOverCard(null)}
                    onDrop={() => handleDrop(cardId)}
                    key={cardId}
                  >
                    <header>
                      <GripVertical size={17} />
                      <div>
                        <span>{boardLabels[cardId]}</span>
                        <b>
                          {year} 年{scope}
                          {metricLabel}
                        </b>
                      </div>
                      <div>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveCard(cardId, -1)}
                        >
                          上移
                        </button>
                        <button
                          type="button"
                          disabled={index === boardOrder.length - 1}
                          onClick={() => moveCard(cardId, 1)}
                        >
                          下移
                        </button>
                      </div>
                    </header>
                    {cardId === "quarter" && (
                      <TrendChart
                        snapshot={snapshot}
                        metricLabel={metricLabel}
                      />
                    )}
                    {cardId === "organization" && (
                      <OrganizationBars
                        snapshot={snapshot}
                        metricLabel={metricLabel}
                      />
                    )}
                    {cardId === "summary" && (
                      <div className="zcv3-summary">
                        <strong>{numberFormat.format(snapshot.total)}</strong>
                        <span>{demoFinance.unit}</span>
                        <b>同比 {yoyText}</b>
                      </div>
                    )}
                    <footer>
                      <span>
                        {year} 年 / {metricLabel} / {scope}
                      </span>
                      {boardMode === "merge" &&
                        !mergedCards.includes(cardId) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              dialogTrigger.current = event.currentTarget;
                              setMergeCandidate(cardId);
                            }}
                          >
                            加入合集
                          </button>
                        )}
                      {mergedCards.includes(cardId) && (
                        <button
                          type="button"
                          onClick={() =>
                            setMergedCards((current) =>
                              current.filter((id) => id !== cardId),
                            )
                          }
                        >
                          移出合集
                        </button>
                      )}
                    </footer>
                  </article>
                ))}
              </div>
              <div className="zcv3-board-details">
                <div>
                  <i />
                  排序时显示卡片间插入线
                </div>
                <div>
                  <i />
                  合并时高亮目标区域并确认
                </div>
              </div>
            </section>
          </article>
        </section>

        <section
          id="markdown"
          data-zcv3-section
          className="zcv3-section zcv3-output"
        >
          <SectionLabel number="04" name="输出规范" />
          <header className="zcv3-simple-heading">
            <h2>回答排版</h2>
            <p>用一份完整回答呈现结论、表格、引用和操作层级。</p>
          </header>
          <div className="zcv3-answer-layout">
            <article className="zcv3-answer">
              <header className={markdown === "标题" ? "highlight" : ""}>
                <span>完整回答 · 示例数据</span>
                <h3>
                  {year} 年{scope}
                  {metricLabel}分析
                </h3>
                <Conditions year={year} metric={metric} scope={scope} />
              </header>
              <section className={markdown === "正文" ? "highlight" : ""}>
                <p>
                  全年{metricLabel}合计{" "}
                  <strong>{numberFormat.format(snapshot.total)} 万元</strong>
                  {snapshot.yoy === null ? (
                    "，暂无同期数据。"
                  ) : (
                    <>
                      ，同比增长 <strong>{snapshot.yoy.toFixed(1)}%</strong>。
                    </>
                  )}
                </p>
              </section>
              <section className={markdown === "表格" ? "highlight" : ""}>
                <div className="zcv3-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>季度</th>
                        <th>{year} 年</th>
                        <th>{year === 2024 ? "2023 年" : "同期"}</th>
                        <th>同比</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quarters.map((quarter, index) => (
                        <tr key={quarter}>
                          <td>{quarter}</td>
                          <td>
                            {numberFormat.format(snapshot.current[index])}
                          </td>
                          <td>
                            {snapshot.previous
                              ? numberFormat.format(snapshot.previous[index])
                              : "—"}
                          </td>
                          <td>
                            {snapshot.previous
                              ? `+${((snapshot.current[index] / snapshot.previous[index] - 1) * 100).toFixed(1)}%`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th>合计</th>
                        <td>{numberFormat.format(snapshot.total)}</td>
                        <td>
                          {snapshot.previousTotal
                            ? numberFormat.format(snapshot.previousTotal)
                            : "—"}
                        </td>
                        <td>{yoyText}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <small>单位：万元</small>
              </section>
              <blockquote className={markdown === "引用" ? "highlight" : ""}>
                数据来源：{demoFinance.source}
              </blockquote>
              <footer>
                <button
                  type="button"
                  aria-expanded={sourceOpen}
                  onClick={() => setSourceOpen((open) => !open)}
                >
                  <span>来源与口径</span>
                  <b>{sourceOpen ? "收起" : "展开"}</b>
                </button>
                {sourceOpen && (
                  <dl>
                    <div>
                      <dt>指标</dt>
                      <dd>{metricLabel}</dd>
                    </div>
                    <div>
                      <dt>周期</dt>
                      <dd>
                        {year}.01.01—{year}.12.31
                      </dd>
                    </div>
                    <div>
                      <dt>范围</dt>
                      <dd>{scope}</dd>
                    </div>
                    <div>
                      <dt>性质</dt>
                      <dd>作品集示例数据</dd>
                    </div>
                  </dl>
                )}
              </footer>
            </article>
            <aside>
              <nav aria-label="输出类型">
                {markdownTabs.map((tab) => (
                  <button
                    type="button"
                    aria-pressed={markdown === tab}
                    onClick={() => {
                      setMarkdown(tab);
                      setCopied(false);
                    }}
                    key={tab}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
              <div className={`zcv3-format-sample is-${markdown}`}>
                <span>格式示例 · {markdown}</span>
                <FormatExample
                  tab={markdown}
                  copied={copied}
                  onCopy={() => {
                    navigator.clipboard.writeText(
                      "SELECT quarter, SUM(profit) FROM annual_data GROUP BY quarter;",
                    );
                    setCopied(true);
                  }}
                />
              </div>
            </aside>
          </div>
        </section>

        <section
          id="gallery"
          data-zcv3-section
          className="zcv3-section zcv3-materials"
        >
          <SectionLabel number="05" name="补充交付" />
          <button
            className="zcv3-materials-trigger"
            type="button"
            aria-expanded={materialsOpen}
            onClick={() => setMaterialsOpen((open) => !open)}
          >
            <span>
              <b>原始界面与交互稿</b>
              <small>11—17 号项目素材</small>
            </span>
            <strong>{materialsOpen ? "收起" : "展开查看"}</strong>
          </button>
          {materialsOpen && (
            <div className="zcv3-material-grid">
              {rawMaterials.map(([number, title, src]) => {
                const item = {
                  src,
                  title: `${number} · ${title}`,
                  alt: `招财 Smart ${title}原始项目图`,
                };
                return (
                  <figure key={number}>
                    <button
                      type="button"
                      onClick={(event) =>
                        openLightbox(item, event.currentTarget)
                      }
                    >
                      <img
                        src={publicAsset(src)}
                        alt={item.alt}
                        loading="lazy"
                        decoding="async"
                      />
                      <span>
                        <Expand size={16} />
                        放大
                      </span>
                    </button>
                    <figcaption>
                      <span>{number}</span>
                      <b>{title}</b>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {mergeCandidate && (
        <div className="zcv3-modal-backdrop" role="presentation">
          <div
            ref={dialogRef}
            className="zcv3-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="zcv3-merge-title"
            tabIndex={-1}
          >
            <button
              type="button"
              onClick={closeMerge}
              aria-label="关闭合并确认"
            >
              <X size={19} />
            </button>
            <span>合集管理</span>
            <h3 id="zcv3-merge-title">加入经营指标合集？</h3>
            <p>
              将“{boardLabels[mergeCandidate]}
              ”加入合集，同时保留原卡片的查询条件。
            </p>
            <div>
              <button
                type="button"
                onClick={closeMerge}
              >
                取消
              </button>
              <button type="button" onClick={confirmMerge}>
                确认加入
              </button>
            </div>
          </div>
        </div>
      )}
    {lightbox && (
      <div
        ref={lightboxRef}
        className="zcv3-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={lightbox.title}
        tabIndex={-1}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="关闭图片预览"
          >
            <X size={21} />
          </button>
          <figure>
            <img src={publicAsset(lightbox.src)} alt={lightbox.alt} />
            <figcaption>{lightbox.title}</figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

function StatusPanel({
  title,
  text,
  primary,
  secondary,
  onPrimary,
  onSecondary,
}: {
  title: string;
  text: string;
  primary: string;
  secondary?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}) {
  return (
    <div className="zcv3-status-panel">
      <span>补充状态 · 交互示意</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <div>
        <button type="button" onClick={onPrimary}>
          {primary}
        </button>
        {secondary && onSecondary && (
          <button type="button" onClick={onSecondary}>
            {secondary}
          </button>
        )}
      </div>
    </div>
  );
}

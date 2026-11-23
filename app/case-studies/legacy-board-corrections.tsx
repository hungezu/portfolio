import type { ImgHTMLAttributes } from "react";
import { PortfolioImage } from "../portfolio-image";
import { contrastBoardEdits } from "./legacy-contrast-spec";
import { reconciliationEdits } from "./legacy-board-demo-reconciliation";
import taxText from "./legacy-tax-text-fixes.json";
import taxAndVisualisationData from "./legacy-tax-viz-data-fixes.json";
import energyData from "./legacy-energy-data-fixes.json";

type DonutItem = { label: string; value: number; color: string };
type Donut = { items: DonutItem[]; legend?: boolean; center?: string[] };
type LineDemo = { rates: number[]; previousDecember: number; highlightMonth: number };
type Patch = {
  box: number[];
  background?: string;
  radius?: number;
  text?: string[];
  size?: number;
  color?: string;
  weight?: number;
  align?: string;
  inset?: number;
  lineHeight?: number;
  donut?: Donut;
  lineChart?: LineDemo;
};
type Corrections = { w: number; h: number; patches: Patch[] };
type CorrectionMap = Partial<Record<string, Corrections>>;
const sources: CorrectionMap[] = [taxText, taxAndVisualisationData, energyData, contrastBoardEdits, reconciliationEdits];

function correctionsFor(board: string) {
  const entries = sources.map(source => source[board]).filter((item): item is Corrections => Boolean(item));
  if (!entries.length) return undefined;
  return { w: entries[0].w, h: entries[0].h, patches: entries.flatMap(item => item.patches) };
}

function CorrectedDonut({ box, chart }: { box: number[]; chart: Donut }) {
  const [left, top, width, height] = box;
  const { items, center = ["示例数据"], legend = true } = chart;
  const radius = legend ? Math.min(width * 0.17, height * 0.28) : Math.min(width, height) * 0.36;
  const cx = left + width * (legend ? 0.25 : 0.50);
  const cy = top + height * (legend ? 0.50 : 0.47);
  const legendLeft = left + width * 0.50;
  const fontSize = Math.min(height * 0.08, width * 0.065, 27);
  const lineHeight = Math.min(height * 0.14, fontSize * 1.5);
  const start = cy - ((items.length - 1) * lineHeight) / 2;

  return <g data-chart="sample-distribution">
    {items.map((item, index) => {
      const offset = items.slice(0, index).reduce((sum, segment) => sum + segment.value, 0);
      return <circle key={item.label} cx={cx} cy={cy} r={radius} pathLength={100}
        strokeDasharray={`${item.value} ${100 - item.value}`} strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`} fill="none" stroke={item.color} strokeWidth={radius * (legend ? 0.42 : 0.17)} />;
    })}
    {center.map((line, index) => <text key={line} x={cx} y={cy + (index - (center.length - 1) / 2) * fontSize * 1.4}
      fill="#29313A" textAnchor="middle" dominantBaseline="central"
      fontSize={fontSize * (index > 0 ? 1.2 : 0.85)}>{line}</text>)}
    {legend && items.map((item, index) => {
      const y = start + lineHeight * index;
      const dot = fontSize * 0.36;
      return <g key={item.label}>
        <circle cx={legendLeft} cy={y} r={dot} fill={item.color} />
        <text x={legendLeft + dot * 2.5} y={y} fill="#29313A" fontSize={fontSize}
          dominantBaseline="central">{item.label} {item.value}%</text>
      </g>;
    })}
  </g>;
}

function CorrectedLines({ box, chart }: { box: number[]; chart: LineDemo }) {
  const [left, top, width, height] = box;
  const label = Math.min(width * 0.033, height * 0.065, 25);
  const x = (month: number) => left + width * (0.13 + (month * 0.82) / 11);
  const absoluteY = (value: number) => top + height * (0.46 - value * 0.014);
  const changeY = (value: number) => top + height * (0.78 - value * 0.065);
  const changes = chart.rates.map((rate, index) => rate - (chart.rates[index - 1] ?? chart.previousDecember));
  const selected = chart.highlightMonth - 1;
  const selectedChange = changes[selected];
  const graph = (numbers: number[], y: (value: number) => number) =>
    numbers.map((number, index) => `${x(index)},${y(number)}`).join(" ");
  const color = "#253447";

  return <g data-chart="sample-tax-rates">
    <text x={left + width * 0.045} y={top + height * 0.105} fontSize={label}
      fontWeight={600} fill={color}>税负率（%）</text>
    <text x={left + width * 0.96} y={top + height * 0.105} textAnchor="end"
      fontSize={label} fill={color}>示例 · {chart.highlightMonth}月 {chart.rates[selected]}% / {selectedChange > 0 ? "+" : ""}{selectedChange} 个百分点</text>
    {[0, 10, 20].map(tick => <g key={tick}>
      <line x1={x(0)} x2={x(11)} y1={absoluteY(tick)} y2={absoluteY(tick)} stroke="#CBD2DC" />
      <text x={x(0) - label * 0.6} y={absoluteY(tick)} textAnchor="end" fontSize={label * 0.8}
        dominantBaseline="central" fill={color}>{tick}%</text>
    </g>)}
    <polyline points={graph(chart.rates, absoluteY)} fill="none" stroke="#2B59C5" strokeWidth={label * 0.19} />
    <circle cx={x(selected)} cy={absoluteY(chart.rates[selected])} r={label * 0.26} fill="#2B59C5" />
    <text x={left + width * 0.045} y={top + height * 0.59} fontSize={label}
      fontWeight={600} fill={color}>环比变动（百分点）</text>
    <line x1={x(0)} x2={x(11)} y1={changeY(0)} y2={changeY(0)} stroke="#969FAA" />
    <text x={x(0) - label * 0.6} y={changeY(0)} textAnchor="end" fontSize={label * 0.8}
      dominantBaseline="central" fill={color}>0</text>
    <polyline points={graph(changes, changeY)} fill="none" stroke="#975200" strokeWidth={label * 0.19} />
    <circle cx={x(selected)} cy={changeY(selectedChange)} r={label * 0.26} fill="#975200" />
    {chart.rates.map((_, month) => <text key={month} x={x(month)} y={top + height * 0.96}
      fontSize={label * 0.8} textAnchor="middle" fill={color}>{month + 1}月</text>)}
  </g>;
}

function CorrectionOverlay({ amendments, region }: { amendments: Corrections; region?: number[] }) {
  const [left, top, width, height] = region ?? [0, 0, amendments.w, amendments.h];
  const patches = amendments.patches.filter(({ box: [x, y, w, h] }) =>
    x < left + width && x + w > left && y < top + height && y + h > top,
  );
  if (!patches.length) return null;
  return <svg className="legacy-board-corrections" viewBox={`${left} ${top} ${width} ${height}`}
    aria-hidden="true" preserveAspectRatio="none">
    {patches.map((patch, index) => {
      const [x, y, w, h] = patch.box;
      const size = patch.size ?? 18;
      const lineHeight = patch.lineHeight ?? size * 1.25;
      const inset = patch.inset ?? 0;
      const align = patch.align ?? "left";
      const textX = align === "center" ? x + w / 2 : align === "right" ? x + w - inset : x + inset;
      const anchor = align === "center" ? "middle" : align === "right" ? "end" : "start";
      const lines = patch.text ?? [];
      const textY = y + h / 2 - (lines.length - 1) * lineHeight / 2;
      return <g key={index} data-board-patch={index} data-patch-box={patch.box.join(" ")}>
        {patch.background && <rect x={x} y={y} width={w} height={h} rx={patch.radius ?? 0} fill={patch.background} />}
        {patch.donut && <CorrectedDonut box={patch.box} chart={patch.donut} />}
        {patch.lineChart && <CorrectedLines box={patch.box} chart={patch.lineChart} />}
        {lines.map((line, row) => <text key={row} x={textX} y={textY + row * lineHeight}
          fill={patch.color ?? "#26272A"} fontSize={size} fontWeight={patch.weight ?? 400}
          dominantBaseline="central" textAnchor={anchor}>{line}</text>)}
      </g>;
    })}
  </svg>;
}

type DesignBoardImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  boardKey: string;
  original?: boolean;
  region?: number[];
};

export function DesignBoardImage({ boardKey, region, style, ...props }: DesignBoardImageProps) {
  const amendments = correctionsFor(boardKey);
  return <div className="legacy-board-visual" style={style}>
    <PortfolioImage {...props}
      width={props.width ?? (props.original ? amendments?.w : undefined)}
      height={props.height ?? (props.original ? amendments?.h : undefined)} />
    {amendments && <CorrectionOverlay amendments={amendments} region={region} />}
  </div>;
}

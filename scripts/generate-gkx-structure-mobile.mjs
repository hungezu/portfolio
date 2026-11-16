/**
 * Recompose the approved GKX 01/02 explainers for a 360px viewport.
 * No screenshot, external SVG reference, browser or output/ runtime dependency.
 * Run: node scripts/generate-gkx-structure-mobile.mjs
 * Optional temporary PNG previews: add --preview (uses the existing sharp package).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const C = { bg: '#030405', panel: '#202b33', line: '#50616e', muted: '#a4b3c0', ink: '#f2f6fb', blue: '#4b9ae9', teal: '#4ac5a3', orange: '#f4ab63', purple: '#8493c4', faint: '#44516e' };
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const rect = (x, y, w, h, fill = C.panel, stroke = C.line, rx = 7, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1" ${extra}/>`;
const text = (x, y, value, size = 18, fill = C.ink, weight = 400, anchor = 'start') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`;
const lines = (x, y, values, size = 14, fill = C.muted, leading = 22) => values.map((value, i) => text(x, y + i * leading, value, size, fill)).join('');
const line = (x1, y1, x2, y2, color = C.line, dashed = false) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.3"${dashed ? ' stroke-dasharray="5 5"' : ''}/>`;
const curve = (d, color = C.blue, dashed = false) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5"${dashed ? ' stroke-dasharray="5 5"' : ''}/>`;
const arrow = (x1, y1, x2, y2, color = C.blue) => {
  const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy) || 1, ux = dx / length, uy = dy / length;
  return line(x1, y1, x2, y2, color) + curve(`M${x2 - ux * 8 - uy * 3.5} ${y2 - uy * 8 + ux * 3.5}L${x2} ${y2}L${x2 - ux * 8 + uy * 3.5} ${y2 - uy * 8 - ux * 3.5}`, color);
};
const tag = (x, y, w, label, tone = 'neutral', size = 16, h = 30) => rect(x, y, w, h, tone === 'teal' ? 'url(#tealFill)' : tone === 'blue' ? 'url(#blueFill)' : C.panel, tone === 'teal' ? '#238d75' : '#346b9d', 4) + text(x + w / 2, y + (h + size) / 2 - 2, label, size, C.ink, 400, 'middle');
function windowFrame(x, y, w, h) {
  return rect(x, y, w, h, '#141925', '#586077', 6)
    + rect(x + 1, y + 1, w - 2, 25, 'url(#windowFill)', 'none', 5)
    + rect(x + 10, y + 10, Math.min(w * .3, 80), 6, '#7884ae', 'none', 0)
    + rect(x + w - 33, y + 9, 9, 7, '#7884ae', 'none', 3)
    + rect(x + w - 19, y + 9, 9, 7, '#7884ae', 'none', 3);
}
function tableRows(x, y, w, count = 3, rowH = 22, highlight = 1) {
  let out = '';
  for (let i = 0; i < count; i++) {
    if (i === highlight) out += rect(x - 4, y + i * rowH - 3, w + 8, rowH - 3, '#142c45', C.blue, 3);
    out += rect(x, y + i * rowH, w * .3, 7, i === highlight ? '#a7c9ec' : '#58658d', 'none', 0);
    out += rect(x + w * .36, y + i * rowH, w * .25, 7, C.faint, 'none', 0);
    out += rect(x + w * .69, y + i * rowH, w * .3, 7, C.faint, 'none', 0);
  }
  return out;
}
function records(x, y, w, h = 150, count = 3) {
  return windowFrame(x, y, w, h)
    + rect(x + 12, y + 37, w - 24, 20, '#1f2e43', '#3c4e67', 2)
    + rect(x + 23, y + 44, w * .43, 6, '#7c89b1', 'none', 0)
    + tableRows(x + 18, y + (h < 140 ? 68 : 72), w - 36, count, h < 140 ? 20 : 22);
}
function candidateCards(x, y, w) {
  let out = windowFrame(x, y, w, 150);
  const chipW = (w - 40) / 3;
  ['类别', '能力', '厂商'].forEach((label, i) => { out += tag(x + 12 + i * (chipW + 8), y + 36, chipW, label); });
  const cardW = (w - 36) / 2;
  for (let i = 0; i < 2; i++) {
    const cx = x + 12 + i * (cardW + 12);
    out += rect(cx, y + 78, cardW, 59, '#1d2536', '#45536e', 4);
    out += rect(cx + 10, y + 89, cardW - 30, 7, '#8a97c2', 'none', 0);
    out += rect(cx + 10, y + 104, cardW - 22, 5, '#515f83', 'none', 0);
    out += text(cx + 10, y + 127, '状态', 14, C.teal)
      + rect(cx + 48, y + 120, cardW - 60, 5, '#3f8d7c', 'none', 1);
  }
  return out;
}
function domain(x, y, w) {
  let out = windowFrame(x, y, w, 150);
  out += rect(x + 12, y + 36, w - 24, 28, '#233754', '#426993', 3) + text(x + 24, y + 56, '当前分析领域', 16);
  out += rect(x + 12, y + 76, w - 112, 61, '#20283b', '#414d69', 3) + text(x + 24, y + 99, '技术趋势', 16, C.muted);
  out += curve(`M${x + 24} ${y + 126}L${x + 49} ${y + 118}L${x + 74} ${y + 123}L${x + 103} ${y + 110}L${x + w - 123} ${y + 106}`, '#8f9fcf');
  out += rect(x + w - 88, y + 76, 76, 26, '#20283b', '#414d69', 3) + text(x + w - 50, y + 95, '报告', 16, C.muted, 400, 'middle');
  out += rect(x + w - 88, y + 111, 76, 26, '#20283b', '#414d69', 3) + text(x + w - 50, y + 130, '人才', 16, C.muted, 400, 'middle');
  return out;
}
function smallCanvas(x, y, w) {
  let out = windowFrame(x, y, w, 150);
  const propertyX = x + w - 82;
  out += rect(propertyX, y + 36, 70, 101, '#20283b', '#414d69', 3) + text(propertyX + 35, y + 59, '属性', 16, C.muted, 400, 'middle');
  for (let i = 0; i < 3; i++) out += rect(propertyX + 10, y + 76 + i * 20, 50, 6, '#515f83', 'none', 0);
  [x + 12, x + 68, x + 124].forEach((nx, i) => {
    if (i < 2) out += arrow(nx + 44, y + 93, nx + 54, y + 93, '#7d8cb9');
    out += rect(nx, y + 76, 44, 34, '#233754', '#4b77a1', 3) + text(nx + 22, y + 99, ['A', 'B', 'C'][i], 18, C.ink, 400, 'middle');
  });
  out += text(x + 90, y + 134, '节点关系', 16, C.muted, 400, 'middle');
  return out;
}
function doc({ id, number, height, title, desc, body }) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="360" height="${height}" viewBox="0 0 360 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" xml:lang="zh-CN">
<title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(desc)}</desc>
<defs>
<pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".7" fill="#d2e3f0" opacity=".18"/></pattern>
<linearGradient id="blueFill" x2="0" y2="1"><stop stop-color="#075181"/><stop offset="1" stop-color="#04395f"/></linearGradient>
<linearGradient id="tealFill" x2="0" y2="1"><stop stop-color="#006a54"/><stop offset="1" stop-color="#005040"/></linearGradient>
<linearGradient id="windowFill" x2="0" y2="1"><stop stop-color="#3d435e"/><stop offset="1" stop-color="#282d43"/></linearGradient>
</defs>
<rect width="360" height="${height}" fill="${C.bg}"/><rect width="360" height="${height}" fill="url(#dots)"/>
<g font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif">${text(20, 28, `GKX / 设计说明 ${number}`, 14, C.muted)}${body}</g>
</svg>\n`;
}

function sharedStructure() {
  let body = text(20, 64, '共用操作，', 24, C.ink, 600) + text(20, 96, '页面骨架随任务变化', 24, C.ink, 600);
  body += lines(20, 122, ['查询、反馈与返回沿用共同规则；', '内容组织由业务任务决定。'], 14, C.muted, 21);
  body += rect(20, 166, 320, 112, 'url(#tealFill)', '#258771', 7) + text(36, 194, '共用操作', 18, C.ink, 500);
  ['查询入口', '选择反馈', '返回路径', '操作反馈'].forEach((label, i) => { body += text(52 + i % 2 * 150, 224 + Math.floor(i / 2) * 28, label, 16); });
  body += curve('M180 278V294H20V972', '#438b80');
  const titles = ['资源发现', '领域分析', '对象维护', '节点建模'];
  const captions = ['候选卡片 · 比较模型', '领域内容 · 保持对象', '对象列表 · 逐条维护', '关系画布 · 配置节点'];
  const top = [318, 538, 758, 978];
  top.forEach((y, i) => {
    body += arrow(20, y - 6, 42, y - 6, '#438b80') + text(52, y, titles[i], 18, C.ink, 500);
    body += [candidateCards, domain, records, smallCanvas][i](52, y + 20, 288);
    body += text(52, y + 186, captions[i], 16, C.muted);
  });
  body += line(20, 1206, 340, 1206, '#2b3b46');
  body += lines(20, 1236, ['共用的是操作关系，', '变化的是业务组织。'], 18, C.ink, 26);
  body += lines(20, 1296, ['结构示意 · MaaS 模型广场，', '应用共用操作规范。'], 14, C.muted, 21);
  return doc({ id: '01-shared-structure', number: '01', height: 1340, title: '共用操作，页面骨架随任务变化', desc: '手机版结构示意：共用查询入口、选择反馈、返回路径和操作反馈，通过同一主干连接四种任务骨架：候选资源卡片、同一领域内容、对象列表及节点画布。MaaS 模型广场应用共用操作规范。', body });
}

function taskSpace() {
  let body = text(20, 64, '按任务分配空间', 24, C.ink, 600) + text(20, 96, '单条维护与节点建模', 20, C.ink, 500);
  body += lines(20, 126, ['短时处理贴近来源列表；', '关系编辑使用独立画布和节点属性。'], 14, C.muted, 21);

  body += text(20, 188, '单条维护', 20, C.ink, 500) + text(20, 214, '范围有限，结束后继续列表。', 14, C.muted);
  body += windowFrame(20, 234, 320, 164) + `<g opacity=".4">${tableRows(36, 277, 286, 4, 25)}</g>`;
  body += rect(114, 271, 210, 112, '#223249', '#6f83a6', 5) + text(128, 297, '详情 / 单条编辑', 18, C.ink, 500);
  body += rect(128, 313, 181, 15, '#121c2c', '#50617d', 2) + rect(128, 339, 181, 15, '#121c2c', '#50617d', 2) + rect(257, 365, 52, 12, '#2e647f', 'none', 2);
  body += arrow(180, 410, 180, 442, '#5c9bca') + text(196, 431, '关闭弹窗', 14, C.muted);
  body += records(20, 456, 320, 124) + text(20, 610, '继续列表，保留来源上下文', 18, C.teal);
  body += line(20, 636, 340, 636, '#263b45');

  body += text(20, 674, '节点建模', 20, C.ink, 500) + text(20, 700, '关系与配置并行，需要完整工作空间。', 14, C.muted);
  body += windowFrame(20, 722, 320, 100);
  body += text(34, 769, '流程 ID', 14, C.muted) + text(231, 769, '发布状态', 14, C.muted);
  body += tableRows(38, 783, 284, 2, 20, 0);
  body += arrow(180, 834, 180, 866, '#5c9bca') + text(196, 855, '进入建模', 14, C.muted);
  body += windowFrame(20, 880, 320, 218) + text(34, 930, '独立建模工作区', 18, C.ink, 500);
  body += line(32, 946, 328, 946, '#414d69');
  body += rect(232, 958, 96, 126, '#20283b', '#414d69', 3) + text(242, 982, '节点属性', 16, C.muted);
  body += text(242, 1008, '负责人', 14, C.muted) + rect(242, 1018, 76, 6, '#515f83', 'none', 0);
  body += text(242, 1052, '条件', 14, C.muted) + rect(242, 1062, 76, 6, '#515f83', 'none', 0);
  [34, 96, 158].forEach((nx, i) => {
    if (i < 2) body += arrow(nx + 48, 1002, nx + 60, 1002, '#8c9bc6');
    body += rect(nx, 982, 48, 40, '#213654', '#4b77a1', 3) + text(nx + 24, 1008, ['发起', '处理', '结束'][i], 18, C.ink, 400, 'middle');
  });
  body += text(120, 1062, '节点关系', 16, C.muted, 400, 'middle');
  body += curve('M180 1098V1118M90 1118H260', '#5c9bca') + arrow(90, 1118, 90, 1140, '#5c9bca') + arrow(260, 1118, 260, 1140, '#5c9bca');
  body += tag(20, 1150, 140, '保存', 'neutral', 18, 36) + tag(180, 1150, 160, '保存并发布', 'blue', 18, 36);
  body += text(90, 1211, '保留本次编辑', 14, C.muted, 400, 'middle') + text(260, 1211, '使流程生效', 14, C.muted, 400, 'middle');
  body += line(20, 1238, 340, 1238, '#2b3b46');
  body += text(20, 1267, '图稿设计意图 · 待实现核对', 16, C.muted, 500);
  body += lines(20, 1293, ['未保存提示、发布反馈及返回后的', '列表状态，仍待实现核对。'], 14, C.muted, 21);
  return doc({ id: '02-task-space', number: '02', height: 1336, title: '按任务分配空间：单条维护与节点建模', desc: '手机版图稿意图示意：短时单条维护使用同页弹窗，关闭后继续来源列表；节点建模从流程对象列表进入独立画布与节点属性工作区。保存用于保留本次编辑，保存并发布用于使流程生效。未保存提示、发布反馈及返回后的列表状态仍待实现核对，不代表已实现完整业务闭环。', body });
}

const output = fileURLToPath(new URL('../assets/projects/gkx/case-study/explainers-20261115/mobile/', import.meta.url));
await mkdir(output, { recursive: true });
const items = [['01-shared-structure', sharedStructure()], ['02-task-space', taskSpace()]];
for (const [id, svg] of items) {
  const sizes = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(match => Number(match[1]));
  if (sizes.some(size => size < 14)) throw new Error(`${id}: visible text below 14px`);
  await writeFile(path.join(output, `${id}.svg`), svg, 'utf8');
  console.log(`${id}.svg: 360 × ${id.startsWith('01') ? 1340 : 1336}`);
}
if (process.argv.includes('--preview')) {
  const { default: sharp } = await import('sharp');
  const previewDirectory = path.join(os.tmpdir(), 'gkx-structure-mobile-20261115');
  await mkdir(previewDirectory, { recursive: true });
  for (const [id, svg] of items) await sharp(Buffer.from(svg), { density: 144 }).png().toFile(path.join(previewDirectory, `${id}.png`));
  console.log(`Temporary PNGs: ${previewDirectory}`);
}

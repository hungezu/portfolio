import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Standalone SVGs: the generated assets contain their complete visual definitions.
// Their layout is designed at 360 px, rather than scaling the approved wide art.
const C = { bg: '#030405', panel: '#202b33', line: '#50616e', muted: '#a4b3c0', ink: '#f2f6fb', blue: '#4b9ae9', teal: '#4ac5a3', orange: '#f4ab63', purple: '#8493c4', faint: '#44516e' };
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const rect = (x, y, w, h, fill = C.panel, stroke = C.line, rx = 5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
const text = (x, y, value, size = 18, fill = C.ink, weight = 400, anchor = 'start') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`;
const line = (x1, y1, x2, y2, color = C.line, dashed = false) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.3"${dashed ? ' stroke-dasharray="5 5"' : ''}/>`;
const path = (d, color = C.blue, dashed = false) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5"${dashed ? ' stroke-dasharray="5 5"' : ''}/>`;
const arrowDown = (x, y1, y2) => line(x, y1, x, y2, C.blue) + path(`M${x - 4} ${y2 - 9} L${x} ${y2} L${x + 4} ${y2 - 9}`, C.blue);
const diamond = (x, y) => `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="${C.orange}" transform="rotate(45 ${x} ${y})"/>`;
const dashedBox = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="none" stroke="${C.line}" stroke-width="1" stroke-dasharray="5 5"/>`;
function windowFrame(x, y, w, h) {
  return rect(x, y, w, h, '#141925', '#586077', 6)
    + rect(x + 1, y + 1, w - 2, 25, 'url(#windowFill)', 'none', 5)
    + rect(x + 10, y + 10, Math.min(w * .3, 80), 6, '#7884ae', 'none', 0)
    + rect(x + w - 33, y + 9, 9, 7, '#7884ae', 'none', 3)
    + rect(x + w - 19, y + 9, 9, 7, '#7884ae', 'none', 3);
}
function tableRows(x, y, w, n = 3, highlight = 1) {
  let out = '';
  for (let i = 0; i < n; i++) {
    if (i === highlight) out += rect(x - 4, y + i * 25 - 4, w + 8, 22, '#142c45', C.blue, 3);
    out += rect(x, y + i * 25, w * .3, 7, i === highlight ? '#a7c9ec' : '#58658d', 'none', 0)
      + rect(x + w * .36, y + i * 25, w * .25, 7, C.faint, 'none', 0)
      + rect(x + w * .69, y + i * 25, w * .3, 7, C.faint, 'none', 0);
  }
  return out;
}
function documentIcon(x, y, w = 60, h = 74) {
  return path(`M${x} ${y} H${x + w - 14} L${x + w} ${y + 14} V${y + h} H${x} Z`, C.purple)
    + path(`M${x + w - 14} ${y} V${y + 14} H${x + w}`, C.purple)
    + line(x + 10, y + 30, x + w - 10, y + 30, C.faint)
    + line(x + 10, y + 43, x + w - 10, y + 43, C.faint)
    + line(x + 10, y + 56, x + w - 18, y + 56, C.faint);
}
function doc({ number, title, desc, height, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="${height}" viewBox="0 0 360 ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc><defs><pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".7" fill="#d2e3f0" opacity=".18"/></pattern><linearGradient id="blueFill" x2="0" y2="1"><stop stop-color="#075181"/><stop offset="1" stop-color="#04395f"/></linearGradient><linearGradient id="tealFill" x2="0" y2="1"><stop stop-color="#006a54"/><stop offset="1" stop-color="#005040"/></linearGradient><linearGradient id="windowFill" x2="0" y2="1"><stop stop-color="#3d435e"/><stop offset="1" stop-color="#282d43"/></linearGradient></defs><rect width="360" height="${height}" fill="${C.bg}"/><rect width="360" height="${height}" fill="url(#dots)"/><g font-family="Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif">${text(24, 28, 'GKX / 设计说明 ' + number, 14, C.muted)}${body}</g></svg>`;
}

function recovery() {
  let body = text(24, 68, '导入失败', 24, C.ink, 600)
    + text(24, 98, '从问题定位到继续处理', 20, C.ink, 500)
    + text(24, 126, '指出问题位置，保留重传入口。', 14, C.muted);

  body += text(24, 165, '01 失败提示', 18, C.ink, 500)
    + windowFrame(24, 181, 312, 138)
    + dashedBox(40, 221, 130, 78)
    + path('M81 249 L105 232 L129 249 M105 233 V271 M77 273 V283 H133 V273', C.purple)
    + text(105, 295, '文件上传区', 14, C.muted, 400, 'middle')
    + path('M188 235 L200 247 M200 235 L188 247', C.muted)
    + text(207, 250, '导入失败', 18, C.ink, 500)
    + text(187, 279, '知道没有完成', 14, C.muted)
    + arrowDown(180, 331, 349);

  body += text(24, 375, '02 错误行定位', 18, C.ink, 500)
    + windowFrame(24, 391, 312, 142)
    + tableRows(44, 434, 272)
    + path('M36 455 H32 V479 H36', C.blue)
    + text(44, 515, '定位需要修改的行', 18)
    + arrowDown(180, 545, 563);

  body += text(24, 589, '03 修正源文件', 18, C.ink, 500)
    + windowFrame(24, 605, 312, 142)
    + rect(44, 646, 272, 79, '#151b27', C.faint, 2)
    + [1, 2].map(column => line(44 + column * 91, 646, 44 + column * 91, 725, C.faint)).join('')
    + [1, 2].map(row => line(44, 646 + row * 26, 316, 646 + row * 26, C.faint)).join('')
    + rect(137, 674, 86, 23, 'url(#tealFill)', '#278771', 2)
    + text(180, 692, '修正', 18, C.ink, 500, 'middle')
    + [0, 1, 2].map(row => rect(56, 657 + row * 26, 55, 5, '#58658d', 'none', 0) + rect(239, 657 + row * 26, 55, 5, C.faint, 'none', 0)).join('')
    + rect(148, 657, 55, 5, C.faint, 'none', 0)
    + rect(148, 709, 55, 5, C.faint, 'none', 0)
    + arrowDown(180, 759, 777);

  body += text(24, 803, '04 重新上传', 18, C.ink, 500)
    + windowFrame(24, 819, 312, 138)
    + documentIcon(44, 862)
    + rect(124, 875, 190, 34, 'url(#blueFill)', '#346b9d', 4)
    + text(219, 899, '重新上传', 18, C.ink, 400, 'middle')
    + text(124, 935, '有明确的继续入口', 16, C.muted)
    + diamond(28, 986)
    + text(44, 992, '完整恢复流程仍待核对。', 16, C.muted)
    + line(24, 1014, 336, 1014, '#2b3b46')
    + text(24, 1042, '定位问题 → 修正文件 → 重新上传', 16, C.ink, 500)
    + text(24, 1071, '结构示意，不表示恢复流程已经验收。', 14, C.muted);

  return doc({ number: '05', title: '导入失败：从问题定位到继续处理', desc: '失败提示、错误行定位、修正源文件、重新上传四步反馈路径。图稿已有错误定位与重传入口，完整恢复流程仍待核对，不表示已经验收。', height: 1092, body });
}

function missingMaterial(x, label, kind) {
  let icon;
  if (kind === 'component') icon = dashedBox(x + 31, 923, 34, 28) + dashedBox(x + 39, 932, 18, 10);
  else if (kind === 'comparison') icon = dashedBox(x + 27, 919, 17, 37) + dashedBox(x + 52, 919, 17, 37) + line(x + 45, 937, x + 51, 937, C.faint, true);
  else icon = `<circle cx="${x + 48}" cy="938" r="18" fill="none" stroke="${C.line}" stroke-width="1" stroke-dasharray="4 4"/>` + path(`M${x + 48} 926 V938 L${x + 58} 944`, C.faint, true);
  return dashedBox(x, 906, 96, 96) + icon + text(x + 48, 985, label, 18, C.muted, 400, 'middle');
}

function review() {
  let body = text(24, 68, '从设计规范到交付核对', 24, C.ink, 600)
    + text(24, 98, '按页面任务组织规范，分别保留', 14, C.muted)
    + text(24, 120, '本人署名记录与团队评审意见。', 14, C.muted)
    + text(24, 158, '规范应用方法', 18, C.ink, 500);

  // The method is separate from the source records: no connector asserts a rule mapping.
  body += rect(55, 170, 264, 58, '#151b24', C.faint, 5)
    + rect(48, 180, 264, 58, C.panel, C.line, 5)
    + line(48, 190, 48, 226, C.teal)
    + text(180, 215, '设计规范 / MD', 20, C.ink, 500, 'middle')
    + arrowDown(180, 249, 263)
    + windowFrame(48, 273, 264, 68)
    + rect(63, 310, 57, 20, '#18253b', C.faint, 2)
    + line(72, 317, 110, 317, C.purple) + line(72, 324, 99, 324, C.faint)
    + text(218, 326, '页面任务', 20, C.ink, 500, 'middle')
    + arrowDown(180, 351, 367)
    + rect(48, 379, 264, 58, C.panel, C.line, 6)
    + rect(66, 392, 12, 12, 'none', C.teal, 1) + line(87, 398, 115, 398, C.faint)
    + rect(66, 413, 12, 12, 'none', C.teal, 1) + line(87, 419, 115, 419, C.faint)
    + text(218, 415, '核对点', 20, C.ink, 500, 'middle')
    + line(24, 458, 336, 458, '#2b3b46');

  body += text(24, 480, '本人署名的历史记录', 18, C.ink, 500)
    + windowFrame(24, 496, 312, 164)
    + text(40, 545, '原表第 15 行', 18, C.ink, 500)
    + text(320, 545, '2026/10/08', 14, C.muted, 400, 'end')
    + rect(40, 557, 280, 31, '#142c45', C.blue, 3)
    + text(52, 579, '基础数据管理', 18, C.ink, 500)
    + text(308, 579, '原表最终：通过', 16, C.ink, 400, 'end')
    + text(40, 613, '意见：微调即可，', 16, C.muted)
    + text(40, 640, '组件样式调整', 16, C.muted);

  body += text(24, 696, '团队意见（非本人署名）', 18, C.ink, 500)
    + windowFrame(24, 713, 312, 140)
    + text(40, 758, '2026/05/21', 14, C.muted)
    + `<g fill="none" stroke="${C.purple}" stroke-width="1"><circle cx="50" cy="783" r="6"/><circle cx="72" cy="783" r="6"/></g>`
    + path('M40 812 V803 Q50 791 60 803 V812 M62 812 V803 Q72 791 82 803 V812', C.faint)
    + text(94, 786, '关系模块', 18, C.ink, 500)
    + text(94, 818, 'UI 风格与规范不统一', 16, C.muted);

  body += text(24, 890, '个人记录仍缺少的材料', 18, C.ink, 500)
    + missingMaterial(24, '具体组件', 'component')
    + missingMaterial(132, '修改前后', 'comparison')
    + missingMaterial(240, '二次复核', 'recheck')
    + diamond(28, 1034)
    + text(44, 1040, '署名记录支持评审参与；', 16, C.muted)
    + text(44, 1065, '具体整改与复核过程仍待补证。', 16, C.muted)
    + line(24, 1090, 336, 1090, '#2b3b46')
    + text(24, 1119, '规范用于核对页面；', 18, C.ink, 500)
    + text(24, 1146, '台账保留实际评审意见与原表结论。', 16, C.ink, 500)
    + text(24, 1178, '结构示意 · 原表未附具体组件、', 14, C.muted)
    + text(24, 1200, '修改前后界面与二次复核材料。', 14, C.muted);

  return doc({ number: '06', title: '从设计规范到交付核对', desc: '设计规范和 MD 按页面任务组织核对点。本人署名历史记录：2026/10/08，原表第15行，基础数据管理，原表最终通过，意见为微调即可、组件样式调整。另列非本人署名的团队意见：2026/05/21，关系模块 UI 风格与规范不统一。具体组件、修改前后、二次复核材料仍缺少；署名记录支持评审参与，具体整改与复核过程仍待补证。', height: 1224, body });
}

const assetDir = new URL('../assets/projects/gkx/case-study/explainers-20261115/mobile/', import.meta.url);
const previewDir = new URL('../tmp/gkx-review-mobile-preview/', import.meta.url);
await mkdir(assetDir, { recursive: true });
for (const [id, svg] of [['05-recovery', recovery()], ['06-review', review()]]) {
  await writeFile(new URL(id + '.svg', assetDir), svg, 'utf8');
  if (process.argv.includes('--preview')) {
    const { default: sharp } = await import('sharp');
    await mkdir(previewDir, { recursive: true });
    await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(new URL(id + '.png', previewDir)));
  }
  console.log(`Generated ${id}.svg (360 px mobile layout)`);
}

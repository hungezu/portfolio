(function (root) {
  'use strict';
  const Markdown = root.marked || (typeof require === 'function' ? require('./vendor/marked.umd.js') : null);
  const DATA = root.ZMD_DATA || (typeof require === 'function' ? require('./zhaocai-smart-04-data.js') : null);
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const number = value => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value);
  function chartData(raw) {
    let c;
    try { c = JSON.parse(raw); } catch (_) { throw new Error('图表内容不是有效的 JSON。'); }
    if (!c || Array.isArray(c) || typeof c !== 'object') throw new Error('图表需要一个数据对象。');
    if (!['bar', 'line'].includes(c.type)) throw new Error('type 仅支持 bar 或 line。');
    if (typeof c.title !== 'string' || !c.title.trim() || c.title.length > 100) throw new Error('请填写 1—100 字的图表标题。');
    if (typeof c.unit !== 'string' || !c.unit.trim() || c.unit.length > 20) throw new Error('请填写不超过 20 字的单位。');
    if (!Array.isArray(c.categories) || !Array.isArray(c.values) || c.categories.length !== c.values.length) throw new Error('categories 与 values 必须为等长数组。');
    if (c.values.length < (c.type === 'line' ? 2 : 1) || c.values.length > 24) throw new Error('柱图需 1—24 项，折线图需 2—24 项。');
    if (c.categories.some(x => typeof x !== 'string' || !x.trim() || x.length > 40)) throw new Error('每个分类需填写不超过 40 字的名称。');
    if (c.values.some(x => typeof x !== 'number' || !Number.isFinite(x) || Math.abs(x) > 1e12)) throw new Error('数值必须为有限数字，绝对值不超过 1 万亿；缺失不能填 null。');
    return c;
  }
  function renderChart(raw) {
    let c;
    try { c = chartData(raw); } catch (error) {
      return '<div class="zmd-chart-error" data-rule="图表 · 结构检查">图表暂未生成：' + escape(error.message) + '</div><pre><code>' + escape(raw) + '</code></pre>';
    }
    const min = Math.min(0, ...c.values), max = Math.max(0, ...c.values), range = max - min || 1;
    const upper = min === 0 && max === 0 ? 1 : max;
    const y = v => 38 + (upper - v) / range * 180;
    const baseline = y(0), step = 552 / c.values.length, x = i => 72 + step * (i + .5);
    let parts = [];
    for (let i = 0; i <= 4; i++) {
      const value = min + range * i / 4, yy = y(value);
      parts.push('<line x1="66" x2="634" y1="' + yy + '" y2="' + yy + '" stroke="#e6ebf2"/><text x="55" y="' + (yy + 5) + '" text-anchor="end">' + escape(number(value)) + '</text>');
    }
    parts.push('<line x1="66" x2="634" y1="' + baseline + '" y2="' + baseline + '" stroke="#bac4d2"/>');
    if (c.type === 'line') parts.push('<polyline fill="none" stroke="#7050d4" stroke-width="2.5" points="' + c.values.map((v, i) => x(i) + ',' + y(v)).join(' ') + '"/>');
    c.values.forEach((value, i) => {
      const yy = y(value), xx = x(i), width = Math.min(58, step * .58);
      if (c.type === 'bar') {
        if (value === 0) parts.push('<line x1="' + (xx - width / 2) + '" x2="' + (xx + width / 2) + '" y1="' + baseline + '" y2="' + baseline + '" stroke="#7050d4" stroke-width="2"/>');
        else parts.push('<rect x="' + (xx - width / 2) + '" y="' + Math.min(yy, baseline) + '" width="' + width + '" height="' + Math.abs(yy - baseline) + '" rx="3" fill="' + (i === c.values.length - 1 ? '#7050d4' : '#a28ce9') + '"/>');
      } else parts.push('<circle cx="' + xx + '" cy="' + yy + '" r="4" fill="#7050d4" stroke="#ffffff" stroke-width="2"/>');
      if (c.values.length <= 8) parts.push('<text class="zmd-chart-value" x="' + xx + '" y="' + (yy + (value < 0 ? 20 : -10)) + '" text-anchor="middle">' + escape(number(value)) + '</text>');
      if (i % Math.ceil(c.values.length / 8) === 0 || i === c.values.length - 1) {
        const label = c.categories[i].length > 10 ? c.categories[i].slice(0, 9) + '…' : c.categories[i];
        parts.push('<text x="' + xx + '" y="266" text-anchor="middle">' + escape(label) + '</text>');
      }
    });
    const rows = c.categories.map((label, i) => '<tr><td>' + escape(label) + '</td><td style="text-align:right">' + escape(number(c.values[i])) + '</td></tr>').join('');
    return '<figure class="zmd-chart" data-rule="图表 · 同源数据"><figcaption>' + escape(c.title) + ' <span class="zmd-chart-unit">/ ' + escape(c.unit) + '</span></figcaption><div class="zmd-chart-plot"><svg viewBox="0 0 680 288" role="img" aria-label="' + escape(c.title + '，单位：' + c.unit + '。精确数值可展开下方数据表。') + '"><title>' + escape(c.title) + '</title>' + parts.join('') + '</svg></div><details><summary>查看图表数据 · ' + c.values.length + ' 项</summary><div class="zmd-table-wrap"><table><thead><tr><th scope="col">分类</th><th scope="col" style="text-align:right">数值（' + escape(c.unit) + '）</th></tr></thead><tbody>' + rows + '</tbody></table></div></details></figure>';
  }
  function safeURL(href) {
    if (!/^https?:\/\//i.test(href) || /[\u0000-\u0020<>"']/.test(href)) return null;
    try { const u = new URL(href); return ['https:', 'http:'].includes(u.protocol) ? u.href : null; } catch (_) { return null; }
  }
  function validateDocument(markdown, sources = DATA.sources) {
    const checks = [], headings = [], tables = [], charts = [], missing = new Set();
    let rawHTML = false, imageCount = 0, unsafeLinks = 0;
    const tokens = Markdown.lexer(markdown, { gfm: true });
    Markdown.walkTokens(tokens, token => {
      if (token.type === 'heading') headings.push(token.depth);
      if (token.type === 'table') tables.push(token);
      if (token.type === 'code' && (token.lang || '').trim().toLowerCase() === 'zcs-chart') {
        try { chartData(token.text); charts.push(null); } catch (error) { charts.push(error.message); }
      }
      if (token.type === 'html') rawHTML = true;
      if (token.type === 'image') imageCount++;
      if (token.type === 'link') {
        if (token.href.startsWith('#source-')) { const id = token.href.slice(8); if (!sources[id]) missing.add(id); }
        else if (!safeURL(token.href)) unsafeLinks++;
      }
    });
    let last = 0, hierarchyOK = headings.filter(d => d === 1).length <= 1;
    for (const depth of headings) { if (depth > 3 || depth > last + 1) hierarchyOK = false; last = depth; }
    const check = (ok, text) => checks.push({ tone: ok ? 'ok' : 'warning', text });
    check(!!markdown.trim(), markdown.trim() ? '正文已提供 · ' + markdown.trim().length.toLocaleString('zh-CN') + ' 字符' : '尚未填写回答内容。');
    check(hierarchyOK, hierarchyOK ? '标题层级连续，未超过三级' : '标题应从一级开始、连续分层，且最多一个一级标题。');
    check(!missing.size, missing.size ? '以下引用尚未登记：' + [...missing].join('、') : '已使用的来源标识均可对应到本例资料');
    check(!rawHTML && !imageCount && !unsafeLinks, rawHTML || imageCount || unsafeLinks ? '原始 HTML、图片或未支持的链接已转为文字，请检查表达。' : '内容未使用原始 HTML、远程图片或未支持链接');
    const chartErrors = charts.filter(Boolean);
    if (charts.length) check(!chartErrors.length, chartErrors.length ? chartErrors.join('；') : charts.length + ' 个图表通过结构检查');
    if (tables.length) check(true, tables.length + ' 张表格已识别；数值、单位和合计请结合来源核对');
    // Detect an unclosed backtick/tilde fence without treating inline code as a fence.
    let fence = null;
    for (const line of markdown.split('\n')) {
      const m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
      if (!m) continue;
      if (!fence) fence = { char: m[1][0], length: m[1].length };
      else if (m[1][0] === fence.char && m[1].length >= fence.length && !m[2].trim()) fence = null;
    }
    if (fence) check(false, '检测到未闭合的代码围栏，后续正文可能被当成代码。');
    return { checks, headingCount: headings.length, tableCount: tables.length, warnings: checks.filter(c => c.tone === 'warning').length };
  }
  function compileMarkdown(markdown, sources = DATA.sources) {
    let headingIndex = 0;
    const headings = [];
    const parser = new Markdown.Marked({ gfm: true, breaks: false, renderer: {
      html(token) { return escape(token.text); },
      heading(token) {
        const depth = Math.min(token.depth, 3), id = 'zmd-heading-' + (++headingIndex);
        const text = this.parser.parseInline(token.tokens);
        headings.push({ id, depth: token.depth });
        return '<h' + (depth + 2) + ' id="' + id + '" data-md-depth="' + depth + '" data-rule="标题 · ' + depth + ' 级">' + text + '</h' + (depth + 2) + '>\n';
      },
      paragraph(token) { return '<p data-rule="正文 · 14 / 24px">' + this.parser.parseInline(token.tokens) + '</p>\n'; },
      blockquote(token) {
        const warn = /^(?:>\s*)?\s*(?:\*\*)?(注意|数据缺口|暂无数据|限制)/.test(token.text);
        return '<blockquote data-rule="引文 / 口径提示"' + (warn ? ' data-tone="warning"' : '') + '>' + this.parser.parse(token.tokens) + '</blockquote>\n';
      },
      code(token) {
        const lang = (token.lang || '').trim().toLowerCase();
        if (lang === 'zcs-chart') return renderChart(token.text);
        return '<pre data-rule="代码 · 仅展示"><span class="zmd-code-label">' + escape(lang || 'text') + '</span><code>' + escape(token.text) + '</code></pre>\n';
      },
      checkbox(token) { return '<input type="checkbox" disabled' + (token.checked ? ' checked' : '') + ' aria-label="' + (token.checked ? '已核对' : '待核对') + '">'; },
      table(token) {
        const cell = (item, i, isHeader) => {
          const tag = isHeader ? 'th' : 'td', align = ['left', 'center', 'right'].includes(token.align[i]) ? token.align[i] : 'left';
          return '<' + tag + (isHeader ? ' scope="col"' : '') + ' style="text-align:' + align + '">' + this.parser.parseInline(item.tokens) + '</' + tag + '>';
        };
        return '<div class="zmd-table-wrap" data-rule="表格 · 单位 / 对齐 / 合计" tabindex="0" role="region" aria-label="数据表，可横向滚动"><table><thead><tr>' + token.header.map((c, i) => cell(c, i, true)).join('') + '</tr></thead><tbody>' + token.rows.map(row => '<tr>' + row.map((c, i) => cell(c, i, false)).join('') + '</tr>').join('') + '</tbody></table></div>\n';
      },
      link(token) {
        const label = this.parser.parseInline(token.tokens), href = token.href || '';
        if (href.startsWith('#source-')) {
          const id = href.slice(8), source = sources[id];
          if (!source) return '<span class="zmd-unavailable-link" title="来源尚未登记">' + label + '</span>';
          const citationClass = /^\d+$/.test(token.text) ? 'zmd-cite' : 'zmd-source-link';
          return '<a class="' + citationClass + '" href="' + escape(href) + '" data-zmd-cite="' + escape(id) + '" aria-label="查看引用：' + escape(source.title) + '">' + label + '</a>';
        }
        const url = safeURL(href);
        return url ? '<a href="' + escape(url) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>' : '<span class="zmd-unavailable-link">' + label + '</span>';
      },
      image(token) { return '<span class="zmd-image-alt">[图片说明：' + escape(token.text || '未提供说明') + ']</span>'; }
    }});
    return { html: parser.parse(markdown), headings, validation: validateDocument(markdown, sources) };
  }
  function createState(data) {
    let mode = 'scenes', sceneId = data.scenes[0].id, ruleId = data.rules[0].id;
    const current = () => data[mode].find(item => item.id === (mode === 'scenes' ? sceneId : ruleId));
    return {
      mode: () => mode, current, text: () => current().markdown,
      select(nextMode, id) {
        if (!['scenes', 'rules'].includes(nextMode)) return false;
        if (id && !data[nextMode].some(item => item.id === id)) return false;
        mode = nextMode;
        if (id && mode === 'scenes') sceneId = id;
        if (id && mode === 'rules') ruleId = id;
        return true;
      }
    };
  }
  function createDialogController(dialog, ownerDocument) {
    let opener = null, backdropPress = false;
    const outside = event => {
      if (event.target !== dialog) return false;
      const rect = dialog.getBoundingClientRect();
      return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    };
    const close = () => { if (dialog.open) dialog.close(); };
    dialog.addEventListener('pointerdown', event => { backdropPress = outside(event); });
    dialog.addEventListener('click', event => {
      const pressed = backdropPress; backdropPress = false;
      if (event.target.closest('[data-zmd-close]')) { event.preventDefault(); event.stopPropagation(); close(); }
      else if (pressed && outside(event)) close();
    });
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); } });
    dialog.addEventListener('close', () => {
      backdropPress = false;
      if ((ownerDocument.activeElement === ownerDocument.body || dialog.contains(ownerDocument.activeElement)) && opener?.isConnected) opener.focus({ preventScroll: true });
      opener = null;
    });
    return { close, open() { if (!dialog.open) { opener = ownerDocument.activeElement; dialog.showModal(); } } };
  }
  const API = { chartData, renderChart, compileMarkdown, validateDocument, createState, createDialogController, safeURL };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document === 'undefined') return;
  function mount(section) {
    if (section.dataset.zmdMounted) return;
    section.dataset.zmdMounted = 'true';
    const $ = selector => section.querySelector(selector);
    const $$ = selector => [...section.querySelectorAll(selector)];
    const state = createState(DATA), rendered = $('[data-zmd-render]');
    const scroll = $('[data-zmd-reading-scroll]'), dialog = $('[data-zmd-dialog]');
    const dialogs = createDialogController(dialog, document);
    function renderReading() {
      const outline = $('[data-zmd-outline]');
      outline.replaceChildren();
      try {
        const result = compileMarkdown(state.text());
        rendered.innerHTML = result.html;
        $('[data-zmd-reading-meta]').textContent = result.validation.headingCount + ' 个标题 · ' + result.validation.tableCount + ' 张数据表';
        const headings = result.headings.filter(item => item.depth === 2);
        outline.hidden = headings.length < 4;
        if (!outline.hidden) headings.forEach(item => {
          const node = rendered.querySelector('#' + item.id), button = document.createElement('button');
          button.type = 'button'; button.textContent = node.textContent; button.dataset.zmdHeading = item.id;
          outline.append(button);
        });
      } catch (_) {
        rendered.replaceChildren();
        const message = document.createElement('p'); message.className = 'zmd-chart-error'; message.textContent = '此内容暂时无法完成排版，原文已保留。';
        const pre = document.createElement('pre'); pre.textContent = state.text(); rendered.append(message, pre);
        outline.hidden = true; $('[data-zmd-reading-meta]').textContent = '原文保留';
      }
      scroll.scrollTop = 0;
    }
    function showCurrent() {
      const mode = state.mode(), item = state.current();
      $$('[data-zmd-mode]').forEach(button => { const selected = button.dataset.zmdMode === mode; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
      $('#zmd-workspace').setAttribute('aria-labelledby', mode === 'scenes' ? 'zmd-scenes-tab' : 'zmd-rules-tab');
      $('[data-zmd-nav-title]').textContent = mode === 'scenes' ? '按业务任务选择' : '按内容组件选择';
      $('[data-zmd-nav]').innerHTML = DATA[mode].map((entry, i) => '<button type="button" data-zmd-item="' + escape(entry.id) + '" aria-current="' + (entry.id === item.id) + '"><span>' + String(i + 1).padStart(2, '0') + '</span>' + escape(entry.label) + '</button>').join('');
      $('[data-zmd-example-label]').textContent = (mode === 'scenes' ? '场景 / ' : item.code + ' / ') + item.label;
      $('[data-zmd-question]').textContent = item.question;
      $('[data-zmd-description]').textContent = item.description;
      const tags = $('[data-zmd-rule-tags]');
      tags.innerHTML = item.tags.map(id => { const rule = DATA.rules.find(r => r.id === id); return rule ? '<button type="button" data-zmd-rule="' + escape(id) + '" aria-label="查看' + escape(rule.label) + '规则">' + escape(rule.label) + ' ↗</button>' : ''; }).join('');
      tags.hidden = !item.tags.length;
      const specList = $('[data-zmd-rule-spec]');
      specList.hidden = !item.specs;
      specList.innerHTML = item.specs ? item.specs.map(([label,value]) => '<div><dt>' + escape(label) + '</dt><dd>' + escape(value) + '</dd></div>').join('') : '';
      renderReading();
    }
    function openSource(id) {
      const source = DATA.sources[id]; if (!source) return;
      $('[data-zmd-source-title]').textContent = source.title;
      const fields = [['统计期间', source.period], ['组织范围', source.scope], ['指标口径', source.metric], ['金额单位', source.unit]];
      $('[data-zmd-source-body]').innerHTML = '<dl>' + fields.map(([label, value]) => '<div><dt>' + escape(label) + '</dt><dd>' + escape(value) + '</dd></div>').join('') + '</dl><div class="zmd-table-wrap" tabindex="0" role="region" aria-label="来源明细，可横向滚动"><table class="zmd-source-table"><thead><tr>' + source.headers.map(h => '<th scope="col">' + escape(h) + '</th>').join('') + '</tr></thead><tbody>' + source.rows.map(row => '<tr>' + row.map(value => '<td' + (/^[−\-+]?\d[\d,.]*%?$/.test(value) ? ' style="text-align:right"' : '') + '>' + escape(value) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div><p>' + escape(source.description) + '</p>';
      dialogs.open(); dialog.scrollTop = 0;
    }
    section.addEventListener('click', event => {
      const target = event.target.closest('button,a'); if (!target) return;
      if (target.hasAttribute('data-zmd-cite')) { event.preventDefault(); openSource(target.dataset.zmdCite); }
      else if (target.hasAttribute('data-zmd-mode')) { state.select(target.dataset.zmdMode); showCurrent(); }
      else if (target.hasAttribute('data-zmd-item')) {
        const id = target.dataset.zmdItem; state.select(state.mode(), id); showCurrent();
        $('[data-zmd-item="' + id + '"]').focus({ preventScroll: true });
      }
      else if (target.hasAttribute('data-zmd-rule')) {
        state.select('rules', target.dataset.zmdRule); showCurrent(); $('[data-zmd-mode="rules"]').focus({ preventScroll: true });
      }
      else if (target.hasAttribute('data-zmd-heading')) {
        const heading = rendered.querySelector('#' + target.dataset.zmdHeading);
        if (heading) scroll.scrollTo({ top: scroll.scrollTop + heading.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 20, behavior: 'auto' });
      }
    });
    $('[data-zmd-annotations]').addEventListener('change', event => { rendered.classList.toggle('zmd-annotated', event.target.checked); });
    $$('[role="tablist"]').forEach(tablist => tablist.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const tabs = [...tablist.querySelectorAll('[role="tab"]')], index = tabs.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click(); tabs[next].focus({ preventScroll: true });
    }));
    showCurrent();
  }
  function initialize() { document.querySelectorAll('[data-zmd]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})(globalThis);

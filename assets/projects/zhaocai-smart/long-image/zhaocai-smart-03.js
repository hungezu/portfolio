(function () {
  'use strict';

  // Frontend proposal: fixtures only, no network, model reasoning or persistent business data.
  const fixtureCents = { 2023: [112, 131, 147, 150], 2024: [132, 146, 159, 171], 2025: [] };
  const quarters = ['一季度', '二季度', '三季度', '四季度'];
  const phaseNames = { completed: '已完成', running: '执行中', timeout: '查询超时', stopped: '已停止', empty: '未查到数据' };
  const copy = value => JSON.parse(JSON.stringify(value));
  const question = year => '查看 ' + year + ' 年全集团利润变化';
  const scope = year => year + ' 年 · 全集团 · 净利润';
  const total = rows => (rows.reduce((sum, row) => sum + row.cents, 0) / 100).toFixed(2);
  const rowsFor = year => (fixtureCents[year] || []).map((cents, i) => ({ quarter: quarters[i], cents }));

  function createZcfRuntime(options = {}) {
    const now = options.now || (() => Date.now());
    const setDelay = options.setDelay || setTimeout;
    const clearDelay = options.clearDelay || clearTimeout;
    const onChange = options.onChange || (() => {});
    const names = ['理解问题', '查询数据', '生成结果'];
    let timers = [];
    let sequence = 248;
    let generation = 0;
    let state = {
      id: 'ZC-0248', phase: 'completed', step: 2, attempt: 2, scenario: 'timeout', year: 2024,
      originalQuestion: question(2024), hasData: true, rows: rowsFor(2024), sourceAttempt: 2,
      longWait: false, resultPreview: 2,
      steps: names.map((name, i) => ({ name, state: 'done', copy: ['时间、组织与指标已对齐', '返回 4 条季度汇总数据', '已生成图表并关联查询快照'][i] })),
      snapshots: [
        { attempt: 1, year: 2024, phase: 'timeout', rows: [], sourceAttempt: null },
        { attempt: 2, year: 2024, phase: 'completed', rows: rowsFor(2024), sourceAttempt: 2 }
      ],
      events: [
        { time: '09:41:02', actor: '用户', title: '提出业务问题', detail: question(2024), tone: 'normal', attempt: 1 },
        { time: '09:41:05', actor: '用户', title: '确认指标口径', detail: '利润 → 净利润；其余条件保留', tone: 'normal', attempt: 1 },
        { time: '09:41:06', actor: '数据服务', title: '发起第 1 次查询', detail: scope(2024), tone: 'normal', attempt: 1 },
        { time: '09:41:10', actor: '数据服务', title: '查询超时', detail: '未返回数据，尚未生成分析结果', tone: 'warning', attempt: 1 },
        { time: '09:41:14', actor: '用户', title: '重试查询', detail: '第 2 次执行；沿用已确认条件', tone: 'normal', attempt: 2 },
        { time: '09:41:16', actor: '数据服务', title: '返回业务数据', detail: '4 条季度汇总数据', tone: 'normal', attempt: 2 },
        { time: '09:41:18', actor: 'AI 助手', title: '生成分析结果', detail: '第 2 次执行结果已关联查询快照', tone: 'normal', attempt: 2 }
      ]
    };
    function publish() {
      const snapshot = state.snapshots[state.snapshots.length - 1];
      Object.assign(snapshot, { phase: state.phase, rows: copy(state.rows), sourceAttempt: state.sourceAttempt });
      onChange(copy(state));
    }
    function cancel() { generation += 1; timers.forEach(clearDelay); timers = []; }
    function later(delay, action) {
      const version = generation;
      timers.push(setDelay(() => { if (version === generation) action(); }, delay));
    }
    function event(actor, title, detail, tone = 'normal') {
      state.events.push({ time: new Date(now()).toLocaleTimeString('zh-CN', { hour12: false }), actor, title, detail, tone, attempt: state.attempt });
    }
    function stage(index) {
      state.phase = 'running'; state.step = index; state.longWait = false;
      state.steps[index] = { name: names[index], state: 'running', copy: ['正在核对已确认的时间、组织与指标', '正在读取 ' + state.year + ' 年集团净利润数据', '正在将返回数据整理为结论与图表'][index] };
      if (index === 1) {
        event('数据服务', '发起第 ' + state.attempt + ' 次查询', scope(state.year));
        const attempt = state.attempt;
        later(10000, () => {
          if (state.phase !== 'running' || state.step !== 1 || state.attempt !== attempt) return;
          state.longWait = true;
          event('系统', '查询仍在进行', '数据读取已超过 10 秒，尚未返回查询结果');
          publish();
        });
      }
      if (index === 2) {
        state.resultPreview = 0;
        later(300, () => { state.resultPreview = 1; publish(); });
        later(800, () => { state.resultPreview = 2; publish(); });
      }
      publish();
      const queryDelay = state.scenario === 'slow' ? 12400 : state.scenario === 'timeout' && state.attempt === 1 ? 4500 : 1700;
      later([900, queryDelay, 1200][index], () => {
        if (index === 0) {
          state.steps[0] = { name: names[0], state: 'done', copy: '时间、组织与指标已对齐' };
          stage(1);
        } else if (index === 1) {
          state.longWait = false;
          if (state.scenario === 'timeout' && state.attempt === 1) {
            state.phase = 'timeout';
            state.steps[1] = { name: names[1], state: 'timeout', copy: '本次数据请求已超时，未返回数据' };
            event('数据服务', '查询超时', '尚未生成分析结果；可以保留条件重试', 'warning');
            publish();
            return;
          }
          state.rows = rowsFor(state.year);
          state.hasData = state.rows.length > 0;
          state.sourceAttempt = state.attempt;
          if (!state.hasData) {
            state.phase = 'empty';
            state.steps[1] = { name: names[1], state: 'done', copy: '查询已结束，返回 0 条匹配数据' };
            state.steps[2].copy = '没有可用于分析的数据';
            event('数据服务', '未查到匹配数据', scope(state.year) + '；返回 0 条数据', 'warning');
            publish();
          } else {
            state.steps[1] = { name: names[1], state: 'done', copy: '返回 4 条季度汇总数据' };
            event('数据服务', '返回业务数据', '4 条季度汇总数据；原始表格已可查看');
            stage(2);
          }
        } else {
          state.steps[2] = { name: names[2], state: 'done', copy: '已生成图表并关联查询快照' };
          state.phase = 'completed'; state.resultPreview = 2;
          event('AI 助手', '生成分析结果', '第 ' + state.attempt + ' 次执行结果已关联查询快照');
          publish();
        }
      });
    }
    function newSnapshot() {
      state.snapshots.push({ attempt: state.attempt, year: state.year, phase: 'running', rows: copy(state.rows), sourceAttempt: state.sourceAttempt });
    }
    return {
      getState: () => copy(state),
      start(scenario = 'slow') {
        cancel(); sequence += 1;
        scenario = ['slow', 'timeout', 'success', 'empty'].includes(scenario) ? scenario : 'slow';
        const year = scenario === 'empty' ? 2025 : 2024;
        state = { id: 'ZC-' + String(sequence).padStart(4, '0'), phase: 'running', step: 0, attempt: 1, scenario, year, originalQuestion: question(year), hasData: false, rows: [], sourceAttempt: null, longWait: false, resultPreview: 0, steps: names.map(name => ({ name, state: 'queued', copy: '尚未开始' })), events: [], snapshots: [] };
        newSnapshot();
        event('用户', '提出业务问题', state.originalQuestion);
        event('用户', '沿用已确认口径', '利润 → 净利润；' + year + ' 年 · 全集团');
        stage(0);
      },
      stop() {
        if (state.phase !== 'running') return false;
        cancel(); state.phase = 'stopped'; state.longWait = false; state.resultPreview = 0;
        state.steps[state.step] = { name: names[state.step], state: 'stopped', copy: '由用户停止，已完成步骤保留' };
        event('用户', '停止执行', '停止于「' + names[state.step] + '」；尚未生成完整结果');
        publish();
        return true;
      },
      retry() {
        if (!['timeout', 'stopped'].includes(state.phase)) return false;
        const index = state.step;
        const stopped = state.phase === 'stopped';
        cancel(); state.attempt += 1; state.resultPreview = 0;
        newSnapshot();
        event('用户', stopped ? '继续执行' : '重试查询', '第 ' + state.attempt + ' 次执行；沿用已确认条件');
        if (index === 2 && state.hasData) event('系统', '沿用已返回的数据', '来自第 ' + state.sourceAttempt + ' 次执行；继续生成结果');
        stage(index);
        return true;
      },
      reviseYear(value) {
        const year = Number(value);
        if (state.phase !== 'empty' || ![2023, 2024].includes(year) || year === state.year) return false;
        const oldYear = state.year;
        cancel(); state.attempt += 1; state.year = year; state.scenario = 'success';
        state.hasData = false; state.rows = []; state.sourceAttempt = null; state.resultPreview = 0;
        state.steps = names.map(name => ({ name, state: 'queued', copy: '尚未开始' }));
        newSnapshot();
        event('用户', '调整统计时间', oldYear + ' 年 → ' + year + ' 年；全集团与净利润口径保留');
        stage(0);
        return true;
      },
      dispose() { cancel(); }
    };
  }

  function createZcfDialogController(root, ownerDocument) {
    const dialogOpeners = new WeakMap();
    function openDialog(dialog) {
      if (!dialog || dialog.open) return;
      dialogOpeners.set(dialog, ownerDocument.activeElement);
      dialog.showModal();
    }
    function closeDialog(dialog) {
      if (!dialog || !dialog.open) return;
      dialog.close();
    }
    root.querySelectorAll('.zcf-dialog').forEach(dialog => {
      let pressOnBackdrop = false;
      const isBackdrop = event => {
        if (event.target !== dialog) return false;
        const box = dialog.getBoundingClientRect();
        return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
      };
      dialog.addEventListener('pointerdown', event => { pressOnBackdrop = isBackdrop(event); });
      dialog.addEventListener('click', event => {
        const outsidePress = pressOnBackdrop;
        pressOnBackdrop = false;
        const closeButton = event.target.closest('[data-zcf-close-dialog]');
        if (closeButton && closeButton.closest('dialog') === dialog) {
          event.preventDefault();
          event.stopPropagation();
          closeDialog(dialog);
        } else if (outsidePress && isBackdrop(event)) closeDialog(dialog);
      });
      dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
      dialog.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        closeDialog(dialog);
      });
      dialog.addEventListener('close', () => {
        pressOnBackdrop = false;
        const opener = dialogOpeners.get(dialog);
        dialogOpeners.delete(dialog);
        // Native close already restores focus. Only supply a fallback when focus is stranded.
        if ((ownerDocument.activeElement === ownerDocument.body || dialog.contains(ownerDocument.activeElement)) && opener?.isConnected && !opener.closest('[hidden]')) opener.focus({ preventScroll: true });
      });
    });
    return { open: openDialog, close: closeDialog };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { createZcfRuntime, createZcfDialogController, rowsFor, total };
  if (typeof document === 'undefined') return;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const check = '<svg class="zcf-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-9"/></svg>';
  document.querySelectorAll('[data-zcf]').forEach(root => {
    if (root.dataset.zcfMounted) return;
    root.dataset.zcfMounted = 'true';
    const find = selector => root.querySelector(selector);
    let activeTab = 'history';
    let selectedAttempt = null;
    let renderedTask = null;
    let latestState;
    const dialogs = createZcfDialogController(root, document);
    const openDialog = dialogs.open;
    const closeDialog = dialogs.close;
    function showTab(name, focus = false) {
      activeTab = name;
      find('[data-zcf-audit]').hidden = false;
      find('[data-zcf-app]').dataset.records = 'open';
      find('[data-zcf-toggle-records]').setAttribute('aria-expanded', 'true');
      root.querySelectorAll('[data-zcf-tab]').forEach(tab => {
        const selected = tab.dataset.zcfTab === name;
        tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
        if (selected && focus) tab.focus();
      });
      root.querySelectorAll('[data-zcf-panel]').forEach(panel => { panel.hidden = panel.dataset.zcfPanel !== name; });
    }
    function selectedSnapshot(state) {
      return state.snapshots.find(item => item.attempt === selectedAttempt) || state.snapshots[state.snapshots.length - 1];
    }
    function renderSnapshot(state) {
      const record = selectedSnapshot(state);
      const select = find('[data-zcf-snapshot-version]');
      select.innerHTML = state.snapshots.map(item => '<option value="' + item.attempt + '">第 ' + item.attempt + ' 次执行 · ' + phaseNames[item.phase] + '</option>').join('');
      select.value = String(record.attempt);
      find('[data-zcf-snapshot-question]').textContent = state.originalQuestion;
      find('[data-zcf-snapshot-range]').innerHTML = record.year + '.01.01—' + record.year + '.12.31<br>全集团 · 按季度汇总';
      find('[data-zcf-snapshot-data]').textContent = record.rows.length ? '4 条季度汇总数据' + (record.sourceAttempt !== record.attempt ? '（沿用第 ' + record.sourceAttempt + ' 次返回）' : '') : record.phase === 'empty' ? '0 条匹配数据' : '尚未返回业务数据';
      find('[data-zcf-snapshot-result]').textContent = record.phase === 'completed' ? '第 ' + record.attempt + ' 次执行的分析结果' : '该次执行尚未生成完整结果';
      find('[data-zcf-snapshot-table]').hidden = record.rows.length === 0;
    }
    function renderDetails(state) {
      const understood = state.steps[0].state === 'done';
      const items = [
        ['检测缺失信息', '时间：' + state.year + ' 年；组织：全集团；指标：利润。'],
        ['搜索业务报表', '匹配「集团经营指标表」中的利润指标。'],
        ['澄清业务报表', '用户已确认净利润口径，后续查询沿用。'],
        ['抽取组织、时间', state.year + '.01.01—' + state.year + '.12.31；按季度汇总。'],
        ['搜索业务组织树', '「全集团」匹配集团汇总范围。'],
        ['澄清组织信息', '当前组织范围唯一，无需再次确认。'],
        ['调取报表数据', state.hasData ? '返回 4 条季度数据；原始表格可查看。' : state.phase === 'empty' ? '返回 0 条匹配数据，需调整查询范围。' : state.steps[1].copy]
      ];
      find('[data-zcf-detail-log]').innerHTML = items.map((item, index) => {
        const done = index < 6 ? understood : state.steps[1].state === 'done';
        return '<li data-done="' + done + '"><p class="zcf-detail-name">' + item[0] + '<span>' + (done ? (index === 5 ? '无需追问' : '已处理') : '未完成') + '</span></p><p class="zcf-detail-copy">' + escape(done || index === 6 ? item[1] : '处理完成后显示确认信息。') + '</p></li>';
      }).join('');
    }
    function feedbackFor(state) {
      const button = (attribute, label, primary = false) => '<button type="button" class="zcf-button' + (primary ? ' zcf-button--primary' : '') + '" ' + attribute + '>' + label + '</button>';
      let title = '', body = '', actions = '', tone = state.phase;
      if (state.phase === 'running') {
        title = state.longWait ? '查询用时较长，仍在读取数据' : '';
        body = state.longWait ? '本次查询已等待超过 10 秒。你可以继续等待，也可以停止，已确认的条件会保留。' : '';
        actions = button('data-zcf-stop', '停止本次执行');
        tone = state.longWait ? 'slow' : 'running';
      } else if (state.phase === 'timeout') {
        title = '查询超时，已保留本次条件';
        body = '数据请求已结束，未返回结果。可以从查询步骤重试，无需重新提问。';
        actions = button('data-zcf-retry', '重试查询步骤', true) + button('data-zcf-show-history', '查看失败记录');
      } else if (state.phase === 'stopped') {
        title = '已停止在「' + state.steps[state.step].name + '」';
        body = '已完成的步骤与确认条件继续保留，本次尚未生成完整分析结果。';
        actions = button('data-zcf-retry', '从此步骤继续', true);
      } else if (state.phase === 'empty') {
        title = state.year + ' 年未查到匹配数据';
        body = '查询已结束，当前范围返回 0 条数据。可调整统计时间后再次查询，原记录会保留。';
        actions = button('data-zcf-adjust-range', '修改查询范围', true) + button('data-zcf-open-snapshot', '核对当前条件');
      } else return '';
      return '<div class="zcf-feedback" data-tone="' + tone + '">' + (title ? '<p class="zcf-feedback-title">' + escape(title) + '</p>' : '') + (body ? '<p class="zcf-feedback-copy">' + escape(body) + '</p>' : '') + '<div class="zcf-feedback-actions">' + actions + '</div></div>';
    }
    function render(state) {
      latestState = state;
      if (renderedTask !== state.id) { selectedAttempt = null; renderedTask = state.id; }
      const status = find('[data-zcf-status]');
      status.textContent = state.longWait ? '查询中 · 用时较长' : phaseNames[state.phase];
      status.dataset.tone = state.phase;
      find('[data-zcf-task-id]').textContent = '任务 ' + state.id;
      find('[data-zcf-question]').textContent = question(state.year);
      find('[data-zcf-year]').textContent = state.year + ' 年';
      find('[data-zcf-audit-meta]').textContent = '同一任务 · ' + state.attempt + ' 次执行';
      find('[data-zcf-steps]').innerHTML = state.steps.map((step, i) => '<li class="zcf-step" data-state="' + step.state + '"><span class="zcf-step-mark" aria-hidden="true">' + (step.state === 'done' ? check : step.state === 'running' ? '' : step.state === 'timeout' ? '!' : step.state === 'stopped' ? 'Ⅱ' : i + 1) + '</span><div><p class="zcf-step-name">' + escape(step.name) + '</p><p class="zcf-step-copy">' + escape(step.copy) + '</p></div><span class="zcf-step-time">' + ({ done: '完成', running: '进行中', timeout: '超时', stopped: '已停止', queued: '待执行' }[step.state]) + '</span></li>').join('');
      renderDetails(state);
      const focusedAction = document.activeElement?.hasAttribute('data-zcf-stop') ? '[data-zcf-stop]' : null;
      find('[data-zcf-feedback]').innerHTML = feedbackFor(state);
      if (focusedAction && find(focusedAction)) find(focusedAction).focus({ preventScroll: true });
      find('[data-zcf-skeleton]').hidden = !(state.phase === 'running' && state.step === 1);
      find('[data-zcf-source]').hidden = !state.hasData;
      find('[data-zcf-source-meta]').textContent = state.year + ' 年 · 4 条季度数据 · 示例';
      const partialResult = state.phase === 'running' && state.step === 2 && state.resultPreview > 0;
      find('[data-zcf-result]').hidden = !(state.phase === 'completed' || partialResult);
      find('[data-zcf-result-title]').textContent = state.year + ' 年集团净利润';
      find('[data-zcf-result-total]').textContent = state.resultPreview < 2 ? '—' : total(state.rows);
      const resultLabel = find('.zcf-result-label');
      resultLabel.dataset.loading = String(state.phase !== 'completed');
      resultLabel.innerHTML = state.phase === 'completed' ? check + '分析结果' : '<svg class="zcf-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-8-8"/></svg>正在生成分析结果';
      find('[data-zcf-chart]').hidden = state.phase !== 'completed';
      find('.zcf-result-footer').hidden = state.phase !== 'completed';
      find('[data-zcf-chart]').setAttribute('aria-label', state.year + ' 年季度净利润示例：' + state.rows.map(row => row.quarter + (row.cents / 100).toFixed(2) + ' 亿元').join('、') + '。合计 ' + total(state.rows) + ' 亿元。');
      find('[data-zcf-bars]').innerHTML = state.rows.map(row => '<div class="zcf-bar" style="--value:' + row.cents / 2 + '%"><span>' + (row.cents / 100).toFixed(2) + '</span></div>').join('');
      find('[data-zcf-result-version]').textContent = '第 ' + state.attempt + ' 次执行 · 已关联查询快照';
      renderSnapshot(state);
      find('[data-zcf-log]').innerHTML = state.events.map(item => '<li class="zcf-log-event" data-tone="' + item.tone + '"><span class="zcf-log-dot" aria-hidden="true"></span><div><p class="zcf-log-meta"><span>' + escape(item.actor) + '</span><time>' + escape(item.time) + '</time></p><p class="zcf-log-title">' + escape(item.title) + '</p><p class="zcf-log-detail">' + escape(item.detail) + '</p></div></li>').join('');
      find('[data-zcf-announcement]').textContent = status.textContent + '。' + state.steps[state.step].copy;
    }
    function openTable(record) {
      if (!record.rows.length) return;
      find('[data-zcf-table-version]').textContent = '第 ' + record.attempt + ' 次执行 · 数据依据';
      find('[data-zcf-table-scope]').textContent = scope(record.year) + ' · 单位：亿元';
      find('[data-zcf-table-caption]').textContent = record.year + ' 年集团季度净利润示例数据';
      find('[data-zcf-table-body]').innerHTML = record.rows.map(row => '<tr><th scope="row">' + record.year + ' ' + row.quarter + '</th><td>全集团</td><td>' + (row.cents / 100).toFixed(2) + '</td></tr>').join('');
      find('[data-zcf-table-total]').textContent = total(record.rows);
      openDialog(find('[data-zcf-table-dialog]'));
    }
    const runtime = createZcfRuntime({ onChange: render });
    render(runtime.getState());
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || !root.contains(button)) return;
      if (button.hasAttribute('data-zcf-start')) { selectedAttempt = null; showTab('history'); runtime.start(find('[data-zcf-scenario]').value); }
      if (button.hasAttribute('data-zcf-stop')) { runtime.stop(); find('[data-zcf-retry]')?.focus(); }
      if (button.hasAttribute('data-zcf-retry')) { selectedAttempt = null; runtime.retry(); find('[data-zcf-stop]')?.focus(); }
      if (button.hasAttribute('data-zcf-show-history')) showTab('history', true);
      if (button.hasAttribute('data-zcf-open-snapshot')) { selectedAttempt = null; renderSnapshot(latestState); showTab('snapshot', true); }
      if (button.hasAttribute('data-zcf-view-table')) openTable(latestState.snapshots[latestState.snapshots.length - 1]);
      if (button.hasAttribute('data-zcf-snapshot-table')) openTable(selectedSnapshot(latestState));
      if (button.hasAttribute('data-zcf-adjust-range')) { find('[data-zcf-range-year]').value = '2024'; openDialog(find('[data-zcf-range-dialog]')); }
      if (button.dataset.zcfTab) showTab(button.dataset.zcfTab);
      if (button.hasAttribute('data-zcf-toggle-records')) {
        const open = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(open));
        find('[data-zcf-audit]').hidden = !open;
        find('[data-zcf-app]').dataset.records = open ? 'open' : 'closed';
      }
    });
    find('[data-zcf-snapshot-version]').addEventListener('change', event => {
      selectedAttempt = Number(event.target.value); renderSnapshot(latestState);
    });
    find('[data-zcf-range-form]').addEventListener('submit', event => {
      event.preventDefault();
      const year = find('[data-zcf-range-year]').value;
      closeDialog(find('[data-zcf-range-dialog]'));
      selectedAttempt = null;
      runtime.reviseYear(year);
      find('[data-zcf-stop]')?.focus();
    });
    root.addEventListener('keydown', event => {
      if (!event.target.matches('[data-zcf-tab]')) return;
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        showTab(event.key === 'Home' ? 'history' : event.key === 'End' ? 'snapshot' : activeTab === 'history' ? 'snapshot' : 'history', true);
      }
    });
    window.addEventListener('pagehide', () => runtime.dispose(), { once: true });
  });
})();

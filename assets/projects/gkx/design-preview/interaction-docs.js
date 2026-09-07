(() => {
  const icon = window.gkxIcon;
  const stateTabs = (states = [
    ['default', '默认'],
    ['loading', '加载'],
    ['empty', '空态'],
    ['error', '错误'],
    ['disabled', '禁用'],
  ]) => `<div class="interaction-state-tabs" role="group" aria-label="切换演示状态">${states.map(([value, label], index) => `<button type="button" class="${index === 0 ? 'active' : ''}" data-preview-action="set-state" data-value="${value}" aria-pressed="${index === 0}">${label}</button>`).join('')}</div>`;

  const notice = '<div class="interaction-notice" data-preview-notice aria-live="polite">当前为可操作演示，内容均为中性演示数据。</div>';

  const liveSelect = ({name = '', placeholder = '请选择', options = [], value = '', required = false, disabled = false, label = '选择选项'} = {}) => {
    const selected = options.find(option => option[0] === value);
    const display = selected?.[1] || placeholder;
    return `<div class="live-select${disabled ? ' is-disabled' : ''}">
      <button class="select-trigger" type="button" data-select-trigger data-value="${value}" data-placeholder="${placeholder}" data-default-value="${value}" data-default-label="${display}" ${required ? 'data-select-required' : ''} ${disabled ? 'disabled' : ''} aria-label="${label}" aria-haspopup="listbox" aria-expanded="false">
        <span data-select-value class="${selected ? '' : 'is-placeholder'}">${display}</span>
        ${icon('chevron-down')}
      </button>
      <div class="select-menu" role="listbox" aria-label="${label}">${options.map(([optionValue, optionLabel]) => `<button class="select-option${optionValue === value ? ' is-selected' : ''}" type="button" role="option" data-value="${optionValue}" aria-selected="${optionValue === value}">${optionLabel}<span class="option-check" aria-hidden="true">${icon('check')}</span></button>`).join('')}</div>
      <input type="hidden" ${name ? `name="${name}"` : ''} data-select-input value="${value}">
    </div>`;
  };

  const liveDatePicker = ({name = '', value = '', required = false, label = '选择日期'} = {}) => {
    const [year, month, day] = value ? value.split('-').map(Number) : [2026, 8, 17];
    const display = value ? `${year}年${month}月${day}日` : '请选择日期';
    return `<div class="live-date-picker" data-view-year="${year}" data-view-month="${month - 1}">
      <button class="date-picker-trigger" type="button" data-date-trigger data-value="${value}" data-default-value="${value}" data-default-label="${display}" ${required ? 'data-date-required' : ''} aria-label="${label}" aria-haspopup="dialog" aria-expanded="false">
        <span data-date-value class="${value ? '' : 'is-placeholder'}">${display}</span>
        ${icon('calendar')}
      </button>
      <div class="date-picker-menu" role="dialog" aria-label="${label}">
        <div class="date-picker-head"><button type="button" data-date-prev aria-label="上一个月">${icon('chevron-left')}</button><strong data-date-title></strong><button type="button" data-date-next aria-label="下一个月">${icon('chevron-right')}</button></div>
        <div class="date-picker-week" aria-hidden="true"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>
        <div class="date-picker-grid" role="grid" data-date-grid></div>
        <div class="date-picker-foot"><button type="button" data-date-today>今天</button><button type="button" data-date-clear>清除</button></div>
      </div>
      <input type="hidden" ${name ? `name="${name}"` : ''} data-date-input value="${value}">
    </div>`;
  };

  const wrap = (id, content, options = {}) => `<div class="interaction-preview" data-interaction-preview data-preview-id="${id}" data-state="default">
    <div class="interaction-toolbar">
      <div><b>${options.title || '实时交互检查'}</b><span>${options.hint || '点击控件，检查状态、反馈与恢复路径。'}</span></div>
      ${options.states === false ? '' : stateTabs(options.states)}
    </div>
    ${notice}
    <div class="interaction-surface" data-interaction-surface>${content}</div>
    <div class="interaction-state-panel" data-state-panel aria-live="polite"></div>
  </div>`;

  const rows = (title) => [
    [`${title}示例 A`, '待处理', '2026-08-17'],
    [`${title}示例 B`, '处理中', '2026-08-16'],
    [`${title}示例 C`, '已完成', '2026-08-15'],
  ].map(([name, status, date], index) => `<tr data-live-row data-search-text="${name}${status}${date}"><td><input type="checkbox" aria-label="选择${name}"></td><td>${name}<small>演示数据</small></td><td><span class="live-status status-${index}">${status}</span></td><td>${date}</td><td><button type="button" class="live-link" data-preview-action="row-detail">查看</button></td></tr>`).join('');

  const pageFrame = (doc, body, options = {}) => wrap(options.id, `<div class="live-page">
    <div class="live-page-head"><div><b>${doc.zh}</b><span>${doc.en} · 可操作示例</span></div><span class="demo-data-label">演示数据</span></div>
    ${body}
  </div>`, {title: '页面状态与任务操作', hint: '切换加载、空态、错误和禁用状态，并完成页面主任务。'});

  const status = (label, tone = 0) => `<span class="live-status status-${tone}">${label}</span>`;
  const panel = (title, body, action = '') => `<section class="archetype-panel"><header><b>${title}</b>${action}</header>${body}</section>`;

  const managementListPage = (id, doc) => pageFrame(doc, `<div class="live-filterbar">
      <label><span>关键词</span><input type="search" placeholder="输入名称或状态" data-preview-search></label>
      <button type="button" class="btn primary" data-preview-action="search">查询</button>
      <button type="button" class="btn default" data-preview-action="clear-search">清空</button>
    </div>
    <div class="live-view-tabs" role="tablist"><button type="button" class="active" data-preview-action="activate" role="tab" aria-selected="true">全部</button><button type="button" data-preview-action="activate" role="tab" aria-selected="false">待处理</button><button type="button" data-preview-action="activate" role="tab" aria-selected="false">已完成</button></div>
    <div class="live-table-wrap"><table class="live-table"><thead><tr><th><input type="checkbox" aria-label="全选"></th><th><button type="button" data-preview-action="sort">名称</button></th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead><tbody>${rows(doc.zh)}</tbody></table></div>
    <div class="live-page-foot"><span data-result-count>共 3 条演示记录</span><button type="button" class="btn default" data-preview-action="load-more">加载更多</button></div>`, {id});

  const workbenchPage = (id, doc) => pageFrame(doc, `<div class="archetype-kpis">
      <button type="button" data-preview-action="select-item" data-title="待我处理" data-copy="12 项任务按优先级排列"><span>待我处理</span><b>12</b><small>其中 3 项即将超时</small></button>
      <button type="button" data-preview-action="select-item" data-title="本周完成" data-copy="已完成 28 项"><span>本周完成</span><b>28</b><small>较上周 +4</small></button>
      <button type="button" data-preview-action="select-item" data-title="待复核" data-copy="5 项需要二次确认"><span>待复核</span><b>5</b><small>需要我确认</small></button>
      <button type="button" data-preview-action="select-item" data-title="风险提醒" data-copy="2 项异常需要关注"><span>风险提醒</span><b>2</b><small>今日新增 1 项</small></button>
    </div>
    <div class="archetype-grid two">
      ${panel('优先待办', `<div class="archetype-task-list" data-selection-list>
        <button type="button" class="active" data-preview-action="select-item" data-title="审核技术报告" data-copy="高优先级 · 今日 16:00 前完成"><span><b>审核技术报告</b><small>报告审核</small></span>${status('即将到期', 1)}</button>
        <button type="button" data-preview-action="select-item" data-title="处理数据异常" data-copy="数据任务 · 需核对上游数据"><span><b>处理数据异常</b><small>数据任务</small></span>${status('待处理', 0)}</button>
        <button type="button" data-preview-action="select-item" data-title="确认成员权限" data-copy="权限变更 · 申请人：李安"><span><b>确认成员权限</b><small>权限申请</small></span>${status('待确认', 0)}</button>
      </div>`, '<button type="button" class="live-link" data-preview-action="trigger-feedback">查看全部</button>')}
      <div class="archetype-stack">
        ${panel('快捷入口', `<div class="archetype-quick-grid"><button type="button" data-preview-action="trigger-feedback">新建报告</button><button type="button" data-preview-action="trigger-feedback">批量导入</button><button type="button" data-preview-action="trigger-feedback">查看数据</button><button type="button" data-preview-action="trigger-feedback">管理成员</button></div>`)}
        ${panel('当前选中', '<div class="archetype-selection"><b data-selection-title>审核技术报告</b><p data-selection-copy>高优先级 · 今日 16:00 前完成</p><button type="button" class="btn primary" data-preview-action="complete-task">开始处理</button></div>')}
      </div>
    </div>`, {id});

  const worklistPage = (id, doc) => pageFrame(doc, `<div class="live-view-tabs" role="tablist"><button type="button" class="active" data-preview-action="activate" role="tab" aria-selected="true">待我处理 8</button><button type="button" data-preview-action="activate" role="tab" aria-selected="false">我已处理 24</button><button type="button" data-preview-action="activate" role="tab" aria-selected="false">抄送给我 5</button></div>
    <div class="archetype-split worklist">
      <section class="archetype-queue" data-selection-list><header><b>任务队列</b><span>8 项</span></header>
        <button type="button" class="active" data-preview-action="select-item" data-title="未来产业报告审核" data-copy="申请人：王宁 · 剩余 2 小时"><b>未来产业报告审核</b><small>报告审核 · 高优先级</small></button>
        <button type="button" data-preview-action="select-item" data-title="企业数据变更" data-copy="申请人：李安 · 明日到期"><b>企业数据变更</b><small>数据校验 · 普通</small></button>
        <button type="button" data-preview-action="select-item" data-title="成员访问申请" data-copy="申请人：陈安 · 后天到期"><b>成员访问申请</b><small>权限申请 · 普通</small></button>
      </section>
      <section class="archetype-detail-pane"><header><div><span>当前任务</span><h3 data-selection-title>未来产业报告审核</h3></div>${status('待处理', 0)}</header><p data-selection-copy>申请人：王宁 · 剩余 2 小时</p><dl class="archetype-description"><div><dt>任务类型</dt><dd>报告审核</dd></div><div><dt>提交时间</dt><dd>2026-08-17 09:30</dd></div><div><dt>当前节点</dt><dd>内容复核</dd></div><div><dt>队列位置</dt><dd>1 / 8</dd></div></dl><label class="live-field"><span>处理意见</span><textarea rows="3" placeholder="输入意见，处理记录将被保留"></textarea></label><div class="live-actions"><button type="button" class="btn default" data-preview-action="trigger-feedback">转交</button><button type="button" class="btn primary" data-preview-action="complete-task">完成并处理下一条</button></div></section>
    </div>`, {id});

  const masterDetailPage = (id, doc) => pageFrame(doc, `<div class="archetype-master-detail">
      <aside><label><span class="sr-only">搜索对象</span><input type="search" placeholder="搜索对象"></label><div data-selection-list><button type="button" class="active" data-preview-action="select-item" data-title="人工智能产业" data-copy="深圳 · 重点关注"><b>人工智能产业</b><small>重点关注</small></button><button type="button" data-preview-action="select-item" data-title="低空经济产业" data-copy="宝安 · 持续跟踪"><b>低空经济产业</b><small>持续跟踪</small></button><button type="button" data-preview-action="select-item" data-title="合成生物产业" data-copy="光明 · 新增对象"><b>合成生物产业</b><small>新增对象</small></button></div></aside>
      <section><header><div><span>当前对象</span><h3 data-selection-title>人工智能产业</h3></div><button type="button" class="btn primary" data-preview-action="edit-detail">编辑信息</button></header><p data-selection-copy>深圳 · 重点关注</p><div class="live-summary"><div><span>企业数</span><b>128</b></div><div><span>研究机构</span><b>36</b></div><div><span>最近更新</span><b>08-17</b></div></div>${panel('最近动态', '<div class="archetype-activity"><p><b>更新产业指标</b><span>10:30</span></p><p><b>新增企业记录</b><span>昨日</span></p><p><b>完成数据复核</b><span>08-15</span></p></div>')}</section>
    </div>`, {id});

  const catalogPage = (id, doc) => pageFrame(doc, `<div class="archetype-catalog">
      <aside><header><b>资源目录</b><button type="button" class="live-link" data-preview-action="trigger-feedback">新建</button></header><div data-selection-list><button type="button" class="active" data-preview-action="select-item" data-title="报告资源" data-copy="6 项资源"><span>报告资源</span><b>6</b></button><button type="button" data-preview-action="select-item" data-title="人才资源" data-copy="12 项资源"><span>人才资源</span><b>12</b></button><button type="button" data-preview-action="select-item" data-title="机构资源" data-copy="8 项资源"><span>机构资源</span><b>8</b></button></div></aside>
      <section><header><div><h3 data-selection-title>报告资源</h3><span data-selection-copy>6 项资源</span></div><div class="archetype-view-switch"><button type="button" class="active" data-preview-action="activate">卡片</button><button type="button" data-preview-action="activate">列表</button></div></header><div class="archetype-resource-grid"><button type="button" data-preview-action="row-detail"><b>技术洞察报告</b><span>报告模板</span><small>更新于 08-17</small></button><button type="button" data-preview-action="row-detail"><b>产业分析报告</b><span>报告模板</span><small>更新于 08-16</small></button><button type="button" data-preview-action="row-detail"><b>专题研究文档</b><span>文档资源</span><small>更新于 08-15</small></button><button type="button" data-preview-action="row-detail"><b>评估指标模板</b><span>数据模板</span><small>更新于 08-14</small></button></div></section>
    </div>`, {id});

  const searchPage = (id, doc) => pageFrame(doc, `<form class="archetype-search-hero" data-preview-search-form><label><span class="sr-only">全文搜索</span><input type="search" value="人工智能" data-preview-search placeholder="输入关键词"></label><button type="button" class="btn primary" data-preview-action="search">搜索</button></form>
    <div class="archetype-search-layout"><aside><b>筛选范围</b><label><input type="checkbox" checked> 报告 <span>18</span></label><label><input type="checkbox" checked> 企业 <span>12</span></label><label><input type="checkbox"> 人才 <span>8</span></label><label><input type="checkbox"> 政策 <span>5</span></label></aside><section><header><b data-result-count>找到 3 条演示结果</b><button type="button" class="live-link" data-preview-action="clear-search">清除条件</button></header><article data-live-row data-search-text="人工智能产业技术洞察报告"><button type="button" data-preview-action="row-detail"><b>人工智能产业技术洞察报告</b></button><p>系统检索到与“人工智能”相关的技术路线、应用场景和产业动态。</p><small>报告 · 更新于 2026-08-17</small></article><article data-live-row data-search-text="人工智能企业目录"><button type="button" data-preview-action="row-detail"><b>人工智能企业目录</b></button><p>收录相关企业的基本信息、技术方向和所属区域。</p><small>企业 · 更新于 2026-08-16</small></article><article data-live-row data-search-text="人工智能发展指标"><button type="button" data-preview-action="row-detail"><b>人工智能发展指标</b></button><p>用于演示检索结果分组、来源与命中摘要。</p><small>数据 · 更新于 2026-08-15</small></article></section></div>`, {id});

  const formPage = (id, doc) => pageFrame(doc, `<form class="live-form" data-preview-form novalidate>
      <div class="live-form-grid"><label><span>名称 <em>*</em></span><input name="name" required placeholder="请输入名称"></label><div class="live-field"><span>类型 <em>*</em></span>${liveSelect({name:'type',required:true,label:'选择类型',options:[['standard','标准类型'],['extended','扩展类型']]})}</div><label><span>负责人</span><input name="owner" placeholder="请输入负责人"></label><div class="live-field"><span>生效日期</span>${liveDatePicker({name:'date',value:'2026-08-17',label:'选择生效日期'})}</div></div>
      <label class="live-form-wide"><span>说明</span><textarea name="description" rows="3" placeholder="请输入必要说明，最多 200 字" maxlength="200"></textarea></label>
      <p class="live-field-error" data-form-error role="alert"></p>
      <div class="live-actions"><button type="button" class="btn default" data-preview-action="reset-form">重置</button><button type="submit" class="btn primary">${id.includes('wizard') || id.includes('import') ? '下一步' : '保存'}</button></div>
    </form>`, {id});

  const wizardPage = (id, doc) => pageFrame(doc, `<div class="archetype-flow" data-flow data-step="1"><ol><li class="active">基本信息</li><li>配置范围</li><li>确认提交</li></ol><section><div data-flow-panel><h3>基本信息</h3><p>完成当前步骤必需的信息，后续步骤可返回修改。</p><div class="live-form-grid"><label><span>名称 *</span><input value="演示任务"></label><label><span>负责人</span><input value="李安"></label></div></div><div class="live-actions"><button type="button" class="btn default" data-preview-action="flow-prev" disabled>上一步</button><button type="button" class="btn primary" data-preview-action="flow-next">下一步</button></div></section></div>`, {id});

  const importPage = (id, doc) => pageFrame(doc, `<div class="archetype-flow import" data-flow data-step="1"><ol><li class="active">上传文件</li><li>字段映射</li><li>数据校验</li><li>导入结果</li></ol><section><div data-flow-panel><h3>上传数据文件</h3><p>支持 XLSX、CSV；演示页仅显示文件名，不上传内容。</p><div class="live-upload"><input type="file" id="pageImportFile" data-preview-upload accept=".xlsx,.csv"><label for="pageImportFile" class="btn default">选择文件</label><span data-upload-name>尚未选择文件</span></div></div><div class="archetype-import-summary"><span>新增 <b>0</b></span><span>更新 <b>0</b></span><span>跳过 <b>0</b></span><span>错误 <b>0</b></span></div><div class="live-actions"><button type="button" class="btn default" data-preview-action="flow-prev" disabled>上一步</button><button type="button" class="btn primary" data-preview-action="flow-next">下一步</button></div></section></div>`, {id});

  const editorPage = (id, doc) => pageFrame(doc, `<div class="archetype-editor">
      <aside class="editor-outline">
        <header><b>文档结构</b><span>3 个章节</span></header>
        <nav data-selection-list aria-label="演示文档章节">
          <button type="button" class="active" data-preview-action="select-item" data-title="摘要" data-copy="概括文档目标、范围与主要结论"><span>摘要</span><small>概览</small></button>
          <button type="button" data-preview-action="select-item" data-title="技术趋势" data-copy="整理关键技术方向与阶段性变化"><span>技术趋势</span><small>正文</small></button>
          <button type="button" data-preview-action="select-item" data-title="产业建议" data-copy="记录基于现有材料形成的建议"><span>产业建议</span><small>正文</small></button>
        </nav>
      </aside>
      <section class="editor-workspace">
        <div class="archetype-editor-tools" role="toolbar" aria-label="正文格式工具">
          <div class="editor-tool-group">
            <button type="button" class="editor-tool" data-preview-action="editor-command" data-tooltip="加粗" aria-label="加粗" aria-pressed="false"><b>B</b></button>
            <button type="button" class="editor-tool" data-preview-action="editor-command" data-tooltip="斜体" aria-label="斜体" aria-pressed="false"><i>I</i></button>
          </div>
          <div class="editor-tool-group">
            <button type="button" class="editor-tool wide" data-preview-action="editor-command" data-tooltip="切换为标题" aria-label="切换为标题" aria-pressed="false">标题</button>
            <button type="button" class="editor-tool wide" data-preview-action="editor-command" data-tooltip="切换为列表" aria-label="切换为列表" aria-pressed="false">列表</button>
          </div>
          <span class="editor-tool-spacer"></span>
          <span class="editor-save-copy" data-editor-save-state>所有更改已保存</span>
          <button type="button" class="editor-mode-button" data-preview-action="editor-mode" aria-pressed="false">预览</button>
        </div>
        <div class="archetype-editor-paper">
          <header><h3 data-selection-title>摘要</h3><p data-selection-copy>概括文档目标、范围与主要结论</p></header>
          <textarea aria-label="文档正文" rows="10">这里是可编辑的演示正文，用于检查阅读宽度、正文颜色和段落节奏。

编辑区以正文为主，目录和属性只提供上下文；工具栏、保存状态与预览入口保持清晰但不过度抢眼。</textarea>
          <div class="editor-preview-body" aria-live="polite"></div>
        </div>
      </section>
      <aside class="archetype-properties">
        <header><b>文档属性</b><span>辅助信息</span></header>
        <dl>
          <div><dt>状态</dt><dd><span class="live-status status-0">草稿</span></dd></div>
          <div><dt>最近保存</dt><dd data-editor-saved-time>今天 10:30</dd></div>
          <div><dt>可见范围</dt><dd>项目成员</dd></div>
        </dl>
        <p class="editor-property-note">演示信息仅用于验证层级，不作为实际页面字段来源。</p>
        <button type="button" class="btn primary" data-preview-action="editor-save">保存草稿</button>
      </aside>
    </div>`, {id});

  const builderPage = (id, doc) => pageFrame(doc, `<div class="archetype-builder"><aside><b>组件库</b><button type="button" data-preview-action="builder-add" data-node="文本输入">文本输入</button><button type="button" data-preview-action="builder-add" data-node="下拉选择">下拉选择</button><button type="button" data-preview-action="builder-add" data-node="审核节点">审核节点</button><button type="button" data-preview-action="builder-add" data-node="结束节点">结束节点</button></aside><section class="archetype-canvas"><header><span>画布 100%</span><div><button type="button" data-preview-action="trigger-feedback">撤销</button><button type="button" data-preview-action="trigger-feedback">重做</button></div></header><div data-builder-canvas><button type="button" class="builder-live-node active" data-preview-action="select-item" data-title="开始节点" data-copy="流程的唯一入口">开始节点</button><button type="button" class="builder-live-node" data-preview-action="select-item" data-title="审核节点" data-copy="由负责人完成审核">审核节点</button></div></section><aside class="archetype-properties"><b>属性面板</b><label><span>节点名称</span><input data-selection-title value="开始节点"></label><p data-selection-copy>流程的唯一入口</p><button type="button" class="btn primary" data-preview-action="trigger-feedback">保存属性</button></aside></div>`, {id});

  const detailPage = (id, doc) => pageFrame(doc, `<div class="live-summary"><div><span>对象名称</span><b>${doc.zh}演示对象</b></div><div><span>当前状态</span><b class="live-status status-1">处理中</b></div><div><span>最近更新</span><b>2026-08-17 10:30</b></div></div>
    <div class="live-view-tabs" role="tablist"><button type="button" class="active" data-preview-action="activate" role="tab" aria-selected="true">基本信息</button><button type="button" data-preview-action="activate" role="tab" aria-selected="false">关联内容</button><button type="button" data-preview-action="activate" role="tab" aria-selected="false">操作记录</button></div>
    <div class="live-detail-copy"><h3>信息说明</h3><p>这里展示经过确认的对象信息。长文本自然换行，工具栏和关键标签保持单行可辨识。</p><dl><div><dt>来源</dt><dd>中性演示数据</dd></div><div><dt>可见范围</dt><dd>当前项目成员</dd></div><div><dt>更新时间</dt><dd>2026-08-17</dd></div></dl></div>
    <div class="live-actions"><button type="button" class="btn default" data-preview-action="trigger-feedback">复制链接</button><button type="button" class="btn primary" data-preview-action="edit-detail">编辑信息</button></div>`, {id});

  const comparePage = (id, doc) => pageFrame(doc, `<div class="archetype-compare-tools"><label><input type="checkbox" data-preview-action="toggle-differences"> 只看差异</label><button type="button" class="btn default" data-preview-action="trigger-feedback">导出对比</button></div><div class="archetype-compare" data-compare><div class="head"><b>对比维度</b><b>对象 A</b><b>对象 B</b><b>对象 C</b></div><div class="same"><span>所属类型</span><span>产业报告</span><span>产业报告</span><span>产业报告</span></div><div class="diff"><span>研究范围</span><b>全国</b><b>粤港澳大湾区</b><b>深圳</b></div><div class="same"><span>更新周期</span><span>月度</span><span>月度</span><span>月度</span></div><div class="diff"><span>数据来源</span><b>12 个</b><b>8 个</b><b>15 个</b></div><div class="diff"><span>当前状态</span><span>${status('已完成',2)}</span><span>${status('处理中',1)}</span><span>${status('待更新',0)}</span></div></div>`, {id});

  const documentPage = (id, doc) => pageFrame(doc, `<div class="archetype-reader"><aside><b>文档目录</b><div data-selection-list><button type="button" class="active" data-preview-action="document-section" data-title="研究摘要" data-copy="文档第一章">研究摘要</button><button type="button" data-preview-action="document-section" data-title="技术趋势" data-copy="文档第二章">技术趋势</button><button type="button" data-preview-action="document-section" data-title="产业建议" data-copy="文档第三章">产业建议</button></div></aside><article><header><h2 data-selection-title>研究摘要</h2><span data-selection-copy>文档第一章</span></header><p>这里展示连续阅读的长文内容。正文保持合适的阅读宽度，不使用表格的单行省略规则。</p><p>切换目录后保留阅读上下文，下载、引用和打印能力仅在实际需求存在时出现。</p><h3>关键结论</h3><p>演示内容只用于核对阅读结构、目录定位与辅助信息的关系。</p></article><aside class="archetype-reader-meta"><b>文档信息</b><span>来源：演示资料</span><span>更新：2026-08-17</span><button type="button" class="btn default" data-preview-action="trigger-feedback">复制引用</button></aside></div>`, {id});

  const graphPage = (id, doc) => pageFrame(doc, `<div class="archetype-graph"><div class="archetype-graph-tools"><button type="button" data-preview-action="canvas-zoom" data-factor="1.1">放大</button><button type="button" data-preview-action="canvas-zoom" data-factor="0.9">缩小</button><button type="button" data-preview-action="canvas-reset">重置</button></div><div class="archetype-network" data-canvas><svg viewBox="0 0 720 320" aria-hidden="true"><path d="M120 150 L285 80 L470 135 L610 70 M285 80 L350 245 L565 245 M120 150 L350 245"/></svg><button type="button" style="--x:12%;--y:45%" class="large active" data-preview-action="select-item" data-title="人工智能" data-copy="中心主题 · 6 条关联">人工智能</button><button type="button" style="--x:35%;--y:19%" data-preview-action="select-item" data-title="机器学习" data-copy="技术分支 · 3 条关联">机器学习</button><button type="button" style="--x:61%;--y:38%" class="large" data-preview-action="select-item" data-title="工业应用" data-copy="应用领域 · 4 条关联">工业应用</button><button type="button" style="--x:81%;--y:15%" data-preview-action="select-item" data-title="视觉检测" data-copy="应用场景 · 2 条关联">视觉检测</button><button type="button" style="--x:45%;--y:75%" data-preview-action="select-item" data-title="大模型" data-copy="技术分支 · 5 条关联">大模型</button><button type="button" style="--x:74%;--y:75%" data-preview-action="select-item" data-title="知识库" data-copy="数据资产 · 2 条关联">知识库</button></div><aside><span>当前节点</span><h3 data-selection-title>人工智能</h3><p data-selection-copy>中心主题 · 6 条关联</p><button type="button" class="btn primary" data-preview-action="row-detail">查看详情</button></aside></div>`, {id});

  const approvalPage = (id, doc) => pageFrame(doc, `<div class="archetype-approval"><section><div class="live-view-tabs"><button type="button" class="active" data-preview-action="activate">待审核 6</button><button type="button" data-preview-action="activate">已处理 18</button></div><div class="archetype-queue" data-selection-list><button type="button" class="active" data-preview-action="select-item" data-title="技术报告发布审核" data-copy="申请人：王宁"><b>技术报告发布审核</b><small>提交于 10:20</small></button><button type="button" data-preview-action="select-item" data-title="企业信息变更审核" data-copy="申请人：李安"><b>企业信息变更审核</b><small>提交于 09:45</small></button></div></section><aside><header><div><span>审核材料</span><h3 data-selection-title>技术报告发布审核</h3></div>${status('待审核',0)}</header><p data-selection-copy>申请人：王宁</p><div class="archetype-evidence"><b>提交说明</b><p>材料已完成初审，请核对报告范围与发布时间。</p><button type="button" class="live-link" data-preview-action="row-detail">查看完整材料</button></div><label class="live-field"><span>审核意见</span><textarea rows="3" placeholder="驳回时必须填写原因"></textarea></label><div class="archetype-timeline"><p><i></i><span>王宁提交申请</span><small>10:20</small></p><p><i></i><span>系统完成材料校验</span><small>10:21</small></p></div><div class="live-actions"><button type="button" class="btn default" data-preview-action="review-reject">驳回</button><button type="button" class="btn primary" data-preview-action="review-approve">通过并处理下一条</button></div></aside></div>`, {id});

  const workflowPage = (id, doc) => pageFrame(doc, `<div class="archetype-workflow"><section class="archetype-canvas"><header><div><button type="button" class="btn default" data-preview-action="workflow-add">添加节点</button><button type="button" class="live-link" data-preview-action="canvas-reset">重置视图</button></div><span>草稿已保存</span></header><div data-builder-canvas class="workflow-live-canvas"><button type="button" class="builder-live-node start active" data-preview-action="select-item" data-title="开始" data-copy="流程唯一入口">开始</button><i></i><button type="button" class="builder-live-node" data-preview-action="select-item" data-title="内容审核" data-copy="审核人：内容负责人">内容审核</button><i></i><button type="button" class="builder-live-node end" data-preview-action="select-item" data-title="完成" data-copy="流程正常结束">完成</button></div></section><aside class="archetype-properties"><b>节点配置</b><label><span>节点名称</span><input data-selection-title value="开始"></label><p data-selection-copy>流程唯一入口</p><label class="live-choice"><input type="checkbox" checked> 保留操作记录</label><div class="live-actions"><button type="button" class="btn default" data-preview-action="validate">校验</button><button type="button" class="btn primary" data-preview-action="open-publish">保存并发布</button></div></aside></div>`, {id});

  const settingsPage = (id, doc) => pageFrame(doc, `<div class="archetype-settings"><aside data-selection-list><button type="button" class="active" data-preview-action="select-item" data-title="基础设置" data-copy="管理系统基础参数">基础设置</button><button type="button" data-preview-action="select-item" data-title="通知设置" data-copy="管理消息与告警通知">通知设置</button><button type="button" data-preview-action="select-item" data-title="数据设置" data-copy="管理数据更新与保留周期">数据设置</button><button type="button" class="danger" data-preview-action="select-item" data-title="危险设置" data-copy="高风险配置单独分区">危险设置</button></aside><form data-preview-form class="live-form"><header><div><h3 data-selection-title>基础设置</h3><p data-selection-copy>管理系统基础参数</p></div><span>作用域：当前项目</span></header><div class="live-form-grid"><label><span>系统名称</span><input value="演示管理系统"></label><div class="live-field"><span>默认语言</span>${liveSelect({name:'locale',value:'zh',label:'默认语言',options:[['zh','简体中文'],['en','English']]})}</div><label><span>数据保留天数</span><input type="number" value="90"></label><label class="choice-line"><input type="checkbox" checked> 启用操作日志</label></div><div class="live-actions"><button type="button" class="btn default" data-preview-action="reset-form">恢复默认</button><button type="submit" class="btn primary">保存设置</button></div></form></div>`, {id});

  const permissionPage = (id, doc) => pageFrame(doc, `<div class="archetype-permission"><aside data-selection-list><header><b>角色</b><button type="button" class="live-link" data-preview-action="trigger-feedback">新建</button></header><button type="button" class="active" data-preview-action="select-item" data-title="内容管理员" data-copy="12 项权限">内容管理员</button><button type="button" data-preview-action="select-item" data-title="数据分析员" data-copy="8 项权限">数据分析员</button><button type="button" data-preview-action="select-item" data-title="只读成员" data-copy="4 项权限">只读成员</button></aside><section><header><div><h3 data-selection-title>内容管理员</h3><span data-selection-copy>12 项权限</span></div><button type="button" class="btn default" data-preview-action="trigger-feedback">复制角色权限</button></header><div class="live-view-tabs"><button type="button" class="active" data-preview-action="activate">页面权限</button><button type="button" data-preview-action="activate">资源权限</button></div><div class="archetype-permission-tree"><div class="head"><b>功能节点</b><span>查看</span><span>编辑</span><span>删除</span></div><label><b>报告管理</b><input type="checkbox" checked><input type="checkbox" checked><input type="checkbox"></label><label class="child"><b>报告列表</b><input type="checkbox" checked><input type="checkbox" checked><input type="checkbox"></label><label class="child"><b>报告审核</b><input type="checkbox" checked><input type="checkbox" checked><input type="checkbox" checked></label><label><b>系统设置</b><input type="checkbox" checked><input type="checkbox"><input type="checkbox"></label></div><div class="live-actions"><span>已修改 2 项</span><button type="button" class="btn primary" data-preview-action="trigger-feedback">保存权限</button></div></section></div>`, {id});

  const chart = (title = '趋势变化') => `<div class="live-chart" aria-label="${title}"><div class="live-chart-head"><b>${title}</b><span data-range-label>近 7 天</span></div><div class="live-bars">${[48,68,54,82,64,76,92].map((height, index) => `<button type="button" style="--bar:${height}%" data-preview-action="chart-point" data-value="${height}" aria-label="第 ${index + 1} 天，${height}"></button>`).join('')}</div><div class="live-chart-tip" data-chart-tip>选择柱形查看具体值</div></div>`;
  const range = () => `<div class="live-range" role="group" aria-label="时间范围"><button type="button" class="active" data-preview-action="change-range" data-factor="1">近 7 天</button><button type="button" data-preview-action="change-range" data-factor="1.18">近 30 天</button><button type="button" data-preview-action="change-range" data-factor="1.36">近 90 天</button></div>`;
  const dashboardPage = (id, doc) => pageFrame(doc, `<div class="archetype-dashboard-head"><div><b>整体运行概览</b><span>更新于 10:30</span></div>${range()}</div><div class="live-kpis four"><button type="button" data-preview-action="select-item"><span>事件总量</span><b data-metric data-base="1286">1,286</b><small>较上期 +8.2%</small></button><button type="button" data-preview-action="select-item"><span>活跃用户</span><b data-metric data-base="438">438</b><small>较上期 +4.1%</small></button><button type="button" data-preview-action="select-item"><span>完成率</span><b data-percent data-base="82.4">82.4%</b><small>口径可查看</small></button><button type="button" data-preview-action="select-item"><span>异常任务</span><b data-metric data-base="12">12</b><small>3 项高优先级</small></button></div><div class="archetype-grid two">${chart('事件趋势')}${chart('任务完成情况')}</div>${panel('异常明细', `<div class="live-table-wrap"><table class="live-table"><thead><tr><th>异常项</th><th>级别</th><th>更新时间</th><th>操作</th></tr></thead><tbody><tr><td>数据更新超时</td><td>${status('高',3)}</td><td>10:20</td><td><button class="live-link" data-preview-action="row-detail">查看</button></td></tr><tr><td>审核队列积压</td><td>${status('中',1)}</td><td>09:45</td><td><button class="live-link" data-preview-action="row-detail">查看</button></td></tr></tbody></table></div>`)}`, {id});

  const analysisPage = (id, doc) => pageFrame(doc, `<div class="live-filterbar"><label><span>分析主题</span><input value="用户任务处理"></label><div class="live-field"><span>区域</span>${liveSelect({value:'all',label:'选择区域',options:[['all','全部区域'],['sz','深圳']]})}</div><button type="button" class="btn primary" data-preview-action="trigger-feedback">应用分析</button></div><div class="archetype-analysis"><section>${chart('任务流转分布')}</section><aside><span>当前筛选</span><b>全部区域</b><p>已应用 2 个条件</p><div class="live-summary"><div><span>平均时长</span><b>2.6h</b></div><div><span>超时率</span><b>4.8%</b></div><div><span>样本数</span><b>1,286</b></div></div></aside></div>${panel('明细数据', `<div class="live-table-wrap"><table class="live-table"><thead><tr><th>任务类型</th><th>数量</th><th>平均时长</th><th>超时率</th></tr></thead><tbody><tr><td>报告审核</td><td>438</td><td>3.2h</td><td>5.1%</td></tr><tr><td>数据复核</td><td>326</td><td>1.8h</td><td>3.6%</td></tr></tbody></table></div>`)}`, {id});

  const bigscreenPage = (id, doc) => pageFrame(doc, `<div class="archetype-wallboard"><header><div><b>系统运行监控</b><span>演示大屏</span></div><span>${status('连接正常',2)} · 10:30:18</span></header><div class="archetype-wallboard-grid"><section><div class="wallboard-metric"><span>实时任务</span><b>1,286</b></div>${chart('处理趋势')}</section><main><div class="wallboard-core"><span>当前处理率</span><b>82.4%</b><small>每 30 秒更新</small></div></main><section><div class="wallboard-alert"><b>异常监控</b><p>${status('高',3)} 数据更新超时</p><p>${status('中',1)} 审核队列积压</p></div>${chart('告警分布')}</section></div></div>`, {id});

  const mapPage = (id, doc) => pageFrame(doc, `<div class="archetype-map"><div class="archetype-map-tools"><button type="button" data-preview-action="canvas-zoom" data-factor="1.1">放大</button><button type="button" data-preview-action="canvas-zoom" data-factor="0.9">缩小</button><button type="button" data-preview-action="canvas-reset">定位全部</button></div><div class="archetype-map-layers"><b>图层</b><label><input type="checkbox" checked> 重点企业</label><label><input type="checkbox" checked> 科研机构</label><label><input type="checkbox"> 风险告警</label></div><div class="archetype-map-canvas" data-canvas><button type="button" style="--x:22%;--y:35%" data-preview-action="select-item" data-title="南山区" data-copy="42 家企业 · 12 家机构"><span>42</span></button><button type="button" style="--x:54%;--y:58%" data-preview-action="select-item" data-title="福田区" data-copy="28 家企业 · 9 家机构"><span>28</span></button><button type="button" style="--x:72%;--y:28%" data-preview-action="select-item" data-title="龙岗区" data-copy="36 家企业 · 8 家机构"><span>36</span></button><button type="button" style="--x:38%;--y:76%" data-preview-action="select-item" data-title="宝安区" data-copy="31 家企业 · 6 家机构"><span>31</span></button></div><aside><span>选中区域</span><h3 data-selection-title>南山区</h3><p data-selection-copy>42 家企业 · 12 家机构</p><div class="archetype-map-legend"><span><i class="blue"></i>重点企业</span><span><i class="orange"></i>科研机构</span></div><button type="button" class="btn primary" data-preview-action="row-detail">查看区域明细</button></aside></div>`, {id});

  const aiChatPage = (id, doc) => pageFrame(doc, `<div class="archetype-ai-chat"><aside><button type="button" class="btn primary" data-preview-action="trigger-feedback">新建对话</button><div data-selection-list><button type="button" class="active" data-preview-action="select-item" data-title="产业趋势分析" data-copy="今天 10:20">产业趋势分析</button><button type="button" data-preview-action="select-item" data-title="报告摘要整理" data-copy="昨天">报告摘要整理</button></div></aside><section><header><div><b data-selection-title>产业趋势分析</b><span data-selection-copy>今天 10:20</span></div><span>已启用引用追踪</span></header><div class="live-chat"><div class="live-chat-stream" data-chat-stream><article class="user"><b>你</b><p>请总结演示资料中的主要趋势。</p></article><article class="assistant"><b>系统助手</b><p>当前回答仅用于演示消息流、引用和恢复路径，不作为业务结论。</p><a href="#usage">来源 1：交互规则</a></article></div><form data-chat-form><label><span class="sr-only">输入问题</span><textarea rows="2" placeholder="输入问题" required></textarea></label><button type="submit" class="btn primary">发送</button></form></div></section></div>`, {id});

  const copilotPage = (id, doc) => pageFrame(doc, `<div class="archetype-copilot"><section><div class="live-filterbar"><label><span>关键词</span><input value="待审核"></label><button type="button" class="btn primary">查询</button></div><div class="live-table-wrap"><table class="live-table"><thead><tr><th>名称</th><th>状态</th><th>负责人</th></tr></thead><tbody><tr><td>技术报告 A</td><td>${status('待审核',0)}</td><td>李安</td></tr><tr><td>技术报告 B</td><td>${status('处理中',1)}</td><td>王宁</td></tr></tbody></table></div></section><aside><header><div><b>AI 辅助面板</b><span>当前对象：技术报告 A</span></div><button type="button" data-preview-action="trigger-feedback" aria-label="关闭 AI 面板">关闭</button></header><article><b>审核建议</b><p>建议检查报告的数据来源和更新时间。应用前可预览影响。</p><button type="button" class="btn default" data-preview-action="apply-suggestion">预览并应用</button></article><div class="archetype-suggestions"><button type="button" data-preview-action="apply-suggestion">生成摘要草稿</button><button type="button" data-preview-action="apply-suggestion">检查引用来源</button><button type="button" data-preview-action="apply-suggestion">列出待确认项</button></div><p data-copilot-result>尚未应用建议。</p></aside></div>`, {id});

  const knowledgePage = (id, doc) => pageFrame(doc, `<div class="archetype-knowledge"><aside data-selection-list><header><b>知识库</b><button type="button" class="live-link" data-preview-action="trigger-feedback">新建</button></header><button type="button" class="active" data-preview-action="select-item" data-title="产业研究库" data-copy="24 份文档">产业研究库</button><button type="button" data-preview-action="select-item" data-title="政策文件库" data-copy="18 份文档">政策文件库</button></aside><section><header><div><h3 data-selection-title>产业研究库</h3><span data-selection-copy>24 份文档</span></div><button type="button" class="btn primary" data-preview-action="trigger-feedback">上传文档</button></header><div class="live-table-wrap"><table class="live-table"><thead><tr><th>文档</th><th>解析</th><th>切片</th><th>索引</th></tr></thead><tbody><tr><td>技术趋势报告.pdf</td><td>${status('完成',2)}</td><td>128</td><td>${status('可用',2)}</td></tr><tr><td>产业指标.xlsx</td><td>${status('处理中',1)}</td><td>--</td><td>${status('待处理',0)}</td></tr></tbody></table></div></section><aside class="archetype-rag-test"><b>检索测试</b><label><span class="sr-only">测试问题</span><textarea rows="3" placeholder="输入检索问题">主要技术趋势是什么？</textarea></label><button type="button" class="btn primary" data-preview-action="run-retrieval">测试检索</button><article data-retrieval-result><b>尚未执行</b><p>结果将显示命中片段、相似度和原文入口。</p></article></aside></div>`, {id});

  const collaborationPage = (id, doc) => pageFrame(doc, `<div class="archetype-collab-head"><div><b>产业研究项目</b><span>成员 6 人 · 本周 12 项任务</span></div><div class="live-view-tabs"><button type="button" class="active" data-preview-action="activate">看板</button><button type="button" data-preview-action="activate">列表</button><button type="button" data-preview-action="activate">时间线</button></div></div><div class="live-board"><section><h3>待处理 <span>2</span></h3><article data-task-card><b>整理技术趋势</b><p>负责人：李明 · 今天</p><button type="button" data-preview-action="move-task">移至处理中</button></article><article data-task-card><b>核对企业名单</b><p>负责人：王宁 · 明天</p><button type="button" data-preview-action="move-task">移至处理中</button></article></section><section data-task-target><h3>处理中 <span data-task-count>1</span></h3><article><b>编写报告摘要</b><p>负责人：陈安 · 今天</p></article></section><section><h3>已完成 <span>1</span></h3><article><b>完成资料归档</b><p>完成于 2026-08-16</p></article></section></div>`, {id});

  const notificationPage = (id, doc) => pageFrame(doc, `<div class="archetype-notifications"><aside><button type="button" class="active" data-preview-action="activate">全部消息 <b>6</b></button><button type="button" data-preview-action="activate">任务提醒 <b>3</b></button><button type="button" data-preview-action="activate">系统消息 <b>2</b></button><button type="button" data-preview-action="activate">风险告警 <b>1</b></button></aside><section><header><b>消息通知</b><button type="button" class="live-link" data-preview-action="mark-all-read">全部标记已读</button></header><article class="unread"><i></i><div><b>你有一条报告审核任务</b><p>“未来产业技术洞察”等待处理。</p><small>10 分钟前 · 任务提醒</small></div><button type="button" data-preview-action="mark-read">查看任务</button></article><article class="unread"><i></i><div><b>数据校验已完成</b><p>本次导入新增 128 条，跳过 3 条。</p><small>1 小时前 · 系统消息</small></div><button type="button" data-preview-action="mark-read">查看结果</button></article><article><i></i><div><b>成员权限已更新</b><p>李安的项目访问权限已生效。</p><small>昨天 · 系统消息</small></div><button type="button" data-preview-action="row-detail">查看对象</button></article></section></div>`, {id});

  const systemPage = (id, doc) => {
    if (id === 'page-state') return pageFrame(doc, `<div class="live-state-choices"><button type="button" data-preview-action="set-state" data-value="empty">查看空态</button><button type="button" data-preview-action="set-state" data-value="error">查看错误</button><button type="button" data-preview-action="set-state" data-value="disabled">查看无权限</button><button type="button" data-preview-action="set-state" data-value="default">恢复正常</button></div><div class="live-normal-state"><b>系统运行正常</b><p>选择上方状态，检查原因说明、恢复操作和上下文保留方式。</p></div>`, {id});
    if (id === 'page-onboarding') return pageFrame(doc, `<div class="live-setup"><ol><li class="active">组织信息</li><li>成员邀请</li><li>完成设置</li></ol><form data-step-form><div class="live-step" data-step="1"><label><span>组织名称 *</span><input required value="演示组织"></label><div class="live-field"><span>工作场景</span>${liveSelect({name:'scene',value:'admin',label:'选择工作场景',options:[['admin','后台管理'],['analytics','数据分析']]})}</div></div><div class="live-actions"><button type="button" class="btn default" data-preview-action="prev-step" disabled>上一步</button><button type="button" class="btn primary" data-preview-action="next-step">下一步</button></div></form></div>`, {id});
    return pageFrame(doc, `<form class="live-login" data-preview-form novalidate><label><span>账号</span><input required autocomplete="username" placeholder="请输入账号"></label><label><span>密码</span><input required type="password" autocomplete="current-password" placeholder="请输入密码"></label><p class="live-field-error" data-form-error role="alert"></p><button type="submit" class="btn primary">登录</button><button type="button" class="live-link" data-preview-action="trigger-feedback">联系管理员</button></form>`, {id});
  };

  const overviewPage = (id, doc) => id === 'table-types'
    ? wrap(id, `<div class="live-view-tabs" role="tablist"><button type="button" class="active" data-preview-action="activate">标准表格</button><button type="button" data-preview-action="activate">树形表格</button><button type="button" data-preview-action="activate">矩阵表格</button></div><div class="live-table-wrap"><table class="live-table"><thead><tr><th>名称</th><th>适用场景</th><th>密度</th><th>状态</th></tr></thead><tbody><tr><td>标准表格</td><td>常规管理列表</td><td>40px</td><td><span class="live-status status-2">推荐</span></td></tr><tr><td>树形表格</td><td>真实层级数据</td><td>40px</td><td>按需</td></tr><tr><td>矩阵表格</td><td>权限或交叉维度</td><td>40px</td><td>按需</td></tr></tbody></table></div>`, {title: '表格类型切换', hint: '切换类型并检查表头、密度和状态表达。', states: false})
    : wrap(id, `<div class="live-archetypes"><a href="./index.html?id=page-list" data-preview-action="navigate-page"><b>管理列表</b><span>筛选、操作、表格、分页</span><small>打开页面</small></a><a href="./index.html?id=page-form" data-preview-action="navigate-page"><b>表单编辑</b><span>分组字段、校验、提交</span><small>打开页面</small></a><a href="./index.html?id=page-analysis" data-preview-action="navigate-page"><b>数据分析</b><span>指标、图表、明细</span><small>打开页面</small></a><a href="./index.html?id=page-worklist" data-preview-action="navigate-page"><b>任务工作台</b><span>队列、详情、处理动作</span><small>打开页面</small></a></div>`, {title: '页面类型选择', hint: '点击典型骨架进入具体页面；完整 31 个入口位于下方结构参考。', states: false});

  const pageRenderers = {
    'page-workbench': workbenchPage,
    'page-list': managementListPage,
    'page-worklist': worklistPage,
    'page-master-detail': masterDetailPage,
    'page-catalog': catalogPage,
    'page-search': searchPage,
    'page-form': formPage,
    'page-wizard': wizardPage,
    'page-import': importPage,
    'page-editor': editorPage,
    'page-builder': builderPage,
    'page-detail': detailPage,
    'page-compare': comparePage,
    'page-document': documentPage,
    'page-graph': graphPage,
    'page-approval': approvalPage,
    'page-workflow': workflowPage,
    'page-settings': settingsPage,
    'page-permission': permissionPage,
    'page-dashboard': dashboardPage,
    'page-analysis': analysisPage,
    'page-bigscreen': bigscreenPage,
    'page-map': mapPage,
    'page-ai-chat': aiChatPage,
    'page-ai-copilot': copilotPage,
    'page-knowledge': knowledgePage,
    'page-collaboration': collaborationPage,
    'page-notification': notificationPage,
    'page-login': systemPage,
    'page-onboarding': systemPage,
    'page-state': systemPage,
  };

  const componentStatePreview = (id, doc) => wrap(id, `<div class="component-live-target" data-live-target><div class="component-live-copy"><span>${doc.zh}</span><b>${doc.en}</b><small>默认、悬停、焦点、禁用和错误状态使用同一组 Token。</small></div><button type="button" class="btn primary" data-preview-action="trigger-feedback">执行示例操作</button></div>`, {title: '组件状态检查', hint: '切换状态后继续使用 Tab 键检查键盘焦点。', states: [['default','默认'],['hover','悬停'],['focus','焦点'],['loading','加载'],['error','错误'],['disabled','禁用']]});

  const foundationPreview = (id) => {
    const options = id === 'color'
      ? [['#165DFF','品牌主色'],['#4080FF','悬停色'],['#0E42D2','按下色'],['#E8F3FF','浅色背景']]
      : id === 'typography'
        ? [['12px','辅助文字'],['14px','正文控件'],['16px','分区标题'],['20px','页面标题']]
        : [['4px','最小间距'],['8px','紧凑间距'],['16px','标准间距'],['24px','分区间距']];
    return wrap(id, `<div class="token-picker">${options.map(([value,label], index)=>`<button type="button" class="${index===0?'active':''}" data-preview-action="select-token" data-value="${value}" data-label="${label}" aria-pressed="${index===0}"><i style="--token:${value}"></i><b>${label}</b><code>${value}</code></button>`).join('')}</div><div class="token-result"><div data-token-sample style="--selected-token:${options[0][0]}"><span>实时样式</span><b data-token-label>${options[0][1]}</b></div><code data-token-value>${options[0][0]}</code><button type="button" class="btn default" data-preview-action="copy-token">复制值</button></div>`, {title:'Token 实时检查',hint:'选择样式值并复制，核对颜色、字号或间距。',states:false});
  };

  const layoutPreview = (id) => wrap(id, `<div class="layout-density" role="group" aria-label="切换布局密度"><button type="button" class="active" data-preview-action="set-density" data-value="comfortable">标准 16px</button><button type="button" data-preview-action="set-density" data-value="compact">紧凑 8px</button><button type="button" data-preview-action="set-density" data-value="section">分区 24px</button></div><div class="density-canvas" data-density-canvas data-density="comfortable"><header>标题与工具区</header><div><aside>导航</aside><main><section>内容区 A</section><section>内容区 B</section></main></div></div>`, {title:'布局与间距检查',hint:'切换密度，观察同级元素和分区间距的变化。',states:false});

  const navigationPreview = (id) => wrap(id, `<nav class="live-navigation" aria-label="交互导航示例"><button type="button" class="active" data-preview-action="activate">${id==='breadcrumb'?'概览':'全部'}</button><button type="button" data-preview-action="activate">${id==='pagination'?'2':'处理中'}</button><button type="button" data-preview-action="activate">${id==='pagination'?'3':'已完成'}</button><button type="button" data-preview-action="activate">${id==='sidebar'?'设置':'更多'}</button></nav><div class="navigation-result" data-navigation-result>当前选择：${id==='breadcrumb'?'概览':'全部'}</div>`, {title:'导航选择与焦点',hint:'点击或使用 Tab 键切换，当前项、URL 语义和焦点必须同步。',states:false});

  const formComponentPreview = (id) => {
    if (id === 'slider') return wrap(id, `<label class="live-range-field"><span>阈值 <output data-range-output>48</output></span><input type="range" min="0" max="100" value="48" data-preview-range style="--range-progress:48%"></label>`, {title:'滑动输入',hint:'拖动滑块检查实时值、键盘步进与焦点。',states:false});
    if (id === 'upload') return wrap(id, `<div class="live-upload"><input type="file" id="liveUpload" data-preview-upload><label for="liveUpload" class="btn default">选择文件</label><span data-upload-name>尚未选择文件</span></div>`, {title:'文件选择与结果',hint:'选择本地文件后只显示名称，不读取或上传内容。',states:false});
    if (id === 'select') return wrap(id, `<form class="inline-live-form" data-preview-form novalidate><div class="live-select-grid"><div class="live-field"><span>报告类型 *</span>${liveSelect({name:'reportType',required:true,label:'选择报告类型',options:[['tr','TR 报告'],['strategy','战略咨询报告'],['insight','洞察分析报告']]})}</div><div class="live-field"><span>禁用状态</span>${liveSelect({value:'locked',disabled:true,label:'禁用的报告状态',options:[['locked','已锁定，不可修改']]})}</div></div><p class="live-field-error" data-form-error role="alert"></p><button type="submit" class="btn primary">校验选择</button></form>`, {title:'下拉状态与校验',hint:'打开菜单检查 Hover、Focus、选中与关闭；右侧展示禁用状态。',states:false});
    return wrap(id, `<form class="inline-live-form" data-preview-form novalidate><label><span>${id==='choice'?'选项名称':'字段名称'} *</span>${id==='choice'?'<span class="choice-line"><input type="checkbox" required> 我已确认当前设置</span>':'<input required placeholder="请输入内容">'}</label><p class="live-field-error" data-form-error role="alert"></p><button type="submit" class="btn primary">校验</button></form>`, {title:'录入、校验与恢复',hint:'提交空值查看错误，修正后再次提交。',states:false});
  };

  const dataComponentPreview = (id) => {
    if (id === 'calendar') return wrap(id, `<div class="live-calendar" role="grid">${[15,16,17,18,19,20,21].map((day,index)=>`<button type="button" class="${index===2?'active':''}" data-preview-action="activate" aria-label="8 月 ${day} 日">${day}</button>`).join('')}</div>`, {title:'日期选择',hint:'点击日期并检查选中与键盘焦点。',states:false});
    if (id === 'collapse') return wrap(id, `<div class="live-accordion"><button type="button" aria-expanded="true" data-preview-action="toggle-panel">基础配置</button><div>名称、负责人和生效条件。</div><button type="button" aria-expanded="false" data-preview-action="toggle-panel">异常处理</button><div hidden>失败重试、回退和通知方式。</div></div>`, {title:'展开与收起',hint:'展开状态与 aria-expanded 保持同步。',states:false});
    if (id === 'carousel') return wrap(id, `<div class="live-carousel"><button type="button" class="btn default" data-preview-action="carousel-prev">上一项</button><div data-carousel-copy><b>报告资源</b><p>第 1 / 3 项，可通过按钮和键盘切换。</p></div><button type="button" class="btn default" data-preview-action="carousel-next">下一项</button></div>`, {title:'内容切换',hint:'手动切换同级内容，不自动播放。',states:false});
    if (id === 'comment') return wrap(id, `<article class="live-comment"><div class="comment-avatar">李</div><div><b>李安</b><p>这是一条等待审核的演示评论，正文允许自然换行。</p><span data-comment-status>待审核</span></div><div><button type="button" class="live-link" data-preview-action="approve-comment">通过</button><button type="button" class="live-link danger" data-preview-action="reject-comment">驳回</button></div></article>`, {title:'评论审核',hint:'操作后更新状态，并保留可追溯反馈。',states:false});
    if (['dashboard','card','avatar','badge','status'].includes(id)) return dashboardPage(id,{zh:id==='dashboard'?'数据看板':'数据展示',en:'Live Data Preview'});
    return wrap(id, `<div class="live-table-wrap"><table class="live-table"><thead><tr><th><input type="checkbox" aria-label="全选"></th><th><button type="button" data-preview-action="sort">名称</button></th><th>状态</th><th>操作</th></tr></thead><tbody>${rows('组件')}</tbody></table></div>`, {title:'数据选择与排序',hint:'选择行、排序并进入详情。'});
  };

  const feedbackPreview = (id) => wrap(id, `<div class="feedback-actions"><button type="button" class="btn default" data-preview-action="trigger-feedback">显示轻提示</button><button type="button" class="btn primary" data-preview-action="open-modal">打开${id==='confirm'?'确认':'弹窗'}</button><button type="button" class="btn danger" data-preview-action="open-confirm">危险操作</button><button type="button" class="tooltip-anchor" data-preview-action="toggle-tooltip" aria-describedby="liveTooltip">查看禁用原因</button><span class="live-tooltip" id="liveTooltip" role="tooltip" hidden>当前对象已锁定，请先解除锁定。</span></div>`, {title:'反馈与浮层',hint:'检查提示、弹窗焦点、确认文案和关闭恢复。',states:false});

  const layoutIds = ['divider','grid','layout','space'];
  const navigationIds = ['breadcrumb','tabs','sidebar','pagination'];
  const formIds = ['input','select','choice','upload','slider'];
  const dataIds = ['table','status','avatar','badge','card','dashboard','calendar','carousel','collapse','comment'];
  const feedbackIds = ['message','alert','modal','confirm','tooltip'];

  const renderPage = (id, doc) => {
    if (id === 'page-index' || id === 'table-types') return overviewPage(id, doc);
    return (pageRenderers[id] || systemPage)(id, doc);
  };

  const render = (id, doc) => {
    if (id.startsWith('page-') || id === 'table-types') return renderPage(id, doc);
    if (['tokens','color','typography'].includes(id)) return foundationPreview(id);
    if (layoutIds.includes(id)) return layoutPreview(id);
    if (navigationIds.includes(id)) return navigationPreview(id);
    if (formIds.includes(id)) return formComponentPreview(id);
    if (dataIds.includes(id)) return dataComponentPreview(id);
    if (feedbackIds.includes(id)) return feedbackPreview(id);
    return componentStatePreview(id, doc);
  };

  window.gkxInteractionDocs = {render};
})();

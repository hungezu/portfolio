# 简历维护

公开下载文件：`assets/portfolio/li-jiahao-ux-ui-resume.pdf`。

当前公开版本为用户提供的「李家豪-简历.pdf」，共 3 页，原文件 SHA256 为 `eafc3e0551aee24eda9f908eeb3e597cf3e1d09bcb0ab547193980512b4c8fea`。直接复制原文件，不重新排版或修改 PDF 内容。首页工作经历下方与导航菜单共用下载组件，下载文件名为「李家豪-简历.pdf」，页数说明为「PDF · 3页」。链接使用文件哈希前缀作为版本参数，替换时需同步更新，避免旧文件缓存。

首页工作经历仍由 `content.zh-CN.json` 提供任职信息、简介与 `details`。文案依据为用户简历、「招聘」对话的补充与确认，以及 `DESIGN.md` 中已确认的职责。保留用户确认的“7年+”，不展示 2020 年之前实习经历；GKX 身份保持脱敏，合同周期不作为个人任职或设计交付时间。问数 AI 问答平台与招财 Smart 合并为一个项目；其余未确认项目日期不作推测。结果不补写未验证的数字或客户评价。

`scripts/build-resume.py` 仅保留为旧版两页简历的草稿生成器，需要 ReportLab 与 Windows 微软雅黑字体，内容来自 JSON 中的 `bullets` 和 `projects`，头像保存在 `portrait.png`。执行 `python scripts/build-resume.py` 只生成 `output/pdf/` 内的草稿，不再覆盖用户提供的公共下载文件。发布构建的 `copy-static.mjs` 会复制 `assets/portfolio/`，无需额外配置。

运行 `python scripts/build-resume.py --check` 可只测量旧模板排版，不写入文件。替换公共简历时，需检查实际页数、渲染与文件哈希，并同步下载组件的文件名、页数和版本参数。

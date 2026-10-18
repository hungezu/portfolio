# 简历维护

公开下载文件：`assets/portfolio/li-jiahao-ux-ui-resume.pdf`。

内容源：`content.zh-CN.json`；头像来自用户提供的原简历，保存在 `portrait.png`。修改内容后，在仓库根目录执行 `python scripts/build-resume.py`，需要 ReportLab 和 Windows 微软雅黑字体。生成器同时写入 `output/pdf/` 与网站资源目录；发布构建已有的 `copy-static.mjs` 会复制 `assets/portfolio/`，无需额外配置。

文案依据为用户提供的简历、`app/portfolio-data.ts` 及 `DESIGN.md` 中已确认的职责。保留用户确认的“7年+”，不展示 2020 年之前实习经历；GKX 身份保持脱敏，合同周期不作为个人任职或设计交付时间。结果不补写未验证的数字或客户评价。

PDF 为两页 A4，字体已嵌入，电话、邮箱、作品集及五个项目标题带可点击链接。后续调整后需重新渲染两页，检查中文、分页、边距和链接。菜单和工作经历区域复用同一下载组件，按钮所写页数需与实际文件一致。

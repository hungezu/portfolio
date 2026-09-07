# 李家豪作品集网站

这是根据 `李家豪- UI作品集 (1).pdf` 重新整理出的响应式作品集网站原型。

## 当前内容

- `index.html`: 可直接打开的单页作品集网站，已适配电脑端和手机端。
- `CONTENT_GUIDE.md`: 后续修改文案、添加项目、替换项目详情图片时的维护说明。
- `assets/portfolio/`: 早期从 PDF 中导出的项目封面图，目前首页尽量不依赖这些截图。
- `assets/li-jiahao-ui-portfolio.pdf`: 原始作品集 PDF，保留作源文件。
- `assets/li-jiahao-ui-portfolio-web.pdf`: 适合网页加载的优化版 PDF，供网站下载入口使用。

## 推荐推进流程

1. 补齐每个项目的 case study 文案：背景、目标、你的角色、设计过程、关键决策、最终成果、复盘。
2. 从单页首页扩展为多页网站：`index.html` 做首页，每个项目单独做详情页。
3. 项目详情页优先使用网页组件重构：流程、表格、筛选、状态、组件规范、Before / After。
4. 图片只作为少量关键界面佐证，避免整页 PPT 截图堆叠。
5. 增加真实项目成果：上线链接、客户反馈、数据变化、研发协作说明。
6. 部署上线：可使用 Vercel、Netlify 或 GitHub Pages。

## 本地预览

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://127.0.0.1:4173
```

## 作品集助手

首页和案例页右侧会露出一只躲在屏幕边缘的粉色小猪。滚动时它会用一句话介绍当前章节，点击后露出全身并展开站内悬浮对话窗，不会新开页面。助手只检索 `app/chat-knowledge.ts` 中整理过的公开内容；超出范围会统一回复“我只能回答关于李家豪及其设计作品的问题。”，也不会启用联网搜索。

需要模型接口时，在本地或服务端复制 `.env.example` 为 `.env.local` 并填写 `OPENAI_API_KEY`（可选填写 `OPENAI_MODEL`），`/api/chat` 会在服务端调用模型，密钥不会进入浏览器。没有密钥或使用 GitHub Pages 静态托管时，界面会自动使用同一份本地白名单知识库回答，仍保持边界限制。

如果静态站点需要连接独立的 API 服务，可在加载主脚本前设置 `window.__PORTFOLIO_CHAT_API__` 为 `POST` 接口地址（并由该服务自行处理跨域）；接口应返回 `{ reply, mode, references }`。

当前小猪素材为临时助手形象：`assets/visual/pink-piglet-spritesheet.webp`。以后替换成 Q 版人物时，保留透明精灵表或调整 `PortfolioPetSprite` 的素材地址即可，不需要改聊天和滚动逻辑。

import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right.mjs";
import { publicAsset } from "../portfolio-data";
import "./zhaocai-design-evidence.css";

type EvidenceFigureProps = {
  source: string;
  crop: "board" | "answer";
  alt: string;
};

function EvidenceFigure({ source, crop, alt }: EvidenceFigureProps) {
  return (
    <figure className="zc4-design-evidence-figure">
      <div className={`zc4-design-evidence-window is-${crop}`}>
        <img
          src={publicAsset(source)}
          width="1920"
          height="1080"
          loading="lazy"
          decoding="async"
          alt={alt}
        />
      </div>
      <figcaption>
        <span>历史设计稿 · 界面局部</span>
        <a href={publicAsset(source)} target="_blank" rel="noopener noreferrer">
          查看完整原稿
          <ArrowUpRight aria-hidden="true" size={15} />
          <span className="zc4-design-evidence-sr-only">（新标签页）</span>
        </a>
        <p className="zc4-design-evidence-data-note">原稿与交互演示使用不同业务任务与示例数据。</p>
      </figcaption>
    </figure>
  );
}

export function ZhaocaiBoardEvidence() {
  return (
    <article className="zc4-design-evidence">
      <EvidenceFigure
        source="/assets/projects/zhaocai-smart/15-board-interaction.png"
        crop="board"
        alt="招财历史看板设计稿局部：图表卡片、合集及拖动时浮起的分析卡片，呈现拖放重排方案。"
      />
      <div className="zc4-design-evidence-copy">
        <h3>从单次结果，转向持续看板</h3>
        <p>一次分析形成卡片，相关卡片组成合集，让同一业务主题可以持续查看与整理。</p>
        <dl>
          <div><dt>长期保留</dt><dd>将有用的分析保存到看板，继续查看同一主题。</dd></div>
          <div><dt>拖放重排</dt><dd>移动时展示位置预览，让落点和排列变化可见。</dd></div>
          <div><dt>合并确认</dt><dd>松手后确认目标合集，再完成信息归组。</dd></div>
        </dl>
        <p className="zc4-design-evidence-material-note">拖放细节见历史原稿；页面演示通过排序与合并操作呈现状态。</p>
      </div>
    </article>
  );
}

export function ZhaocaiAnswerEvidence() {
  return (
    <article className="zc4-design-evidence is-reversed">
      <EvidenceFigure
        source="/assets/projects/zhaocai-smart/16-markdown-specification.png"
        crop="answer"
        alt="招财历史回答规范中的产品界面局部：金融行业趋势汇总，以标题、分栏表格和条目组织内容。"
      />
      <div className="zc4-design-evidence-copy">
        <h3>把输出类型，变成阅读规则</h3>
        <p>标题帮助定位结论，表格支持逐项比较，引用保留核对路径。规范把这些阅读任务对应到字号、层级、间距与组件表达。</p>
        <ul className="zc4-design-evidence-categories" aria-label="历史回答规范覆盖的内容类型">
          {["标题与正文", "列表与表格", "参考引用", "段落", "公式", "代码"].map((category) => <li key={category}>{category}</li>)}
        </ul>
        <p className="zc4-design-evidence-material-note">完整原稿保留分类总览、界面示例和排版标注，供设计与研发核对。</p>
      </div>
    </article>
  );
}

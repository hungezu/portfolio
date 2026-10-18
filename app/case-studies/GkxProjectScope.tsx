import "./gkx-project-scope.css";

export type GkxProjectScopeData = {
  portal: string;
  systems: Array<{ name: string }>;
  other: { name: string; description: string };
};

export function GkxProjectScope({ scope }: { scope: GkxProjectScopeData }) {
  return <figure className="gkx-project-scope" aria-labelledby="gkx-project-scope-caption">
    <div className="gkx-project-scope__portal">
      <div className="gkx-project-scope__portal-node">
        <div>
          <strong>{scope.portal}</strong>
          <span>统一业务入口</span>
        </div>
      </div>
    </div>
    <div className="gkx-project-scope__main">
      <ul>{scope.systems.map(system => <li key={system.name}>{system.name}</li>)}</ul>
      <p>四大主要业务系统</p>
    </div>
    <figcaption className="gkx-project-scope__footer" id="gkx-project-scope-caption">
      <span>项目范围示意</span>
      <span className="gkx-project-scope__other"><span>门户亦连接</span><strong>{scope.other.name}</strong></span>
    </figcaption>
  </figure>;
}

import "./gkx-project-scope.css";
import { useI18n } from "../i18n";


export type GkxProjectScopeData = {
  portal: string;
  systems: Array<{ name: string }>;
  other: { name: string; description: string };
};

export function GkxProjectScope({ scope }: { scope: GkxProjectScopeData }) {
  const { t } = useI18n();
  return <figure className="gkx-project-scope" aria-labelledby="gkx-project-scope-caption">
    <div className="gkx-project-scope__portal">
      <div className="gkx-project-scope__portal-node">
        <div>
          <strong>{t(scope.portal)}</strong>
          <span>{t("统一业务入口")}</span>
        </div>
      </div>
    </div>
    <div className="gkx-project-scope__main">
      <ul>{scope.systems.map(system => <li key={system.name}>{t(system.name)}</li>)}</ul>
      <p>{t("四大主要业务系统")}</p>
    </div>
    <figcaption className="gkx-project-scope__footer" id="gkx-project-scope-caption">
      <span>{t("项目范围示意")}</span>
      <span className="gkx-project-scope__other"><span>{t("门户亦连接")}</span><strong>{t(scope.other.name)}</strong></span>
    </figcaption>
  </figure>;
}

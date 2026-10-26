import { ALERT_COLORS } from "../lib/alerts";
import { es } from "../i18n/es";

export default function AlertPill({ level }) {
  return (
    <span className="alert-pill" title={es.alert[level].meaning}>
      <i style={{ background: ALERT_COLORS[level] }}>{es.alert[level].letter}</i>
      {level}
    </span>
  );
}

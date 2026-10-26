import TiltCard from "./TiltCard";
import { es } from "../i18n/es";
import { KIND_FILL } from "../lib/alerts";

export default function StatsPanel({ stats, treeKind }) {
  return (
    <section className="glass panel" aria-labelledby="stats-title">
      <h3 id="stats-title">Conceptos del árbol, en vivo</h3>
      <p className="sub">Las métricas de la clase calculadas sobre «{es.trees[treeKind].title}».</p>
      <div className="stats">
        {Object.entries(es.stats).map(([key, [label, description]]) => (
          <TiltCard key={key} className="stat">
            <div className="k">{label}</div>
            <div className="v">{stats[key]}</div>
            <div className="d">{description}</div>
          </TiltCard>
        ))}
      </div>
      <div className={`balance ${stats.balanced ? "ok" : "warn"}`} role="status">
        <strong>{stats.balanced ? "✓ Equilibrado" : "⚠ Desequilibrado"}</strong>
        <span>
          {stats.balanced
            ? "Las alturas de los subárboles difieren como máximo en 1 (condición AVL)."
            : "Un lado es mucho más profundo: la búsqueda se acerca a recorrer una lista."}
        </span>
      </div>
    </section>
  );
}

export function KindLegend() {
  return (
    <div className="legend" aria-label="Tipos de nodo">
      {Object.entries(es.kinds).map(([kind, label]) => (
        <span key={kind}>
          <i className="dot" style={{ background: KIND_FILL[kind] }} /> {label}
        </span>
      ))}
      <span>Insignia: nivel de alerta (V · A · N · R)</span>
    </div>
  );
}

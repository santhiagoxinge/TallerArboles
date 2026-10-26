import { useState } from "react";
import { es } from "../i18n/es";

const ORDER_RULE = {
  inorder: ["Izq", "Nodo", "Der"],
  preorder: ["Nodo", "Izq", "Der"],
  postorder: ["Izq", "Der", "Nodo"],
  levelorder: ["Nivel 1", "Nivel 2", "…"],
};

/** Agenda-style list: one numbered "day" per traversal, with a stamp and a rule. */
export default function TraversalPanel({ traversals, trace, step, onPlay, onStop }) {
  const [kind, setKind] = useState("inorder");
  const sequence = traversals[kind];
  const playing = trace?.numbered && trace.kind === kind;
  const entries = Object.entries(es.traversals);

  return (
    <section className="glass panel agenda reveal" aria-labelledby="trav-title">
      <h3 id="trav-title">Agenda de recorridos</h3>
      <p className="sub">Cuatro formas de leer el mismo árbol. Elige una y reprodúcela sobre los nodos.</p>
      <ol className="agenda-list">
        {entries.map(([key, item], index) => (
          <li key={key}>
            <button type="button" className="agenda-item" aria-pressed={kind === key} onClick={() => setKind(key)}>
              <span className="agenda-day">0{index + 1}</span>
              <span className="agenda-body">
                <strong>{item.label}</strong>
                <span className="agenda-rule">
                  {ORDER_RULE[key].map((part, i) => (
                    <span key={part + i}>{i > 0 ? <em aria-hidden="true">→</em> : null}{part}</span>
                  ))}
                </span>
              </span>
              <span className="agenda-stamp" aria-hidden="true">{key === kind ? "●" : "○"}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="help">{es.traversals[kind].help}</p>
      <div className="btn-row">
        <button type="button" className="btn primary small" onClick={() => onPlay(kind)} disabled={sequence.length === 0}>
          ▶ Reproducir
        </button>
        {trace ? (
          <button type="button" className="btn soft small" onClick={onStop}>Limpiar</button>
        ) : null}
      </div>
      <ol className="seq" aria-label="Orden resultante">
        {sequence.map((name, index) => (
          <li key={name} className={playing && index < step ? "on" : ""}>
            {index + 1}. {name}
          </li>
        ))}
      </ol>
    </section>
  );
}

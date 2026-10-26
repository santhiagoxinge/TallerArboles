import { AnimatePresence, motion } from "framer-motion";
import AlertPill from "./AlertPill";
import { es } from "../i18n/es";
import { formatMeters } from "../lib/alerts";

export default function VolcanoPanel({ volcanoes, nodeInfo, selectedId, onSelect, onEdit, onRemove, busy }) {
  const selected = volcanoes.find((v) => v.name === selectedId);
  const info = selected ? nodeInfo.get(selected.name) : null;

  return (
    <section className="glass panel detail" aria-labelledby="list-title">
      <h3 id="list-title">Volcanes registrados ({volcanoes.length})</h3>
      <p className="sub">Selecciona uno aquí o toca un nodo del árbol.</p>
      <ul className="vlist">
        {volcanoes.map((volcano) => (
          <li key={volcano.name}>
            <button type="button" className="vitem" aria-pressed={selectedId === volcano.name} onClick={() => onSelect(volcano.name)}>
              <span className="grow">
                <span className="nm">{volcano.name}</span>
                <br />
                <span className="sm">{formatMeters(volcano.altitude)}{volcano.department ? ` · ${volcano.department}` : ""}</span>
              </span>
              <AlertPill level={volcano.alert_level} />
            </button>
          </li>
        ))}
      </ul>
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <dl>
              <dt>Volcán</dt><dd>{selected.name}</dd>
              <dt>Altitud</dt><dd>{formatMeters(selected.altitude)}</dd>
              <dt>Alerta</dt><dd>{selected.alert_level}: {es.alert[selected.alert_level].meaning}</dd>
              {selected.department ? (<><dt>Departamento</dt><dd>{selected.department}</dd></>) : null}
              {info ? (
                <>
                  <dt>En el árbol</dt>
                  <dd>{es.kinds[info.kind]} · nivel {info.level} · {info.degree} {info.degree === 1 ? "hijo" : "hijos"}</dd>
                </>
              ) : null}
            </dl>
            <div className="btn-row">
              <button type="button" className="btn soft small" onClick={() => onEdit(selected)}>Editar</button>
              <button type="button" className="btn danger small" onClick={() => onRemove(selected.name)} disabled={busy}>Eliminar</button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

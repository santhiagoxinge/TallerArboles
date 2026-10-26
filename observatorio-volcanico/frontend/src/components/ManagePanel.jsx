import { useState } from "react";
import { ALERT_LEVELS, formatMeters } from "../lib/alerts";
import { es } from "../i18n/es";

const MODES = [
  ["register", "01 Registrar"],
  ["search", "02 Buscar"],
  ["range", "03 Rango"],
];

function RegisterForm({ draft, onDraftChange, onSave, busy }) {
  const set = (field) => (event) => onDraftChange({ ...draft, [field]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    onSave({ ...draft, altitude: Number(draft.altitude) });
  };
  return (
    <form onSubmit={submit}>
      <p className="sub">
        Inserta el volcán en los dos árboles. Si el nombre ya existe, se actualiza (igual que en la agenda telefónica).
      </p>
      <div className="field">
        <label htmlFor="v-name">Nombre</label>
        <input id="v-name" value={draft.name} onChange={set("name")} required minLength={2} maxLength={60} placeholder="Ej. Santa Isabel" autoComplete="off" />
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="v-alt">Altitud (m)</label>
          <input id="v-alt" type="number" inputMode="numeric" min="0" max="9000" value={draft.altitude} onChange={set("altitude")} required placeholder="4950" />
        </div>
        <div className="field">
          <label htmlFor="v-dep">Departamento</label>
          <input id="v-dep" value={draft.department} onChange={set("department")} maxLength={40} placeholder="Opcional" autoComplete="off" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="v-level">Nivel de alerta</label>
        <select id="v-level" value={draft.alert_level} onChange={set("alert_level")}>
          {ALERT_LEVELS.map((level) => (
            <option key={level} value={level}>{level} · {es.alert[level].meaning}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn primary block" disabled={busy}>Guardar volcán</button>
    </form>
  );
}

function SearchForm({ onSearch, busy }) {
  const [name, setName] = useState("");
  const [result, setResult] = useState(null);
  const submit = async (event) => {
    event.preventDefault();
    setResult(await onSearch(name));
  };
  return (
    <form onSubmit={submit}>
      <p className="sub">Busca por nombre: en cada nodo decide ir a la izquierda o a la derecha y descarta media rama.</p>
      <div className="field">
        <label htmlFor="s-name">Nombre del volcán</label>
        <input id="s-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} placeholder="Ej. Galeras" autoComplete="off" />
      </div>
      <button type="submit" className="btn primary block" disabled={busy}>Buscar</button>
      {result ? (
        <div className={`result ${result.found ? "" : "bad"}`} role="status">
          {result.found ? (
            <>
              <strong>{result.record.name}</strong> encontrado con <strong>{result.comparisons}</strong> comparaciones
              (de {result.total} volcanes). Alerta: {result.record.alert_level}.
            </>
          ) : (
            <>No se encontró. Se recorrieron {result.comparisons} nodos antes de llegar a un espacio vacío.</>
          )}
        </div>
      ) : null}
    </form>
  );
}

function RangeForm({ onRange, busy }) {
  const [low, setLow] = useState(4000);
  const [high, setHigh] = useState(4800);
  const [result, setResult] = useState(null);
  const submit = async (event) => {
    event.preventDefault();
    setResult(await onRange(Number(low), Number(high)));
  };
  return (
    <form onSubmit={submit}>
      <p className="sub">Consulta por altitud en el árbol ordenado: se saltan los subárboles que no pueden contener el rango.</p>
      <div className="row">
        <div className="field">
          <label htmlFor="r-low">Desde (m)</label>
          <input id="r-low" type="number" min="0" max="9000" value={low} onChange={(e) => setLow(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="r-high">Hasta (m)</label>
          <input id="r-high" type="number" min="0" max="9000" value={high} onChange={(e) => setHigh(e.target.value)} required />
        </div>
      </div>
      <button type="submit" className="btn primary block" disabled={busy}>Consultar rango</button>
      {result ? (
        <div className="result" role="status">
          <strong>{result.results.length}</strong> volcanes entre {formatMeters(low)} y {formatMeters(high)}; se visitaron{" "}
          <strong>{result.visited.length}</strong> de {result.total} nodos.
          {result.results.length ? <> ({result.results.map((r) => r.name).join(", ")})</> : null}
        </div>
      ) : null}
    </form>
  );
}

export default function ManagePanel({ mode, onModeChange, draft, onDraftChange, onSave, onSearch, onRange, onReset, busy }) {
  return (
    <section className="glass panel" aria-labelledby="manage-title">
      <h3 id="manage-title">Operaciones</h3>
      <div className="tabs-inline" role="group" aria-label="Operación" style={{ marginTop: 12 }}>
        {MODES.map(([key, label]) => (
          <button key={key} type="button" className="chip-tab" aria-pressed={mode === key} onClick={() => onModeChange(key)}>
            {label}
          </button>
        ))}
      </div>
      {mode === "register" && <RegisterForm draft={draft} onDraftChange={onDraftChange} onSave={onSave} busy={busy} />}
      {mode === "search" && <SearchForm onSearch={onSearch} busy={busy} />}
      {mode === "range" && <RangeForm onRange={onRange} busy={busy} />}
      <button type="button" className="btn soft small" style={{ marginTop: 16 }} onClick={onReset} disabled={busy}>
        Restablecer datos de ejemplo
      </button>
    </section>
  );
}

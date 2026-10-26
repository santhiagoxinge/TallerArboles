import { useState } from "react";
import { snippets } from "../data/snippets";

export default function CodePanel() {
  const [active, setActive] = useState("search");
  const snippet = snippets[active];
  return (
    <section className="glass panel" aria-labelledby="code-title">
      <h3 id="code-title">El código detrás de la animación</h3>
      <p className="sub">{snippet.note}</p>
      <div className="tabs-inline" role="group" aria-label="Fragmento de código">
        {Object.entries(snippets).map(([key, item]) => (
          <button key={key} type="button" className="chip-tab" aria-pressed={active === key} onClick={() => setActive(key)}>
            {item.label}
          </button>
        ))}
      </div>
      <pre className="code" tabIndex={0}><code>{snippet.code}</code></pre>
    </section>
  );
}

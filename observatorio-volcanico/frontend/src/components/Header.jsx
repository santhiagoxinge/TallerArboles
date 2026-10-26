import { motion } from "framer-motion";
import { es } from "../i18n/es";

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="mountain" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3fb6cf" />
          <stop offset="1" stopColor="#0d62b4" />
        </linearGradient>
      </defs>
      <path d="M5 56 25 17h14l20 39z" fill="url(#mountain)" />
      <path d="M25 17h14l3 6H22z" fill="#a6dde6" />
      <circle cx="32" cy="10" r="5" fill="#1f9d63" />
    </svg>
  );
}

export default function Header({ treeKind, onTreeChange }) {
  return (
    <header className="topbar glass strong">
      <div className="brand">
        <BrandMark />
        <div>
          <h1>{es.brand}</h1>
          <p>Estructuras de Datos · Árboles</p>
        </div>
      </div>
      <nav className="segmented" aria-label="Seleccionar árbol">
        {Object.entries(es.trees).map(([key, tree]) => (
          <button key={key} type="button" aria-pressed={treeKind === key} onClick={() => onTreeChange(key)}>
            {treeKind === key && (
              <motion.span layoutId="tree-pill" className="pill" transition={{ type: "spring", stiffness: 320, damping: 30 }} />
            )}
            {tree.tab}
          </button>
        ))}
      </nav>
    </header>
  );
}

import { useRef } from "react";
import { motion } from "framer-motion";
import { es } from "../i18n/es";

const STEPS = [
  ["01", "Registra", "Inserta un volcán y mira dónde cae."],
  ["02", "Busca", "Descarta media rama en cada paso."],
  ["03", "Recorre", "Cuatro órdenes para leer el árbol."],
];

const RINGS = [
  { r: 150, label: "RAÍZ", color: "var(--blue)", duration: 46, dash: "2 10" },
  { r: 114, label: "RAMA", color: "var(--cyan)", duration: 32, dash: "6 8" },
  { r: 78, label: "HOJA", color: "var(--green)", duration: 22, dash: "1 7" },
];

/** Concentric rings (root → branch → leaf) around a pointer-reactive volcano. */
function RingsScene() {
  const ref = useRef(null);

  const onMove = (event) => {
    if (event.pointerType !== "mouse") return;
    const box = ref.current.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    ref.current.style.setProperty("--px", px.toFixed(3));
    ref.current.style.setProperty("--py", py.toFixed(3));
  };
  const onLeave = () => {
    ref.current.style.setProperty("--px", "0");
    ref.current.style.setProperty("--py", "0");
  };

  return (
    <div className="scene" ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden="true">
      <svg className="rings" viewBox="-170 -170 340 340">
        {RINGS.map((ring) => (
          <g key={ring.label} className="ring-spin" style={{ animationDuration: `${ring.duration}s` }}>
            <circle r={ring.r} fill="none" stroke={ring.color} strokeWidth="2" strokeDasharray={ring.dash} strokeLinecap="round" opacity="0.8" />
            <circle cx={ring.r} r="7" fill={ring.color} stroke="#fff" strokeWidth="2.5" />
          </g>
        ))}
        {RINGS.map((ring) => (
          <text key={ring.label} x="0" y={-ring.r - 8} textAnchor="middle" className="ring-label">{ring.label}</text>
        ))}
      </svg>

      <div className="volcano-float">
        <svg viewBox="0 0 200 200" className="volcano">
          <defs>
            <linearGradient id="v-back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a6dde6" />
              <stop offset="1" stopColor="#3fb6cf" />
            </linearGradient>
            <linearGradient id="v-mid" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3fb6cf" />
              <stop offset="1" stopColor="#0d62b4" />
            </linearGradient>
            <linearGradient id="v-front" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#b4dba0" />
              <stop offset="1" stopColor="#1f9d63" />
            </linearGradient>
          </defs>
          <g className="layer l1"><path d="M10 170 80 55h40l70 115z" fill="url(#v-back)" opacity="0.85" /></g>
          <g className="layer l2"><path d="M30 170 85 74h30l55 96z" fill="url(#v-mid)" opacity="0.92" /></g>
          <g className="layer l3"><path d="M60 170 92 112h16l32 58z" fill="url(#v-front)" /></g>
          <g className="layer l4"><ellipse cx="100" cy="56" rx="22" ry="7" fill="#eef1f2" opacity="0.9" /></g>
        </svg>
        <span className="ember e1" /><span className="ember e2" /><span className="ember e3" />
      </div>
    </div>
  );
}

export default function Hero({ count }) {
  return (
    <section className="hero-grid" aria-labelledby="hero-title">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="eyebrow">
          <span className="eyebrow-count">({count ?? "–"})</span> volcanes · 2 árboles binarios de búsqueda
        </p>
        <h2 id="hero-title">
          Encuentra un volcán <span>sin revisarlos todos</span>
        </h2>
        <p className="lead">
          {es.tagline}. Cada volcán vive en dos árboles: uno por nombre y otro por altitud. Inserta, busca y recorre los
          nodos para ver cómo decide el algoritmo.
        </p>
        <ol className="steps">
          {STEPS.map(([number, title, text]) => (
            <li key={number}>
              <span className="step-num">{number}</span>
              <strong>{title}</strong>
              <span>{text}</span>
            </li>
          ))}
        </ol>
        <a className="scroll-cue" href="#workspace">
          <span className="scroll-dots" aria-hidden="true"><i /><i /><i /></span>
          Desliza para explorar
        </a>
      </motion.div>
      <RingsScene />
    </section>
  );
}

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { computeLayout } from "../lib/layout";
import { ALERT_COLORS, KIND_FILL, formatMeters } from "../lib/alerts";
import { es } from "../i18n/es";

const RADIUS = 24;
const SPRING = { type: "spring", stiffness: 140, damping: 20 };

function shorten(text, max = 15) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function TreeNode({ node, record, treeKind, state, orderNumber, selected, onSelect }) {
  const alertLetter = es.alert[record.alert_level].letter;
  const primary = treeKind === "name" ? record.name : formatMeters(record.altitude);
  const secondary = treeKind === "name" ? formatMeters(record.altitude) : record.name;
  const label = `${record.name}, ${record.altitude} metros, alerta ${record.alert_level}, ${es.kinds[node.kind]}, nivel ${node.level}`;

  const classes = ["node", state, selected ? "selected" : ""].join(" ");
  const activate = (event) => {
    if (event.type === "click" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(record.name);
    }
  };

  return (
    <motion.g
      initial={{ x: node.x, y: node.y, opacity: 0 }}
      animate={{ x: node.x, y: node.y, opacity: state === "dim" ? 0.4 : 1 }}
      exit={{ opacity: 0 }}
      transition={SPRING}
    >
      <g
        className={classes}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={selected}
        onClick={activate}
        onKeyDown={activate}
      >
        <title>{label}</title>
        <g className="pop">
          <circle className="ring" r={RADIUS} />
          <g className="node-body">
            <circle className="disc" r={RADIUS} fill={KIND_FILL[node.kind]} stroke="rgba(255,255,255,0.95)" strokeWidth="3" />
            <text className="initial" textAnchor="middle" dy="0.35em" fill="#fff" fontSize="16" fontWeight="750">
              {record.name[0]}
            </text>
          </g>
          <g transform={`translate(${RADIUS - 4}, ${-RADIUS + 4})`}>
            <circle r="10" fill={ALERT_COLORS[record.alert_level]} stroke="#fff" strokeWidth="2" />
            <text className="badge-letter" textAnchor="middle" dy="0.35em">{alertLetter}</text>
          </g>
          {orderNumber ? (
            <g transform={`translate(${-RADIUS + 4}, ${-RADIUS + 4})`}>
              <circle r="11" fill="#fff" stroke="var(--deep)" strokeWidth="2" />
              <text className="order-num" textAnchor="middle" dy="0.35em">{orderNumber}</text>
            </g>
          ) : null}
          <text className="name" textAnchor="middle" y={RADIUS + 18}>{shorten(primary)}</text>
          <text className="meta" textAnchor="middle" y={RADIUS + 33}>{shorten(secondary)}</text>
        </g>
      </g>
    </motion.g>
  );
}

export default function TreeCanvas({ tree, treeKind, records, trace, step, selectedId, onSelect, zoom }) {
  const layout = useMemo(() => computeLayout(tree.root), [tree.root]);
  const total = trace ? trace.ids.length : 0;
  const finished = trace ? step >= total : true;
  const indexOf = useMemo(() => new Map((trace?.ids ?? []).map((id, i) => [id, i])), [trace]);
  const finalIds = useMemo(() => new Set(trace?.finalIds ?? []), [trace]);

  if (!tree.root) {
    return <div className="empty">El árbol está vacío. Registra un volcán para ver cómo nace la raíz.</div>;
  }

  const nodeState = (id) => {
    if (!trace) return "";
    const idx = indexOf.get(id);
    if (finished && finalIds.has(id)) return "found visited";
    if (idx === undefined) return finalIds.has(id) ? "" : "dim";
    if (idx >= step) return "";
    if (idx === step - 1 && !finished) return "current visited";
    return "visited";
  };

  const edgeLit = (edge) => {
    if (!trace || trace.numbered) return false;
    const a = indexOf.get(edge.from);
    const b = indexOf.get(edge.to);
    return a !== undefined && b !== undefined && a < step && b < step;
  };

  const width = Math.max(layout.width, 520);
  return (
    <div className="canvas-scroll">
      <svg
        viewBox={`${-(width - layout.width) / 2} 0 ${width} ${layout.height}`}
        style={{ width: `${Math.max(zoom * 100, 20)}%`, minWidth: zoom >= 1 ? `${width * 0.6 * zoom}px` : undefined }}
        role="group"
        aria-label={`${es.trees[treeKind].title}: ${tree.stats.weight} nodos, altura ${tree.stats.height}`}
      >
        {layout.edges.map((edge) => (
          <motion.line
            key={edge.to}
            className={`edge ${edgeLit(edge) ? "lit" : ""}`}
            initial={{ x1: edge.a.x, y1: edge.a.y, x2: edge.b.x, y2: edge.b.y, opacity: 0 }}
            animate={{ x1: edge.a.x, y1: edge.a.y, x2: edge.b.x, y2: edge.b.y, opacity: 1 }}
            transition={SPRING}
          />
        ))}
        <AnimatePresence>
          {layout.nodes.map((node) => {
            const record = records.get(node.id);
            if (!record) return null;
            const idx = indexOf.get(node.id);
            const orderNumber = trace?.numbered && idx !== undefined && idx < step ? idx + 1 : null;
            return (
              <TreeNode
                key={node.id}
                node={node}
                record={record}
                treeKind={treeKind}
                state={nodeState(node.id)}
                orderNumber={orderNumber}
                selected={selectedId === node.id}
                onSelect={onSelect}
              />
            );
          })}
        </AnimatePresence>
      </svg>
    </div>
  );
}

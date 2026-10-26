export const ALERT_COLORS = {
  Verde: "var(--alert-verde)",
  Amarillo: "var(--alert-amarillo)",
  Naranja: "var(--alert-naranja)",
  Rojo: "var(--alert-rojo)",
};

export const ALERT_LEVELS = Object.keys(ALERT_COLORS);

export const KIND_FILL = {
  root: "var(--blue)",
  branch: "var(--cyan)",
  leaf: "var(--green)",
};

export function formatMeters(value) {
  return `${Number(value).toLocaleString("es-CO")} m`;
}

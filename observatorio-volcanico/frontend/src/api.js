async function request(path, options) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(body.detail) ? body.detail[0]?.msg : body.detail;
    throw new Error(detail || "Error inesperado del servidor");
  }
  return body;
}

export const api = {
  getState: () => request("/state"),
  saveVolcano: (volcano) => request("/volcanoes", { method: "POST", body: JSON.stringify(volcano) }),
  removeVolcano: (name) => request(`/volcanoes/${encodeURIComponent(name)}`, { method: "DELETE" }),
  search: (name) => request(`/search?name=${encodeURIComponent(name)}`),
  altitudeRange: (low, high) => request(`/altitude-range?low=${low}&high=${high}`),
  reset: () => request("/reset", { method: "POST" }),
};

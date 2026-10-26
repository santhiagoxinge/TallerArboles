import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api";
import { es } from "./i18n/es";
import { useStepper } from "./hooks/useStepper";
import Header from "./components/Header";
import Hero from "./components/Hero";
import AskAI from "./components/AskAI";
import TreeCanvas from "./components/TreeCanvas";
import StatsPanel, { KindLegend } from "./components/StatsPanel";
import TraversalPanel from "./components/TraversalPanel";
import ManagePanel from "./components/ManagePanel";
import VolcanoPanel from "./components/VolcanoPanel";
import CodePanel from "./components/CodePanel";
import Toast from "./components/Toast";

const EMPTY_DRAFT = { name: "", altitude: "", alert_level: "Verde", department: "" };
const ZOOM_STEP = 0.25;

function flatten(node, into = new Map()) {
  if (!node) return into;
  into.set(node.id, node);
  flatten(node.left, into);
  flatten(node.right, into);
  return into;
}

export default function App() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [treeKind, setTreeKind] = useState("name");
  const [mode, setMode] = useState("register");
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [selectedId, setSelectedId] = useState(null);
  const [trace, setTrace] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const step = useStepper(trace);

  const notify = useCallback((message, error = false) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, error });
    toastTimer.current = setTimeout(() => setToast(null), 3600);
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setData(await api.getState());
    } catch {
      setLoadError("No se pudo conectar con el servidor. Inicia el backend (uvicorn app.main:app --port 8000) y reintenta.");
    }
  }, []);

  useEffect(() => {
    load();
    return () => clearTimeout(toastTimer.current);
  }, [load]);

  const run = useCallback(
    async (task) => {
      setBusy(true);
      try {
        return await task();
      } catch (error) {
        notify(error.message, true);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [notify],
  );

  const changeTree = (kind) => {
    setTreeKind(kind);
    setTrace(null);
  };

  const save = (volcano) =>
    run(async () => {
      const result = await api.saveVolcano(volcano);
      const path = treeKind === "name" ? result.path_name : result.path_altitude;
      setData(result.state);
      setTrace({ kind: "path", ids: [...new Set([...path, result.name])], finalIds: [result.name] });
      setSelectedId(result.name);
      setDraft(EMPTY_DRAFT);
      notify(
        result.action === "created"
          ? `«${result.name}» insertado tras ${path.length} comparaciones`
          : `«${result.name}» actualizado`,
      );
    });

  const remove = (name) =>
    run(async () => {
      const result = await api.removeVolcano(name);
      setData(result.state);
      setTrace(null);
      setSelectedId(null);
      notify(`«${result.name}» eliminado de ambos árboles`);
    });

  const search = (name) =>
    run(async () => {
      const result = await api.search(name);
      setTreeKind("name");
      setTrace({ kind: "path", ids: result.path, finalIds: result.found ? [result.record.name] : [] });
      if (result.found) setSelectedId(result.record.name);
      return result;
    });

  const searchRange = (low, high) =>
    run(async () => {
      const result = await api.altitudeRange(low, high);
      setTreeKind("altitude");
      setTrace({ kind: "path", ids: result.visited, finalIds: result.results.map((r) => r.name) });
      return result;
    });

  const reset = () =>
    run(async () => {
      setData(await api.reset());
      setTrace(null);
      setSelectedId(null);
      notify("Datos de ejemplo restablecidos");
    });

  const edit = (volcano) => {
    setDraft({ ...volcano, altitude: String(volcano.altitude) });
    setMode("register");
  };

  const tree = data?.trees[treeKind];
  const records = useMemo(() => new Map((data?.volcanoes ?? []).map((v) => [v.name, v])), [data]);
  const nodeInfo = useMemo(() => flatten(tree?.root), [tree]);

  const playTraversal = (kind) =>
    setTrace({ kind, numbered: true, ids: tree.traversals[kind], finalIds: [] });

  return (
    <>
      <div className="atmosphere" aria-hidden="true">
        <div className="blob a" />
        <div className="blob b" />
        <div className="blob c" />
        <div className="blob d" />
      </div>

      <div className="app">
        <Header treeKind={treeKind} onTreeChange={changeTree} />

        <Hero count={data?.volcanoes.length} />

        {loadError ? (
          <div className="glass panel loading" role="alert">
            <p>{loadError}</p>
            <button type="button" className="btn primary" onClick={load}>Reintentar</button>
          </div>
        ) : !data ? (
          <div className="loading" role="status">
            <div className="spinner" />
            <p>Cargando el observatorio…</p>
          </div>
        ) : (
          <>
            <div className="grid" id="workspace">
              <div className="side">
                <ManagePanel
                  mode={mode}
                  onModeChange={setMode}
                  draft={draft}
                  onDraftChange={setDraft}
                  onSave={save}
                  onSearch={search}
                  onRange={searchRange}
                  onReset={reset}
                  busy={busy}
                />
                <VolcanoPanel
                  volcanoes={data.volcanoes}
                  nodeInfo={nodeInfo}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onEdit={edit}
                  onRemove={remove}
                  busy={busy}
                />
              </div>

              <div className="main">
                <section className="glass" aria-labelledby="canvas-title">
                  <div className="canvas-head">
                    <div>
                      <h3 id="canvas-title">{es.trees[treeKind].title}</h3>
                      <p>{es.trees[treeKind].hint}</p>
                    </div>
                    <div className="zoom" role="group" aria-label="Zoom del árbol">
                      <button type="button" className="icon-btn" aria-label="Alejar" onClick={() => setZoom((z) => Math.max(0.5, z - ZOOM_STEP))}>−</button>
                      <button type="button" className="icon-btn" aria-label="Restablecer zoom" onClick={() => setZoom(1)}>⟲</button>
                      <button type="button" className="icon-btn" aria-label="Acercar" onClick={() => setZoom((z) => Math.min(2.5, z + ZOOM_STEP))}>+</button>
                    </div>
                  </div>
                  <TreeCanvas
                    tree={tree}
                    treeKind={treeKind}
                    records={records}
                    trace={trace}
                    step={step}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    zoom={zoom}
                  />
                  <KindLegend />
                </section>
                <StatsPanel stats={tree.stats} treeKind={treeKind} />
              </div>
            </div>

            <div className="lower">
              <TraversalPanel traversals={tree.traversals} trace={trace} step={step} onPlay={playTraversal} onStop={() => setTrace(null)} />
              <CodePanel />
              <AskAI />
            </div>
          </>
        )}
      </div>
      <Toast toast={toast} />
    </>
  );
}

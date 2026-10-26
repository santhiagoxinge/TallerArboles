export const es = {
  brand: "Observatorio Volcánico",
  tagline: "Árboles binarios de búsqueda aplicados al monitoreo de volcanes",
  trees: {
    name: { tab: "Por nombre", title: "Árbol por nombre", hint: "Se ordena alfabéticamente (agenda telefónica)" },
    altitude: { tab: "Por altitud", title: "Árbol por altitud", hint: "Se ordena por metros sobre el nivel del mar" },
  },
  alert: {
    Verde: { letter: "V", meaning: "Estable" },
    Amarillo: { letter: "A", meaning: "Cambios en el comportamiento" },
    Naranja: { letter: "N", meaning: "Erupción probable" },
    Rojo: { letter: "R", meaning: "Erupción inminente o en curso" },
  },
  kinds: { root: "Raíz", branch: "Rama", leaf: "Hoja" },
  traversals: {
    inorder: { label: "Inorden", help: "Izquierda → nodo → derecha. Entrega los datos ordenados." },
    preorder: { label: "Preorden", help: "Nodo → izquierda → derecha. Sirve para copiar el árbol." },
    postorder: { label: "Postorden", help: "Izquierda → derecha → nodo. Sirve para eliminar el árbol." },
    levelorder: { label: "Por niveles", help: "Nivel por nivel, de arriba hacia abajo." },
  },
  stats: {
    height: ["Altura", "Niveles desde la raíz hasta la hoja más lejana"],
    weight: ["Peso", "Cantidad total de nodos"],
    leaves: ["Hojas", "Nodos sin hijos"],
    branches: ["Ramas", "Nodos intermedios con al menos un hijo"],
    degree: ["Grado", "Máximo de hijos que tiene algún nodo"],
    order: ["Orden", "Máximo de hijos permitido (2 = binario)"],
  },
};

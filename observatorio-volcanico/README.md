# Observatorio Volcánico — Árboles binarios de búsqueda

Trabajo de **Estructura de Datos** (Cuarto Semestre, Universidad Cooperativa de Colombia) sobre la unidad de *Árboles* (`Arboles.pdf`).

## 1. Caso de estudio

Un **observatorio volcánico** mantiene un registro de volcanes con su altitud y su nivel de alerta (Verde, Amarillo, Naranja, Rojo). Los operadores necesitan, con el registro creciendo y cambiando todo el tiempo:

| Necesidad | Operación | Árbol |
|---|---|---|
| Ver el estado de un volcán por su nombre | `search` | árbol por **nombre** |
| Registrar un volcán nuevo o actualizar su alerta | `insert` | árbol por **nombre** |
| Listar los volcanes de menor a mayor altitud | recorrido inorden | árbol por **altitud** |
| Consultar los volcanes entre dos altitudes (p. ej. nevados sobre 5.000 m) | búsqueda por rango | árbol por **altitud** |

**¿Por qué un árbol y no una lista?** En una lista, buscar un volcán exige revisarlos uno por uno (O(n)). En un árbol binario de búsqueda cada comparación descarta una rama completa: con un árbol equilibrado basta con ~log₂(n) comparaciones. El caso no es una agenda ni una lista de números: aprovecha dos órdenes distintos (texto y número) sobre los mismos datos, y la consulta por rango muestra cómo se **podan subárboles** enteros.

> Los volcanes y niveles de alerta incluidos son **datos de ejemplo con fines académicos**, no valores oficiales de monitoreo.

## 2. Relación con las diapositivas

El código del backend reutiliza el de las diapositivas (`backend/app/structures.py`):

| Diapositivas | Este proyecto |
|---|---|
| 21–23 `Node` / `Phonebook` (`insert`, `search`) | `VolcanoNode` / `VolcanoRegistry`; `phone_number` pasa a ser `alert_level` |
| 24–26 `Node` / `BinaryTree` (`add`, `add_recursive`, `in_order_asc`) | `AltitudeNode` / `AltitudeTree` |
| 7–12 raíz, rama, hoja, altura, peso, orden, grado | calculados por el backend y mostrados en vivo en la interfaz |
| 14–16 árbol AVL | se indica si el árbol está equilibrado (diferencia de alturas ≤ 1) |

Extensiones propias (marcadas en el código): eliminar nodos, recorridos preorden / postorden / por niveles, trazado del camino recorrido, búsqueda por rango y métricas del árbol.

Decisiones de diseño:
- Una clave repetida en el árbol por nombre **actualiza** el valor (como en la agenda); en el árbol por altitud, los iguales van a la derecha (como en `add_recursive`).
- Los nombres se normalizan (espacios y mayúsculas) en la capa de servicio para que «galeras» y «Galeras» sean el mismo volcán.
- Máximo de 100 volcanes para mantener acotada la recursión.

## 3. Estructura

```
observatorio-volcanico/
├── backend/            Python + FastAPI
│   ├── app/
│   │   ├── structures.py   árboles (código de las diapositivas + extensiones)
│   │   ├── service.py      mantiene ambos árboles sincronizados, serializa
│   │   └── main.py         API REST
│   └── tests/              pytest (14 pruebas)
└── frontend/           React + Vite (interfaz en español)
    └── src/
        ├── components/     TreeCanvas, ManagePanel, StatsPanel, ...
        ├── hooks/          useStepper (animación paso a paso)
        ├── lib/            layout del árbol, colores
        └── i18n/es.js      textos de la interfaz
```

El código (clases, funciones, variables, API) está en **inglés**; la interfaz que ve el usuario está en **español**.

## 4. API

| Método y ruta | Descripción |
|---|---|
| `GET /api/state` | Volcanes, ambos árboles, métricas y recorridos |
| `POST /api/volcanoes` | Inserta o actualiza (devuelve el camino recorrido en cada árbol) |
| `DELETE /api/volcanoes/{name}` | Elimina de ambos árboles |
| `GET /api/search?name=` | Búsqueda por nombre con el camino y n.º de comparaciones |
| `GET /api/altitude-range?low=&high=` | Volcanes en el rango y nodos visitados |
| `POST /api/reset` | Restablece los datos de ejemplo |

Documentación interactiva: http://127.0.0.1:8000/docs

## 5. Cómo ejecutarlo

Requisitos: Python 3.10+ y Node.js 18+.

**Backend** (terminal 1):

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```

**Frontend** (terminal 2):

```bash
cd frontend
npm install
npm run dev
```

Abre la URL que muestre Vite (normalmente http://localhost:5173). El frontend redirige `/api` al backend en el puerto 8000.

**Pruebas del backend:**

```bash
cd backend
python -m pytest
```

## 6. Interfaz

- Diseño *glassmorphism / liquid glass*: paneles de vidrio translúcido con desenfoque sobre un fondo degradado animado que cubre toda la página, con los azules, turquesas y verdes de la imagen de la paleta, con alternativa sólida si el navegador no soporta `backdrop-filter` o el usuario pide menos transparencia.
- **Árbol animado**: los nodos se insertan con una animación de resorte, el árbol se reacomoda al cambiar y los caminos de búsqueda, inserción y rango se iluminan paso a paso.
- Colores de nodo como en las diapositivas: raíz, rama y hoja. El nivel de alerta se muestra con una insignia con letra (V · A · N · R), no solo con color.
- Recorridos reproducibles con numeración sobre cada nodo.
- Tarjetas con ligera inclinación 3D al pasar el mouse, zoom del árbol y teclado completo (los nodos son botones enfocables).
- Hero editorial: operaciones numeradas (01 · 02 · 03), pista de scroll, anillos concéntricos raíz → rama → hoja que giran alrededor de un volcán con parallax (inspirado en el estilo de chandebootcamp.com).
- «Agenda de recorridos», aparición de secciones al hacer scroll (solo CSS), y botones para preguntarle a una IA sobre árboles.
- Respeta `prefers-reduced-motion`.
- Diseño adaptable a pantallas pequeñas.

"""Observatory logic: keeps both trees and the volcano records in sync."""

from .structures import (
    AltitudeTree,
    VolcanoRegistry,
    degree,
    height,
    is_balanced,
    traverse,
    weight,
)

ALERT_LEVELS = ("Verde", "Amarillo", "Naranja", "Rojo")
MAX_VOLCANOES = 100
TRAVERSALS = ("inorder", "preorder", "postorder", "levelorder")

# Illustrative sample data (not official monitoring values).
SEED_VOLCANOES = [
    ("Galeras", 4276, "Amarillo", "Nariño"),
    ("Cumbal", 4764, "Amarillo", "Nariño"),
    ("Puracé", 4650, "Amarillo", "Cauca"),
    ("Azufral", 4070, "Verde", "Nariño"),
    ("Doña Juana", 4250, "Verde", "Nariño"),
    ("Nevado del Huila", 5364, "Amarillo", "Huila"),
    ("Sotará", 4580, "Verde", "Cauca"),
    ("Cerro Machín", 2750, "Amarillo", "Tolima"),
    ("Chiles", 4748, "Verde", "Nariño"),
    ("Nevado del Ruiz", 5321, "Amarillo", "Caldas"),
    ("Nevado del Tolima", 5200, "Verde", "Tolima"),
    ("Cerro Negro", 4470, "Verde", "Nariño"),
]


class ObservatoryError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def clean_name(name):
    return " ".join(name.split())


class Observatory:
    def __init__(self):
        self.reset()

    def reset(self):
        self.registry = VolcanoRegistry()
        self.altitudes = AltitudeTree()
        self.records = {}
        for name, altitude, alert_level, department in SEED_VOLCANOES:
            self.upsert(name, altitude, alert_level, department)

    def _find(self, name):
        return self.records.get(clean_name(name).casefold())

    def upsert(self, name, altitude, alert_level, department=""):
        name = clean_name(name)
        existing = self._find(name)
        if existing is None and len(self.records) >= MAX_VOLCANOES:
            raise ObservatoryError(f"El registro admite como máximo {MAX_VOLCANOES} volcanes.")

        if existing is None:
            path_name = self.registry.search_path(name)
            path_altitude = self.altitudes.add_path(altitude)
            action = "created"
        else:
            name = existing["name"]
            path_name = self.registry.search_path(name)
            self.altitudes.remove(existing["altitude"], name)
            path_altitude = self.altitudes.add_path(altitude)
            action = "updated"

        self.registry.insert(name, alert_level)
        self.altitudes.add(altitude, name)
        self.records[name.casefold()] = {
            "name": name,
            "altitude": altitude,
            "alert_level": alert_level,
            "department": department.strip(),
        }
        return {"action": action, "name": name, "path_name": path_name, "path_altitude": path_altitude}

    def remove(self, name):
        existing = self._find(name)
        if existing is None:
            raise ObservatoryError(f"No existe un volcán llamado «{clean_name(name)}».", 404)
        self.registry.remove(existing["name"])
        self.altitudes.remove(existing["altitude"], existing["name"])
        del self.records[existing["name"].casefold()]
        return {"action": "removed", "name": existing["name"]}

    def search(self, name):
        name = clean_name(name)
        existing = self._find(name)
        lookup = existing["name"] if existing else name
        path = self.registry.search_path(lookup)
        alert_level = self.registry.search(lookup)
        return {
            "found": alert_level is not None,
            "record": existing,
            "path": path,
            "comparisons": len(path),
            "total": len(self.records),
        }

    def altitude_range(self, low, high):
        if low > high:
            raise ObservatoryError("La altitud mínima no puede superar la máxima.")
        found, visited = self.altitudes.range_search(low, high)
        return {
            "results": [self.records[n.label.casefold()] for n in found],
            "visited": [n.label for n in visited],
            "total": len(self.records),
        }

    # --- serialization ----------------------------------------------------

    def _serialize(self, node, key_of, label_of, level=1):
        if node is None:
            return None
        kind = "root" if level == 1 else ("leaf" if degree(node) == 0 else "branch")
        return {
            "id": label_of(node),
            "key": key_of(node),
            "level": level,
            "kind": kind,
            "degree": degree(node),
            "left": self._serialize(node.left, key_of, label_of, level + 1),
            "right": self._serialize(node.right, key_of, label_of, level + 1),
        }

    def _tree_view(self, root, key_of, label_of):
        nodes = traverse(root, "inorder")
        return {
            "root": self._serialize(root, key_of, label_of),
            "stats": {
                "height": height(root),
                "weight": weight(root),
                "leaves": sum(1 for n in nodes if degree(n) == 0),
                "branches": sum(1 for n in nodes if n is not root and degree(n) > 0),
                "degree": max((degree(n) for n in nodes), default=0),
                "order": 2,
                "balanced": is_balanced(root),
            },
            "traversals": {
                kind: [label_of(n) for n in traverse(root, kind)] for kind in TRAVERSALS
            },
        }

    def state(self):
        by_name = self._tree_view(self.registry.root, lambda n: n.name, lambda n: n.name)
        by_altitude = self._tree_view(
            self.altitudes.root, lambda n: n.value, lambda n: n.label
        )
        return {
            "volcanoes": sorted(self.records.values(), key=lambda r: r["name"]),
            "trees": {"name": by_name, "altitude": by_altitude},
        }

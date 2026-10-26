// Backend code taken from the course slides (backend/app/structures.py).
export const snippets = {
  search: {
    label: "search (por nombre)",
    note: "Agenda telefónica, diapositiva 22: cada comparación descarta una rama completa.",
    code: `def search(self, name):
    current = self.root
    while current is not None:
        if name == current.name:
            return current.alert_level
        elif name < current.name:
            current = current.left
        else:
            current = current.right
    return None`,
  },
  insert: {
    label: "add (por altitud)",
    note: "Ordenamiento, diapositiva 25: los menores van a la izquierda, los demás a la derecha.",
    code: `def add_recursive(self, value, current_node, label=None):
    if value < current_node.value:
        if current_node.left is None:
            current_node.left = AltitudeNode(value, label)
        else:
            self.add_recursive(value, current_node.left, label)
    else:
        if current_node.right is None:
            current_node.right = AltitudeNode(value, label)
        else:
            self.add_recursive(value, current_node.right, label)`,
  },
  inorder: {
    label: "in_order_asc",
    note: "Recorrido inorden: entrega los volcanes de menor a mayor altitud.",
    code: `def in_order_asc(self, current_node, result=None):
    if result is None:
        result = []
    if current_node is not None:
        self.in_order_asc(current_node.left, result)
        result.append(current_node)
        self.in_order_asc(current_node.right, result)
    return result`,
  },
};

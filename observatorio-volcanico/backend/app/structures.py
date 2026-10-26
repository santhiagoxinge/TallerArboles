"""Binary search trees used by the volcano observatory.

The first two classes follow the code shown in the slides:

* ``VolcanoNode`` / ``VolcanoRegistry``  ->  ``Node`` / ``Phonebook`` (slides 21-23)
  Tree ordered by volcano *name*; inserting an existing name updates its alert level.
* ``AltitudeNode`` / ``AltitudeTree``    ->  ``Node`` / ``BinaryTree`` (slides 24-26)
  Tree ordered by *altitude*, with the in-order traversal of the slides.

Everything beyond the slide code (remove, other traversals, height, weight...) is
marked as an extension.
"""

from collections import deque


class VolcanoNode:
    def __init__(self, name, alert_level):
        self.name = name
        self.alert_level = alert_level
        self.left = None
        self.right = None


class VolcanoRegistry:
    def __init__(self):
        self.root = None

    def insert(self, name, alert_level):
        new_node = VolcanoNode(name, alert_level)

        if self.root is None:
            self.root = new_node
        else:
            current = self.root
            while True:
                if name < current.name:
                    if current.left is None:
                        current.left = new_node
                        break
                    else:
                        current = current.left
                elif name > current.name:
                    if current.right is None:
                        current.right = new_node
                        break
                    else:
                        current = current.right
                else:
                    current.alert_level = alert_level
                    break

    def search(self, name):
        current = self.root
        while current is not None:
            if name == current.name:
                return current.alert_level
            elif name < current.name:
                current = current.left
            else:
                current = current.right
        return None

    # --- extensions -------------------------------------------------------

    def search_path(self, name):
        """Names visited while looking for ``name`` (same walk as ``search``)."""
        path = []
        current = self.root
        while current is not None:
            path.append(current.name)
            if name == current.name:
                break
            current = current.left if name < current.name else current.right
        return path

    def remove(self, name):
        self.root, removed = self._remove(self.root, name)
        return removed

    def _remove(self, node, name):
        if node is None:
            return None, False
        if name < node.name:
            node.left, removed = self._remove(node.left, name)
            return node, removed
        if name > node.name:
            node.right, removed = self._remove(node.right, name)
            return node, removed
        if node.left is None:
            return node.right, True
        if node.right is None:
            return node.left, True
        successor = node.right
        while successor.left is not None:
            successor = successor.left
        node.name, node.alert_level = successor.name, successor.alert_level
        node.right, _ = self._remove(node.right, successor.name)
        return node, True


class AltitudeNode:
    def __init__(self, value, label=None):
        self.value = value
        self.label = label
        self.left = None
        self.right = None


class AltitudeTree:
    def __init__(self):
        self.root = None

    def add(self, value, label=None):
        new_node = AltitudeNode(value, label)
        if self.root is None:
            self.root = new_node
        else:
            self.add_recursive(value, self.root, label)

    def add_recursive(self, value, current_node, label=None):
        if value < current_node.value:
            if current_node.left is None:
                current_node.left = AltitudeNode(value, label)
            else:
                self.add_recursive(value, current_node.left, label)
        else:
            if current_node.right is None:
                current_node.right = AltitudeNode(value, label)
            else:
                self.add_recursive(value, current_node.right, label)

    def in_order_asc(self, current_node, result=None):
        """Slide traversal; collects into ``result`` instead of printing."""
        if result is None:
            result = []
        if current_node is not None:
            self.in_order_asc(current_node.left, result)
            result.append(current_node)
            self.in_order_asc(current_node.right, result)
        return result

    # --- extensions -------------------------------------------------------

    def range_search(self, low, high):
        """Nodes with low <= value <= high, plus every node visited on the way.

        Subtrees that cannot contain the range are skipped, which is the
        advantage of the tree over scanning a list.
        """
        found, visited = [], []

        def walk(node):
            if node is None:
                return
            visited.append(node)
            if low < node.value:
                walk(node.left)
            if low <= node.value <= high:
                found.append(node)
            if high >= node.value:
                walk(node.right)

        walk(self.root)
        return found, visited

    def add_path(self, value):
        """Labels visited while inserting ``value`` (call before ``add``)."""
        path = []
        current = self.root
        while current is not None:
            path.append(current.label)
            current = current.left if value < current.value else current.right
        return path

    def remove(self, value, label):
        self.root, removed = self._remove(self.root, value, label)
        return removed

    def _remove(self, node, value, label):
        if node is None:
            return None, False
        if value < node.value:
            node.left, removed = self._remove(node.left, value, label)
            return node, removed
        if value > node.value or node.label != label:
            node.right, removed = self._remove(node.right, value, label)
            return node, removed
        if node.left is None:
            return node.right, True
        if node.right is None:
            return node.left, True
        successor = node.right
        while successor.left is not None:
            successor = successor.left
        node.value, node.label = successor.value, successor.label
        node.right, _ = self._remove(node.right, successor.value, successor.label)
        return node, True


# --- metrics from the slides (height, weight, order, degree) ---------------

def height(node):
    """Number of levels: the root is level 1 (slide 9)."""
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))


def weight(node):
    """Total number of nodes (slide 10)."""
    if node is None:
        return 0
    return 1 + weight(node.left) + weight(node.right)


def traverse(root, kind):
    """Nodes of any binary tree in the requested order (works on both trees)."""
    result = []

    def walk(node):
        if node is None:
            return
        if kind == "preorder":
            result.append(node)
        walk(node.left)
        if kind == "inorder":
            result.append(node)
        walk(node.right)
        if kind == "postorder":
            result.append(node)

    if kind == "levelorder":
        queue = deque([root] if root else [])
        while queue:
            node = queue.popleft()
            result.append(node)
            queue.extend(child for child in (node.left, node.right) if child)
    else:
        walk(root)
    return result


def degree(node):
    """Number of children of a node (slide 12)."""
    return (node.left is not None) + (node.right is not None)


def is_balanced(node):
    """AVL condition from slide 15: subtree heights differ by at most 1."""
    if node is None:
        return True
    return (
        abs(height(node.left) - height(node.right)) <= 1
        and is_balanced(node.left)
        and is_balanced(node.right)
    )

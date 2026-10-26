from app.structures import (
    AltitudeTree,
    VolcanoRegistry,
    height,
    is_balanced,
    traverse,
    weight,
)


def test_slide_phonebook_example():
    book = VolcanoRegistry()
    for name, level in [("Jhonatan", "111"), ("Andrea", "222"), ("Carlos", "333"),
                        ("Diana", "444"), ("Ivan", "555")]:
        book.insert(name, level)
    assert book.search("Diana") == "444"
    assert book.search("Ivan") == "555"
    assert book.search("Jhonatan") == "111"
    assert book.search("Nadie") is None


def test_insert_existing_name_updates_value():
    registry = VolcanoRegistry()
    registry.insert("Galeras", "Verde")
    registry.insert("Galeras", "Naranja")
    assert registry.search("Galeras") == "Naranja"
    assert weight(registry.root) == 1


def test_slide_binary_tree_in_order():
    tree = AltitudeTree()
    for value in [5, 2, 7, 1, 3, 6, 8]:
        tree.add(value)
    assert [n.value for n in tree.in_order_asc(tree.root)] == [1, 2, 3, 5, 6, 7, 8]
    assert height(tree.root) == 3
    assert weight(tree.root) == 7
    assert is_balanced(tree.root)


def test_traversal_orders():
    tree = AltitudeTree()
    for value in [5, 2, 7, 1, 3, 6, 8]:
        tree.add(value, str(value))
    labels = lambda kind: [n.label for n in traverse(tree.root, kind)]
    assert labels("preorder") == list("5213768")
    assert labels("postorder") == list("1326875")
    assert labels("levelorder") == list("5271368")


def test_degenerate_tree_is_unbalanced():
    tree = AltitudeTree()
    for value in range(1, 6):
        tree.add(value)
    assert height(tree.root) == 5
    assert not is_balanced(tree.root)


def test_remove_node_with_two_children():
    registry = VolcanoRegistry()
    for name in ["M", "F", "T", "C", "H", "P", "W"]:
        registry.insert(name, "Verde")
    assert registry.remove("M")
    assert [n.name for n in traverse(registry.root, "inorder")] == list("CFHPTW")
    assert not registry.remove("Z")


def test_remove_handles_duplicate_altitudes():
    tree = AltitudeTree()
    tree.add(100, "a")
    tree.add(100, "b")
    tree.add(100, "c")
    assert tree.remove(100, "b")
    assert sorted(n.label for n in traverse(tree.root, "inorder")) == ["a", "c"]


def test_range_search_prunes_subtrees():
    tree = AltitudeTree()
    for value in [50, 30, 70, 20, 40, 60, 80]:
        tree.add(value, str(value))
    found, visited = tree.range_search(55, 75)
    assert [n.value for n in found] == [60, 70]
    assert len(visited) < 7

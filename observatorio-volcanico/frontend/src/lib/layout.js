export const X_GAP = 104;
export const Y_GAP = 104;
export const PAD_X = 64;
export const PAD_TOP = 48;
export const PAD_BOTTOM = 72;

/**
 * Tidy layout for a binary search tree: x follows the in-order position
 * (so keys read left to right), y follows the level.
 */
export function computeLayout(root) {
  const nodes = [];
  const edges = [];
  let column = 0;

  function walk(node, parent) {
    if (!node) return;
    walk(node.left, node);
    const placed = {
      id: node.id,
      key: node.key,
      kind: node.kind,
      level: node.level,
      degree: node.degree,
      x: PAD_X + column * X_GAP,
      y: PAD_TOP + (node.level - 1) * Y_GAP,
    };
    column += 1;
    nodes.push(placed);
    if (parent) edges.push({ from: parent.id, to: node.id });
    walk(node.right, node);
  }

  walk(root, null);

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const maxLevel = nodes.reduce((m, n) => Math.max(m, n.level), 1);
  return {
    nodes,
    edges: edges.map((e) => ({ ...e, a: byId.get(e.from), b: byId.get(e.to) })),
    width: PAD_X * 2 + Math.max(column - 1, 0) * X_GAP,
    height: PAD_TOP + (maxLevel - 1) * Y_GAP + PAD_BOTTOM,
  };
}

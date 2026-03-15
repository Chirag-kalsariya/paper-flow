import type { TNode } from 'platejs';
import type { Value } from 'platejs';

// ─── word-count.ts ────────────────────────────────────────────────────────────
//
// Recursively walks the Plate/Slate node tree to count words.
//
// Algorithm:
//   - Only TText leaf nodes (nodes with a `text` string property) carry words.
//   - Split each text node on any run of whitespace.
//   - Filter out empty strings (handles leading/trailing/multiple spaces).
//   - Sum across all leaves.
//
// Empty editor (Value = []) → 0.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the total word count for the given Plate editor value.
 *
 * @param nodes - The Plate editor `Value` (top-level node array)
 * @returns Non-negative integer word count
 */
export function countWords(nodes: Value): number {
  return nodes.reduce<number>((total, node) => total + countInNode(node), 0);
}

// ── Internal recursive helper ─────────────────────────────────────────────────

function countInNode(node: TNode): number {
  // Leaf node — has a `text` string property
  if (typeof (node as { text?: unknown }).text === 'string') {
    const text = (node as { text: string }).text;
    return text.split(/\s+/).filter(Boolean).length;
  }

  // Element node — recurse into children
  const children = (node as { children?: TNode[] }).children;
  if (Array.isArray(children)) {
    return children.reduce<number>((sum, child) => sum + countInNode(child), 0);
  }

  return 0;
}

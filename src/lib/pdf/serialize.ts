import type { TElement, TNode, TText, Value } from 'platejs';

// ─── PDF IR types ─────────────────────────────────────────────────────────────
//
// Intermediate representation between Plate JSON and @react-pdf/renderer JSX.
// Using a plain-object IR (instead of JSX directly) keeps serialization logic
// testable without a React rendering environment and safe for future Worker
// postMessage across thread boundaries.
//
// Structure:
//
//   Value (Plate JSON)
//     └── PDFBlock[]       one per block-level node
//           └── PDFLeaf[]  one per inline text run
//
// ─────────────────────────────────────────────────────────────────────────────

export type PDFBlockType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'blockquote'
  | 'code_block'
  | 'hr';

export interface PDFLeaf {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
}

export interface PDFBlock {
  type: PDFBlockType;
  /** Empty for hr nodes */
  leaves: PDFLeaf[];
}

// Supported block types — anything else is skipped with a warning.
const BLOCK_TYPES = new Set<string>([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'blockquote', 'code_block', 'hr',
]);

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert a Plate editor Value into a flat array of PDFBlocks.
 *
 * - Unknown block types are logged and skipped.
 * - Nested block nodes (e.g. list items inside a list) are flattened
 *   by walking children until leaf text nodes are found.
 * - Inline marks (bold, italic, underline, code) are preserved per leaf.
 */
export function serializePlateToRPdf(nodes: Value): PDFBlock[] {
  const blocks: PDFBlock[] = [];
  for (const node of nodes) {
    collectBlocks(node as TNode, blocks);
  }
  return blocks;
}

// ─── Internals ────────────────────────────────────────────────────────────────

function collectBlocks(node: TNode, acc: PDFBlock[]): void {
  // Text leaf — shouldn't appear at top level, but guard anyway
  if (isTextNode(node)) return;

  const el = node as TElement;
  const type = el.type as string;

  if (!BLOCK_TYPES.has(type)) {
    // For unknown container nodes, recurse into children to avoid dropping text
    if (Array.isArray(el.children) && el.children.length > 0) {
      for (const child of el.children as TNode[]) {
        collectBlocks(child, acc);
      }
    } else {
      console.warn(`[PaperFlow PDF] Unknown node type "${type}" — skipped.`);
    }
    return;
  }

  if (type === 'hr') {
    acc.push({ type: 'hr', leaves: [] });
    return;
  }

  const leaves = collectLeaves(el.children as TNode[]);
  acc.push({ type: type as PDFBlockType, leaves });
}

function collectLeaves(nodes: TNode[]): PDFLeaf[] {
  const leaves: PDFLeaf[] = [];

  for (const node of nodes) {
    if (isTextNode(node)) {
      const text = node as TText;
      const leaf: PDFLeaf = { text: (text as { text: string }).text };
      if ((text as { bold?: boolean }).bold) leaf.bold = true;
      if ((text as { italic?: boolean }).italic) leaf.italic = true;
      if ((text as { underline?: boolean }).underline) leaf.underline = true;
      if ((text as { code?: boolean }).code) leaf.code = true;
      leaves.push(leaf);
    } else {
      // Nested inline element — recurse (e.g. link, mention)
      const el = node as TElement;
      if (Array.isArray(el.children)) {
        leaves.push(...collectLeaves(el.children as TNode[]));
      }
    }
  }

  return leaves;
}

function isTextNode(node: TNode): boolean {
  return typeof (node as { text?: unknown }).text === 'string';
}

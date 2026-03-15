'use client';

// ─── plate-config.tsx ─────────────────────────────────────────────────────────
//
// Central Plate.js plugin + component configuration for PaperFlow.
//
// PLATE_PLUGINS  — passed directly to usePlateEditor({ plugins: PLATE_PLUGINS })
// PLATE_COMPONENTS — node-type → component map (used by PDF exporter, tests, etc.)
//
// All plugins are constructed at module level (not inside React components) so
// they are stable across re-renders and hot-module reloads.
//
// Plugin dependency graph:
//
//  BasicBlocksKit   ──▶  ParagraphPlugin, H1-H6, BlockquotePlugin, HrPlugin
//  BasicMarksKit    ──▶  Bold, Italic, Underline, Strikethrough, Code, etc.
//  IndentPlugin     ──▶  Provides per-node indent levels (required by ListPlugin)
//  ListPlugin       ──▶  Indent-based bullet + numbered lists
//  CodeBlockPlugin  ──▶  Fenced code blocks  (node type: "code_block")
//  CodeLinePlugin   ──▶  Individual lines inside code blocks
//  AutoformatPlugin ──▶  Markdown shortcuts: # → H1, ## → H2, > → blockquote,
//                         **text** → bold, _text_ → italic, `text` → code
//
// ─────────────────────────────────────────────────────────────────────────────

import { AutoformatPlugin } from '@platejs/autoformat';
import { IndentPlugin } from '@platejs/indent/react';
import { ListPlugin } from '@platejs/list/react';
import { CodeBlockPlugin, CodeLinePlugin } from '@platejs/code-block/react';
import type { PlateElementProps } from 'platejs/react';
import { PlateElement } from 'platejs/react';

import { BasicBlocksKit } from '@/components/editor/plugins/basic-blocks-kit';
import { BasicMarksKit } from '@/components/editor/plugins/basic-marks-kit';

// Import the pre-installed UI components for PLATE_COMPONENTS map
import { ParagraphElement } from '@/components/ui/paragraph-node';
import {
  H1Element,
  H2Element,
  H3Element,
  H4Element,
  H5Element,
  H6Element,
} from '@/components/ui/heading-node';
import { BlockquoteElement } from '@/components/ui/blockquote-node';
import { HrElement } from '@/components/ui/hr-node';
import { CodeLeaf } from '@/components/ui/code-node';
import { HighlightLeaf } from '@/components/ui/highlight-node';
import { KbdLeaf } from '@/components/ui/kbd-node';

// ─── Inline components for newly-added node types ─────────────────────────────

/** Renders a fenced code block — monospace, muted background, rounded */
function CodeBlockElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="pre"
      className="my-2 overflow-x-auto rounded-md bg-muted px-4 py-3 font-mono text-sm"
      {...props}
    />
  );
}

/** Renders a single line inside a code block */
function CodeLineElement(props: PlateElementProps) {
  return (
    <PlateElement as="div" className="relative" {...props} />
  );
}

// ─── Autoformat rules ─────────────────────────────────────────────────────────
//
// Markdown-style shortcuts that fire when the trigger character (space) is
// typed at the start of a block after the matched prefix.
//
//   # ·     → h1      ## ·    → h2     ### ·   → h3
//   #### ·  → h4      ##### · → h5     ###### · → h6
//   > ·     → blockquote
//   **…**   → bold    _…_     → italic  `…`     → inline code
//
// Indent-list shortcuts (- · and 1. ·) are omitted because ListPlugin uses
// an indent-based model; toggling requires setNodes calls that need runtime
// editor context — add as follow-up with a format() callback.

const AUTOFORMAT_RULES = [
  // ── Heading shortcuts ───────────────────────────────────────────────────────
  { mode: 'block' as const, type: 'h1', match: '# ' },
  { mode: 'block' as const, type: 'h2', match: '## ' },
  { mode: 'block' as const, type: 'h3', match: '### ' },
  { mode: 'block' as const, type: 'h4', match: '#### ' },
  { mode: 'block' as const, type: 'h5', match: '##### ' },
  { mode: 'block' as const, type: 'h6', match: '###### ' },
  // ── Blockquote shortcut ─────────────────────────────────────────────────────
  { mode: 'block' as const, type: 'blockquote', match: '> ' },
  // ── Inline mark shortcuts ───────────────────────────────────────────────────
  { mode: 'mark' as const, type: ['bold'], match: ['**', '__'] },
  { mode: 'mark' as const, type: ['italic'], match: ['*', '_'] },
  { mode: 'mark' as const, type: ['code'], match: '`' },
  { mode: 'mark' as const, type: ['bold', 'italic'], match: ['***', '___'] },
];

// ─── PLATE_PLUGINS ────────────────────────────────────────────────────────────

export const PLATE_PLUGINS = [
  // Block nodes: paragraph, headings, blockquote, horizontal rule
  ...BasicBlocksKit,
  // Inline marks: bold, italic, underline, strikethrough, code, highlight, kbd
  ...BasicMarksKit,
  // Indent support — required by ListPlugin for indent-based lists
  IndentPlugin,
  // Bullet + numbered lists (indent-based; toggle via toolbar or keyboard)
  ListPlugin,
  // Fenced code blocks with optional syntax highlighting
  CodeBlockPlugin.withComponent(CodeBlockElement),
  CodeLinePlugin.withComponent(CodeLineElement),
  // Markdown shortcuts: # → heading, **…** → bold, `…` → code, etc.
  AutoformatPlugin.configure({ options: { rules: AUTOFORMAT_RULES } }),
];

// ─── PLATE_COMPONENTS ─────────────────────────────────────────────────────────
//
// Maps Plate node type keys to React components.
// Used by the PDF serializer, static renderer, and tests.
//
// Note: marks (bold, italic…) are leaf components — they render spans, not
// block elements, so they are keyed by their mark property name.

export const PLATE_COMPONENTS = {
  // Block elements
  p: ParagraphElement,
  h1: H1Element,
  h2: H2Element,
  h3: H3Element,
  h4: H4Element,
  h5: H5Element,
  h6: H6Element,
  blockquote: BlockquoteElement,
  hr: HrElement,
  code_block: CodeBlockElement,
  code_line: CodeLineElement,
  // Leaf (mark) components
  code: CodeLeaf,
  highlight: HighlightLeaf,
  kbd: KbdLeaf,
} as const;

export type PlateComponentKey = keyof typeof PLATE_COMPONENTS;

import type { Value } from "platejs";
import type { TemplateType, PFFormatting } from "./types";

// ─── Default formatting per template ─────────────────────────────────────────

export const DEFAULT_FORMATTING: PFFormatting = {
  fontFamily: "times-new-roman",
  fontSize: 12,
  lineSpacing: 2,
  margins: { top: 1, bottom: 1, left: 1, right: 1 },
};

// ─── Template default content (Slate/Plate JSON) ──────────────────────────────
//
// Node types used here must match the plugin keys installed by editor-basic:
//   h1, h2, h3, p, blockquote
//
// Each node must have a `children` array of at least one text leaf.
// Empty text leaf: { text: "" }

export const TEMPLATE_DEFAULTS: Record<TemplateType, Value> = {
  // ── Essay ──────────────────────────────────────────────────────────────────
  // H1 title + body paragraph with placeholder. Students replace these.
  essay: [
    {
      type: "h1",
      children: [{ text: "Untitled Essay" }],
    },
    {
      type: "p",
      children: [
        {
          text: "Start writing your essay here. Replace this text with your introduction.",
        },
      ],
    },
  ],

  // ── Lab Report ─────────────────────────────────────────────────────────────
  // Standard lab report structure: H1 title + 4 H2 sections.
  // Each section has an empty paragraph so the cursor lands in the right place.
  "lab-report": [
    {
      type: "h1",
      children: [{ text: "Untitled Lab Report" }],
    },
    {
      type: "h2",
      children: [{ text: "Introduction" }],
    },
    {
      type: "p",
      children: [{ text: "" }],
    },
    {
      type: "h2",
      children: [{ text: "Method" }],
    },
    {
      type: "p",
      children: [{ text: "" }],
    },
    {
      type: "h2",
      children: [{ text: "Results" }],
    },
    {
      type: "p",
      children: [{ text: "" }],
    },
    {
      type: "h2",
      children: [{ text: "Discussion" }],
    },
    {
      type: "p",
      children: [{ text: "" }],
    },
  ],

  // ── Blank ──────────────────────────────────────────────────────────────────
  // Single empty paragraph — cursor ready to type immediately.
  blank: [
    {
      type: "p",
      children: [{ text: "" }],
    },
  ],
};

// ─── Template display names (for UI) ─────────────────────────────────────────

export const TEMPLATE_LABELS: Record<TemplateType, string> = {
  essay: "Essay",
  "lab-report": "Lab Report",
  blank: "Blank",
};

export const TEMPLATE_DESCRIPTIONS: Record<TemplateType, string> = {
  essay: "Pre-formatted for essays with a title and introduction",
  "lab-report": "Introduction, Method, Results, Discussion sections",
  blank: "Start from scratch",
};

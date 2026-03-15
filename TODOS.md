# PaperFlow — TODOS

Deferred work from the v1 plan review (2026-03-14).
Each item has a clear owner, effort, priority, and context.

---

## P2: PDF Rendering — Web Worker

**What:** Move @react-pdf/renderer export to a Web Worker to prevent UI freeze during large-doc exports.

**Why:** @react-pdf/renderer is CPU-intensive. For 10+ page documents, rendering on the main thread will freeze the editor UI for 1-5 seconds. This degrades the experience at the worst possible moment (user is waiting for their PDF).

**Pros:** Editor remains fully responsive during export; no janky freeze.

**Cons:** Web Workers can't directly use React renderer — requires serializing PDFNodes to a plain data structure, passing via postMessage, rendering in worker context. ~M effort.

**Context:** In v1, export happens on the main thread. Ship v1, instrument export times via Sentry performance, and trigger this work when p99 export time > 2s or user complaints appear. The serialize.ts pipeline (PlateValue → PDFNodes) should be kept pure/serializable from day 1 to make this migration easy. Worker entry: `src/workers/pdf-export.worker.ts`.

**Effort:** M
**Priority:** P2
**Depends on:** v1 PDF export shipped and instrumented

---

## P2: Dashboard Search + Sort

**What:** Search by title, sort by last-modified / created, optional tag/folder grouping.

**Why:** A flat card grid becomes unusable at 30+ documents. Students who use PaperFlow across a semester will hit this.

**Pros:** Makes the app usable long-term; retains power users.

**Cons:** Premature if most users have < 10 documents. Tag/folder adds data model complexity.

**Context:** Current v1 dashboard renders all documents as cards sorted by updatedAt. No search. localStorage schema already stores `createdAt` and `updatedAt` on every document — search and sort can be implemented entirely in-memory without any schema change. Trigger this work when any user reports having trouble finding documents, or when analytics show median document count > 15. Start with title search + sort toggle, defer folders.

**Effort:** M
**Priority:** P2
**Depends on:** Post-launch usage data

---

## P3: Keyboard Shortcut Overlay

**What:** Press `?` anywhere in the editor to show a modal with all available keyboard shortcuts.

**Why:** Plate.js provides Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+1/2/3 (headings), Ctrl+Shift+7 (ordered list), etc. — but these are invisible. Students reach for the toolbar every time instead of learning shortcuts that would make them faster.

**Pros:** High delight, low effort. Makes power users. Students share "did you know you can press Ctrl+1 for Heading?" moments.

**Cons:** Requires maintaining a shortcut registry that stays in sync with the actual Plate.js plugin config — stale shortcuts are worse than no overlay.

**Context:** The shortcut list should be derived from `plate-config.ts` (the single source of plugin configuration), not hardcoded. Design: a `ShortcutRegistry` that each plugin registers into, so the overlay is always accurate. Estimated ~25min for the overlay UI; the registry integration is the interesting part.

**Effort:** S
**Priority:** P3
**Depends on:** plate-config.ts pattern established in v1

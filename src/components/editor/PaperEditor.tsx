'use client';

import dynamic from 'next/dynamic';
import { EditorSkeleton } from './EditorSkeleton';

// ─── PaperEditor ──────────────────────────────────────────────────────────────
//
// Dynamic import wrapper for EditorShell.
//
// EditorShell is wrapped in dynamic({ ssr: false }) because:
//  1. Plate.js uses browser APIs (selection, DOM measurements) at import time
//  2. usePagination uses ResizeObserver and requestIdleCallback
//  3. useAutoSave uses window.addEventListener('beforeunload')
//  4. localStorage access is client-only
//
// The loading skeleton keeps the page looking correct during the JS bundle load.
//
// ─────────────────────────────────────────────────────────────────────────────

const EditorShell = dynamic(
  () => import('./EditorShell').then((m) => ({ default: m.EditorShell })),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

interface PaperEditorProps {
  docId: string;
}

export function PaperEditor({ docId }: PaperEditorProps) {
  return <EditorShell docId={docId} />;
}

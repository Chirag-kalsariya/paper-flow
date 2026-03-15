'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Value } from 'platejs';
import { useDocumentStore } from '@/hooks/useDocumentStore';

// ─── useAutoSave ──────────────────────────────────────────────────────────────
//
// Debounced auto-save for the Plate editor.
//
// Flow:
//
//   Editor change
//       │
//       ▼
//   Debounce 1000ms ──▶ store.update()  ──▶ status = 'saved' (reset to idle after 3s)
//       │                                   on quota error → status = 'error'
//       │
//   beforeunload ──▶ store.saveSync()  (synchronous — async impossible here)
//
// The contentRef always holds the latest value so the beforeunload handler
// can access it without re-registering the effect on every change.
//
// ─────────────────────────────────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  /** The Plate editor value to persist */
  value: Value;
  /** The document id to save to */
  documentId: string;
  /** Current word count (persisted alongside content) */
  wordCount: number;
  /** Debounce delay in ms. Default: 1000 */
  debounceMs?: number;
}

export function useAutoSave({
  value,
  documentId,
  wordCount,
  debounceMs = 1000,
}: UseAutoSaveOptions): { status: SaveStatus } {
  const store = useDocumentStore();
  const [status, setStatus] = useState<SaveStatus>('idle');

  // Always-current refs — prevents stale closure issues in event handlers
  const contentRef = useRef<Value>(value);
  const wordCountRef = useRef<number>(wordCount);
  const documentIdRef = useRef<string>(documentId);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync
  useEffect(() => {
    contentRef.current = value;
    wordCountRef.current = wordCount;
    documentIdRef.current = documentId;
  });

  // ── Debounced async save ───────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(async () => {
      setStatus('saving');
      const ok = await store.update(documentId, {
        content: value,
        wordCount,
      });
      if (ok) {
        setStatus('saved');
        // Reset 'saved' indicator back to idle after 3 seconds
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    }, debounceMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, documentId, wordCount, debounceMs, store]);

  // ── beforeunload sync save ─────────────────────────────────────────────────

  const handleBeforeUnload = useCallback(() => {
    store.saveSync(
      documentIdRef.current,
      contentRef.current,
      wordCountRef.current
    );
  }, [store]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  return { status };
}

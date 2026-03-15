'use client';

import { useMemo } from 'react';
import { useEditorValue } from 'platejs/react';
import { countWords } from '@/lib/editor/word-count';

// ─── useWordCount ─────────────────────────────────────────────────────────────
//
// Reads the current Plate editor value and computes word count.
// Must be called inside a <Plate> context.
//
// Returns:
//   count   - current word count
//   target  - word target from props (optional)
//   percent - count / target * 100, capped at 100, or 0 if no target
//
// ─────────────────────────────────────────────────────────────────────────────

interface UseWordCountOptions {
  /** The word target for this document (from PFDocument.wordTarget) */
  target?: number;
}

interface WordCountResult {
  count: number;
  target: number | undefined;
  percent: number;
}

export function useWordCount({ target }: UseWordCountOptions = {}): WordCountResult {
  const value = useEditorValue();

  const count = useMemo(() => countWords(value ?? []), [value]);

  const percent = useMemo(() => {
    if (!target || target <= 0) return 0;
    return Math.min(100, Math.round((count / target) * 100));
  }, [count, target]);

  return { count, target, percent };
}

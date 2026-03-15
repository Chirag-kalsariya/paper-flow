'use client';

import { useEffect, useRef, useState } from 'react';
import { pageBreaksFromHeight } from '@/lib/editor/paginator';

// ─── usePagination ────────────────────────────────────────────────────────────
//
// Watches the height of the editor container div via ResizeObserver and
// computes where page-break dividers should be rendered.
//
// The height observation is scheduled via requestIdleCallback (falling back to
// setTimeout(0)) to avoid blocking the main thread during rapid typing.
//
// Usage:
//   const containerRef = useRef<HTMLDivElement>(null);
//   const { pageBreaks } = usePagination(containerRef);
//   // pageBreaks = [1123, 2246, 3369, …]
//
// ─────────────────────────────────────────────────────────────────────────────

interface UsePaginationResult {
  /** Pixel offsets from the container top where page breaks should render */
  pageBreaks: number[];
}

export function usePagination(
  containerRef: React.RefObject<HTMLDivElement | null>
): UsePaginationResult {
  const [pageBreaks, setPageBreaks] = useState<number[]>([]);
  const idleCallbackRef = useRef<ReturnType<typeof requestIdleCallback> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scheduleUpdate = (height: number) => {
      // Cancel any pending idle callback before scheduling a new one
      if (idleCallbackRef.current !== null) {
        cancelIdleCallback(idleCallbackRef.current);
      }

      idleCallbackRef.current = requestIdleCallback(() => {
        setPageBreaks(pageBreaksFromHeight(height));
        idleCallbackRef.current = null;
      });
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        scheduleUpdate(entry.contentRect.height);
      }
    });

    observer.observe(el);
    // Compute initial value immediately
    scheduleUpdate(el.getBoundingClientRect().height);

    return () => {
      observer.disconnect();
      if (idleCallbackRef.current !== null) {
        cancelIdleCallback(idleCallbackRef.current);
      }
    };
  }, [containerRef]);

  return { pageBreaks };
}

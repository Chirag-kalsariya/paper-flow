'use client';

import { useRef } from 'react';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { usePagination } from '@/hooks/usePagination';
import { PAGE_WIDTH_PX, PAGE_HEIGHT_PX, PAGE_PADDING_Y } from '@/lib/editor/paginator';

// ─── PageCanvas ───────────────────────────────────────────────────────────────
//
// Renders the A4 page-like editing surface.
//
// Layout:
//
//   ┌─────────────────────────────────────────┐
//   │  Dark background (#1a1a1a)              │
//   │                                         │
//   │   ┌────────────── 794px ─────────────┐  │
//   │   │  White A4 page (box-shadow)       │  │
//   │   │  padding: 96px                    │  │
//   │   │                                   │  │
//   │   │   <Plate Editor>                  │  │
//   │   │                                   │  │
//   │   ├───────────── break ───────────────┤  │  ← absolute div at px offset
//   │   │                                   │  │
//   │   └───────────────────────────────────┘  │
//   └─────────────────────────────────────────┘
//
// Page breaks are computed by usePagination(), which watches the editor
// container height via ResizeObserver and emits pixel offsets.
// Break dividers are absolutely positioned over the white page surface.
//
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_PADDING_X = 96; // 1 inch in CSS pixels

export function PageCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pageBreaks } = usePagination(containerRef);

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto bg-[#1a1a1a] py-10">
      {/* A4 white page */}
      <div
        ref={containerRef}
        className="relative w-full bg-white shadow-2xl"
        style={{
          width: `${PAGE_WIDTH_PX}px`,
          minHeight: `${PAGE_HEIGHT_PX}px`,
          padding: `${PAGE_PADDING_Y}px ${PAGE_PADDING_X}px`,
        }}
      >
        {/* ── Page break dividers ─────────────────────────────────────────── */}
        {pageBreaks.map((offset) => (
          <PageBreakLine key={offset} topPx={offset} />
        ))}

        {/* ── Plate editor ────────────────────────────────────────────────── */}
        <EditorContainer className="border-none bg-transparent p-0 shadow-none">
          <Editor
            variant="fullWidth"
            placeholder="Start writing…"
            className="min-h-[600px] p-0 focus:outline-none"
          />
        </EditorContainer>
      </div>
    </div>
  );
}

// ─── PageBreakLine ────────────────────────────────────────────────────────────
//
// Absolutely positioned horizontal divider at a pixel offset from the container
// top. The dashed border mimics a page break in Word / Google Docs.

function PageBreakLine({ topPx }: { topPx: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: topPx,
        left: 0,
        right: 0,
        height: '1px',
        background: 'repeating-linear-gradient(90deg, #d1d5db 0, #d1d5db 8px, transparent 8px, transparent 16px)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
}

'use client';

// ─── EditorSkeleton ───────────────────────────────────────────────────────────
//
// Shown while the EditorShell dynamic import is loading.
// Mimics the A4 page layout so the page doesn't flash unstyled content.
//
// ─────────────────────────────────────────────────────────────────────────────

export function EditorSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      {/* Navbar skeleton */}
      <div className="flex h-14 items-center gap-3 border-b bg-background px-4">
        <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      </div>

      {/* Page canvas skeleton */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto bg-[#1a1a1a] py-10">
        <div
          className="w-[794px] rounded-sm bg-white shadow-2xl"
          style={{ minHeight: '1123px', padding: '96px' }}
        >
          {/* Title skeleton */}
          <div className="mb-8 h-9 w-3/4 animate-pulse rounded bg-gray-100" />
          {/* Body lines */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="mb-3 h-4 animate-pulse rounded bg-gray-100"
              style={{ width: i % 4 === 3 ? '60%' : '100%' }}
            />
          ))}
        </div>
      </div>

      {/* Bottom bar skeleton */}
      <div className="flex h-10 items-center justify-between border-t bg-background px-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

'use client';

import type { SaveStatus } from '@/hooks/useAutoSave';

// ─── SaveIndicator ────────────────────────────────────────────────────────────
//
// Renders the auto-save status in the editor bottom bar.
//
// Status → label + colour:
//   idle    → nothing shown
//   saving  → "Saving…"       amber
//   saved   → "Saved"         green   (resets to idle after 3s in useAutoSave)
//   error   → "Save failed"   red
//
// ─────────────────────────────────────────────────────────────────────────────

interface SaveIndicatorProps {
  status: SaveStatus;
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === 'idle') return null;

  const config: Record<
    Exclude<SaveStatus, 'idle'>,
    { label: string; className: string }
  > = {
    saving: { label: 'Saving…', className: 'text-amber-500' },
    saved: { label: 'Saved', className: 'text-green-500' },
    error: { label: 'Save failed', className: 'text-destructive' },
  };

  const { label, className } = config[status as Exclude<SaveStatus, 'idle'>];

  return (
    <span className={`text-xs font-medium transition-colors ${className}`}>
      {label}
    </span>
  );
}

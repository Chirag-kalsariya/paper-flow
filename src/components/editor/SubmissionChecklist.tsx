'use client';

import { useState } from 'react';
import { CheckSquare, Square, FileDown, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PFDocument } from '@/lib/store/types';

// ─── Checklist items ──────────────────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  { id: 'title', label: 'Title is set and clearly describes the document' },
  { id: 'formatting', label: 'Formatting is consistent throughout' },
  { id: 'wordcount', label: 'Word count is at or near your target' },
  { id: 'grammar', label: 'Reviewed for spelling and grammar' },
  { id: 'complete', label: 'All sections are complete and ready to submit' },
] as const;

type ChecklistItemId = (typeof CHECKLIST_ITEMS)[number]['id'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface SubmissionChecklistProps {
  doc: PFDocument;
  onExport: () => Promise<void>;
  children: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SubmissionChecklist({
  doc,
  onExport,
  children,
}: SubmissionChecklistProps) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Set<ChecklistItemId>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Reset checklist state on close
      setChecked(new Set());
      setExporting(false);
      setExportError(false);
    }
  }

  function toggleItem(id: ChecklistItemId) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleExport() {
    setExporting(true);
    setExportError(false);
    try {
      await onExport();
      setOpen(false);
    } catch {
      setExportError(true);
    } finally {
      setExporting(false);
    }
  }

  const allChecked = CHECKLIST_ITEMS.every((item) => checked.has(item.id));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ready to export?</DialogTitle>
          <DialogDescription>
            Check off each item before exporting &ldquo;{doc.title}&rdquo; to PDF.
          </DialogDescription>
        </DialogHeader>

        {/* Checklist */}
        <ul className="space-y-3 py-2" role="list">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = checked.has(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                  onClick={() => toggleItem(item.id)}
                  aria-pressed={isChecked}
                >
                  {isChecked ? (
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {exportError && (
          <p className="text-sm text-destructive">
            Export failed. Please try again.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Keep editing
          </Button>
          <Button
            disabled={!allChecked || exporting}
            onClick={handleExport}
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileDown } from 'lucide-react';
import { Plate, useEditorValue, usePlateEditor } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useWordCount } from '@/hooks/useWordCount';
import { PLATE_PLUGINS } from '@/lib/editor/plate-config';
import { downloadPdf } from '@/lib/pdf/export';
import type { PFDocument } from '@/lib/store/types';

import { EditorSkeleton } from './EditorSkeleton';
import { PageCanvas } from './PageCanvas';
import { SaveIndicator } from './SaveIndicator';
import { SubmissionChecklist } from './SubmissionChecklist';
import { WordCountBar } from './WordCountBar';

// ─── EditorShell ──────────────────────────────────────────────────────────────
//
// Component tree:
//
//   EditorShell (loads doc from store, shows skeleton while loading)
//     └── EditorCanvas (creates Plate editor + Plate context)
//           └── EditorLayout (inside Plate, uses Plate hooks)
//
// This two-level split avoids calling usePlateEditor conditionally — the outer
// shell handles the loading/not-found states, and EditorCanvas is only rendered
// once we have a confirmed PFDocument.
//
// ─────────────────────────────────────────────────────────────────────────────

interface EditorShellProps {
  docId: string;
}

export function EditorShell({ docId }: EditorShellProps) {
  const store = useDocumentStore();
  const router = useRouter();
  const [doc, setDoc] = useState<PFDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    store.get(docId).then((found) => {
      if (!found) {
        router.replace('/');
      } else {
        setDoc(found);
        setLoading(false);
      }
    });
  }, [docId, store, router]);

  if (loading || !doc) return <EditorSkeleton />;

  return <EditorCanvas doc={doc} />;
}

// ─── EditorCanvas ─────────────────────────────────────────────────────────────
//
// Creates the Plate editor instance (must not be rendered conditionally since
// usePlateEditor cannot be called inside conditionals).

function EditorCanvas({ doc }: { doc: PFDocument }) {
  const editor = usePlateEditor({
    plugins: PLATE_PLUGINS,
    value: doc.content,
  });

  return (
    <Plate editor={editor}>
      <EditorLayout doc={doc} />
    </Plate>
  );
}

// ─── EditorLayout ─────────────────────────────────────────────────────────────
//
// Runs inside the Plate context — can use useEditorValue, useWordCount, etc.

function EditorLayout({ doc }: { doc: PFDocument }) {
  const store = useDocumentStore();
  const router = useRouter();

  // ── Title state (inline editing in navbar) ─────────────────────────────────

  const [title, setTitle] = useState(doc.title);
  const titleSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleTitleChange(next: string) {
    setTitle(next);
    // Debounce title save: 800ms
    if (titleSaveTimerRef.current) clearTimeout(titleSaveTimerRef.current);
    titleSaveTimerRef.current = setTimeout(() => {
      store.update(doc.id, { title: next });
    }, 800);
  }

  useEffect(() => {
    return () => {
      if (titleSaveTimerRef.current) clearTimeout(titleSaveTimerRef.current);
    };
  }, []);

  // ── Editor value + auto-save ───────────────────────────────────────────────

  const value = useEditorValue();
  const { count, percent } = useWordCount({ target: doc.wordTarget });
  const { status } = useAutoSave({
    value,
    documentId: doc.id,
    wordCount: count,
  });

  // ── PDF export ─────────────────────────────────────────────────────────────

  async function handleExport() {
    // Export uses the live title + persisted content
    await downloadPdf({ ...doc, title, content: value, wordCount: count });
  }

  // ── Live doc for SubmissionChecklist ───────────────────────────────────────

  const liveDoc: PFDocument = { ...doc, title, content: value, wordCount: count };

  return (
    <div className="flex h-screen flex-col">
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
        {/* Back to dashboard */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back to documents"
          onClick={() => {
            // Sync-save before SPA navigation so any in-flight debounce isn't lost
            store.saveSync(doc.id, value, count);
            router.push('/');
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Editable title */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          aria-label="Document title"
          className="flex-1 border-none bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
          placeholder="Untitled Document"
        />

        {/* Export trigger */}
        <SubmissionChecklist doc={liveDoc} onExport={handleExport}>
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </SubmissionChecklist>
      </header>

      {/* ── Page canvas (A4 editor surface) ─────────────────────────────────── */}
      <PageCanvas />

      {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
      <footer className="flex h-10 shrink-0 items-center justify-between border-t bg-background px-4">
        <WordCountBar count={count} target={doc.wordTarget} percent={percent} />
        <SaveIndicator status={status} />
      </footer>
    </div>
  );
}

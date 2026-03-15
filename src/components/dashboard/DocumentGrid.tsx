"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "./DocumentCard";
import { EmptyState } from "./EmptyState";
import { CreateDocumentModal } from "./CreateDocumentModal";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import type { PFDocument, TemplateType } from "@/lib/store/types";

// ─── Component ────────────────────────────────────────────────────────────────

export function DocumentGrid() {
  const store = useDocumentStore();
  const router = useRouter();

  const [documents, setDocuments] = useState<PFDocument[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Load documents on mount ────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    store.getAll().then((docs) => {
      if (!cancelled) {
        setDocuments(docs);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [store]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = useCallback(
    async (template: TemplateType, wordTarget?: number) => {
      try {
        const doc = await store.create(template, wordTarget);
        router.push(`/document/${doc.id}`);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          alert('Storage is full. Please delete some documents before creating a new one.');
        } else {
          throw e;
        }
      }
    },
    [store, router]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await store.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    },
    [store]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
          <p className="mt-1 text-muted-foreground">
            {documents.length === 0
              ? "No documents yet"
              : `${documents.length} document${documents.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {documents.length > 0 && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New document
          </Button>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {documents.length === 0 ? (
        <EmptyState onCreateClick={() => setModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* ── Create modal ────────────────────────────────────────────────────── */}
      <CreateDocumentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={handleCreate}
      />
    </div>
  );
}

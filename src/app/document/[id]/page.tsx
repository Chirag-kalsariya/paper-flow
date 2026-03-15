import { PaperEditor } from '@/components/editor/PaperEditor';

// ─── Document editor page ─────────────────────────────────────────────────────
//
// Server Component — renders the PaperEditor client component with the
// document id from the URL. Document loading and not-found redirects
// are handled client-side by EditorShell (localStorage is browser-only).
//
// Route: /document/[id]
//
// ─────────────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  return <PaperEditor docId={id} />;
}

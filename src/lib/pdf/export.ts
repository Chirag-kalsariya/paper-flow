import { pdf } from '@react-pdf/renderer';
import React from 'react';
import type { PFDocument } from '@/lib/store/types';
import { serializePlateToRPdf } from './serialize';
import { PDFDocument } from '@/components/pdf/PDFDocument';

// ─── downloadPdf ──────────────────────────────────────────────────────────────
//
// Converts a PFDocument to a PDF blob and triggers a browser download.
//
// Flow:
//   PFDocument.content (Plate JSON)
//       │
//       ▼
//   serializePlateToRPdf()   → PDFBlock[]
//       │
//       ▼
//   <PDFDocument />          → React PDF tree
//       │
//       ▼
//   pdf().toBlob()           → Blob
//       │
//       ▼
//   URL.createObjectURL()    → object URL → <a download> click
//
// ─────────────────────────────────────────────────────────────────────────────

export async function downloadPdf(doc: PFDocument): Promise<void> {
  const blocks = serializePlateToRPdf(doc.content);

  const element = React.createElement(PDFDocument, {
    title: doc.title,
    blocks,
  });

  const blob = await pdf(element).toBlob();

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${sanitizeFilename(doc.title)}.pdf`;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Small delay before revoking so the browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strip characters that are invalid in filenames across Windows, macOS, Linux.
 * Falls back to "document" for completely empty titles.
 */
function sanitizeFilename(title: string): string {
  const sanitized = title
    .replace(/[/\\:*?"<>|]/g, '') // Windows-invalid chars
    .replace(/\s+/g, ' ')
    .trim();
  return sanitized || 'document';
}

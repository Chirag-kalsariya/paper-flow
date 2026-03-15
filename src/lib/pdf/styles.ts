import { StyleSheet } from '@react-pdf/renderer';

// ─── PDF Typography Constants ──────────────────────────────────────────────
//
// A4 at 72 dpi (PDF points): 595 × 842 pt
// Margins: 72pt (1 inch) on all sides → content width = 451pt
//
// Fonts: built-in PDF fonts only — no external font licensing risk.
//   Serif body:   Times-Roman / Times-Bold / Times-Italic / Times-BoldItalic
//   Sans headers: Helvetica / Helvetica-Bold
//   Monospace:    Courier / Courier-Bold
//
// ─────────────────────────────────────────────────────────────────────────────

export const PDF_MARGIN = 72; // 1 inch in PDF points
export const PDF_LINE_HEIGHT = 1.6;

export const styles = StyleSheet.create({
  page: {
    paddingTop: PDF_MARGIN,
    paddingBottom: PDF_MARGIN,
    paddingLeft: PDF_MARGIN,
    paddingRight: PDF_MARGIN,
    fontFamily: 'Times-Roman',
    fontSize: 12,
    lineHeight: PDF_LINE_HEIGHT,
    color: '#000000',
  },

  // ── Block styles ────────────────────────────────────────────────────────

  h1: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    lineHeight: 1.3,
    marginBottom: 12,
    marginTop: 0,
  },

  h2: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    lineHeight: 1.3,
    marginBottom: 8,
    marginTop: 14,
  },

  h3: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    lineHeight: 1.3,
    marginBottom: 6,
    marginTop: 10,
  },

  h4: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    lineHeight: 1.3,
    marginBottom: 4,
    marginTop: 8,
  },

  h5: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.3,
    marginBottom: 4,
    marginTop: 8,
  },

  h6: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.3,
    marginBottom: 4,
    marginTop: 8,
    color: '#555555',
  },

  p: {
    fontFamily: 'Times-Roman',
    fontSize: 12,
    lineHeight: PDF_LINE_HEIGHT,
    marginBottom: 8,
  },

  blockquote: {
    fontFamily: 'Times-Roman',
    fontSize: 12,
    lineHeight: PDF_LINE_HEIGHT,
    marginBottom: 8,
    marginLeft: 24,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#999999',
    color: '#444444',
  },

  code_block: {
    fontFamily: 'Courier',
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },

  hr: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    marginTop: 10,
    marginBottom: 10,
  },

  // ── Inline mark styles ──────────────────────────────────────────────────

  bold: {
    fontFamily: 'Times-Bold',
  },

  italic: {
    fontFamily: 'Times-Italic',
  },

  boldItalic: {
    fontFamily: 'Times-BoldItalic',
  },

  underline: {
    textDecoration: 'underline',
  },

  code: {
    fontFamily: 'Courier',
    fontSize: 11,
    backgroundColor: '#f0f0f0',
  },
});

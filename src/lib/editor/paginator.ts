// ─── paginator.ts ─────────────────────────────────────────────────────────────
//
// A4 pagination constants and page-break calculation.
//
// At 96 CSS px/inch (standard browser DPI):
//   A4 paper  = 210mm × 297mm  =  794px × 1123px
//   1" margin =  25.4mm        =   96px (top and bottom)
//   Content height per page    =  1123 - (96 × 2) = 931px
//
// Page-break positions:
//   Page breaks are rendered as absolutely-positioned horizontal dividers
//   on top of the editor scroll container.
//
//   Given a total scrollable height, a break should appear at every
//   PAGE_HEIGHT_PX interval measured from the top of the document:
//
//   [PAGE_HEIGHT_PX, PAGE_HEIGHT_PX * 2, PAGE_HEIGHT_PX * 3, …]
//
//   ...up to (and including) the last interval that falls within
//   the total height.
//
// Example:
//   2500px → breaks at [1123, 2246]   (2246 < 2500 ✓, 3369 > 2500 ✗)
//
// ─────────────────────────────────────────────────────────────────────────────

export const PAGE_WIDTH_PX = 794;
export const PAGE_HEIGHT_PX = 1123;
export const PAGE_PADDING_Y = 96;

/** Usable content height per page (height minus top + bottom margins) */
export const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PAGE_PADDING_Y * 2; // 931

/**
 * Computes pixel offsets at which visual page-break dividers should be drawn.
 *
 * @param totalHeightPx - The total pixel height of the editor content area
 * @returns An array of pixel offsets (ascending), one per page boundary
 *
 * @example
 * pageBreaksFromHeight(0)     // []
 * pageBreaksFromHeight(500)   // []
 * pageBreaksFromHeight(1123)  // [1123]
 * pageBreaksFromHeight(2500)  // [1123, 2246]
 */
export function pageBreaksFromHeight(totalHeightPx: number): number[] {
  if (totalHeightPx <= 0) return [];

  const breaks: number[] = [];
  let offset = PAGE_HEIGHT_PX;

  while (offset <= totalHeightPx) {
    breaks.push(offset);
    offset += PAGE_HEIGHT_PX;
  }

  return breaks;
}

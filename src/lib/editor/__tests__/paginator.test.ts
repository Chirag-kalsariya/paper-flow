import { describe, it, expect } from 'vitest';
import {
  pageBreaksFromHeight,
  PAGE_HEIGHT_PX,
  CONTENT_HEIGHT_PX,
} from '../paginator';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('pageBreaksFromHeight', () => {
  it('returns [] for 0px height', () => {
    expect(pageBreaksFromHeight(0)).toEqual([]);
  });

  it('returns [] for negative height', () => {
    expect(pageBreaksFromHeight(-100)).toEqual([]);
  });

  it('returns [] when height is less than one page', () => {
    expect(pageBreaksFromHeight(500)).toEqual([]);
  });

  it('returns [] for height just under PAGE_HEIGHT_PX', () => {
    expect(pageBreaksFromHeight(PAGE_HEIGHT_PX - 1)).toEqual([]);
  });

  it('returns [1123] for exactly PAGE_HEIGHT_PX', () => {
    expect(pageBreaksFromHeight(PAGE_HEIGHT_PX)).toEqual([PAGE_HEIGHT_PX]);
  });

  it('returns [1123] for height just over one page', () => {
    expect(pageBreaksFromHeight(PAGE_HEIGHT_PX + 1)).toEqual([PAGE_HEIGHT_PX]);
  });

  it('returns [1123, 2246] for 2500px', () => {
    expect(pageBreaksFromHeight(2500)).toEqual([1123, 2246]);
  });

  it('returns [1123, 2246, 3369] for 3 full pages exactly', () => {
    expect(pageBreaksFromHeight(PAGE_HEIGHT_PX * 3)).toEqual([
      PAGE_HEIGHT_PX,
      PAGE_HEIGHT_PX * 2,
      PAGE_HEIGHT_PX * 3,
    ]);
  });

  it('does not emit a break for the partial page at the end', () => {
    const height = PAGE_HEIGHT_PX * 2 + 100; // 2 full pages + a bit
    const breaks = pageBreaksFromHeight(height);
    expect(breaks).toHaveLength(2);
    expect(breaks[breaks.length - 1]).toBeLessThanOrEqual(height);
  });

  it('breaks are evenly spaced at PAGE_HEIGHT_PX intervals', () => {
    const breaks = pageBreaksFromHeight(PAGE_HEIGHT_PX * 5);
    for (let i = 0; i < breaks.length; i++) {
      expect(breaks[i]).toBe(PAGE_HEIGHT_PX * (i + 1));
    }
  });

  it('exports sensible A4 constants', () => {
    expect(PAGE_HEIGHT_PX).toBe(1123);
    expect(CONTENT_HEIGHT_PX).toBe(931);
  });
});

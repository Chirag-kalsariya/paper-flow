import { describe, it, expect } from 'vitest';
import { countWords } from '../word-count';
import type { Value } from 'platejs';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function p(...texts: string[]) {
  return {
    type: 'p',
    children: texts.map((t) => ({ text: t })),
  };
}

function h1(text: string) {
  return { type: 'h1', children: [{ text }] };
}

function li(text: string) {
  return { type: 'p', children: [{ text }] };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('countWords', () => {
  it('returns 0 for an empty value', () => {
    expect(countWords([])).toBe(0);
  });

  it('returns 0 for a single empty paragraph', () => {
    const value: Value = [p('')];
    expect(countWords(value)).toBe(0);
  });

  it('counts words in a single paragraph', () => {
    const value: Value = [p('Hello world')];
    expect(countWords(value)).toBe(2);
  });

  it('counts a heading and a paragraph correctly', () => {
    const value: Value = [
      h1('The Heading'),
      p('This is a paragraph with six words'),
    ];
    expect(countWords(value)).toBe(2 + 7);
  });

  it('counts across multiple inline text nodes in one paragraph', () => {
    // Bold + italic spans produce separate leaf nodes
    const value: Value = [
      {
        type: 'p',
        children: [
          { text: 'Hello ' },
          { text: 'bold', bold: true },
          { text: ' world' },
        ],
      },
    ];
    expect(countWords(value)).toBe(3);
  });

  it('handles multiple spaces between words — counts as 1 word each', () => {
    const value: Value = [p('one   two   three')];
    expect(countWords(value)).toBe(3);
  });

  it('handles leading and trailing whitespace', () => {
    const value: Value = [p('  hello world  ')];
    expect(countWords(value)).toBe(2);
  });

  it('counts nested list items', () => {
    const value: Value = [
      h1('Introduction'),    // 1
      li('First item'),      // 2
      li('Second item here'), // 3
    ];
    expect(countWords(value)).toBe(1 + 2 + 3);
  });

  it('returns 0 for a paragraph that contains only whitespace', () => {
    const value: Value = [p('   \t  \n  ')];
    expect(countWords(value)).toBe(0);
  });

  it('counts a single word correctly', () => {
    const value: Value = [p('Hello')];
    expect(countWords(value)).toBe(1);
  });
});

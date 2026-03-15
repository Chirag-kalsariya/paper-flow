import { describe, it, expect, vi, afterEach } from 'vitest';
import { serializePlateToRPdf } from '../serialize';
import type { Value } from 'platejs';

// Silence the console.warn for unknown node tests
afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function block(type: string, ...texts: string[]) {
  return { type, children: texts.map((t) => ({ text: t })) };
}

function richBlock(type: string, children: object[]) {
  return { type, children };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('serializePlateToRPdf', () => {
  it('returns [] for an empty value', () => {
    expect(serializePlateToRPdf([])).toEqual([]);
  });

  it('serializes a paragraph with plain text', () => {
    const value: Value = [block('p', 'Hello world')];
    const result = serializePlateToRPdf(value);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('p');
    expect(result[0].leaves).toEqual([{ text: 'Hello world' }]);
  });

  it('serializes h1 through h6 headings', () => {
    const value: Value = [
      block('h1', 'Title'),
      block('h2', 'Subtitle'),
      block('h3', 'Section'),
      block('h4', 'Sub-section'),
      block('h5', 'Minor'),
      block('h6', 'Tiny'),
    ];
    const result = serializePlateToRPdf(value);
    expect(result.map((b) => b.type)).toEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
    expect(result[0].leaves[0].text).toBe('Title');
  });

  it('serializes blockquote', () => {
    const value: Value = [block('blockquote', 'A wise quote')];
    const result = serializePlateToRPdf(value);
    expect(result[0].type).toBe('blockquote');
    expect(result[0].leaves[0].text).toBe('A wise quote');
  });

  it('serializes code_block', () => {
    const value: Value = [block('code_block', 'const x = 1;')];
    const result = serializePlateToRPdf(value);
    expect(result[0].type).toBe('code_block');
  });

  it('serializes hr with empty leaves', () => {
    const value: Value = [{ type: 'hr', children: [{ text: '' }] }];
    const result = serializePlateToRPdf(value);
    expect(result[0].type).toBe('hr');
    expect(result[0].leaves).toEqual([]);
  });

  it('preserves bold mark', () => {
    const value: Value = [
      richBlock('p', [
        { text: 'normal ' },
        { text: 'bold', bold: true },
      ]),
    ];
    const result = serializePlateToRPdf(value);
    expect(result[0].leaves).toEqual([
      { text: 'normal ' },
      { text: 'bold', bold: true },
    ]);
  });

  it('preserves italic mark', () => {
    const value: Value = [
      richBlock('p', [
        { text: 'plain' },
        { text: ' italic', italic: true },
      ]),
    ];
    const result = serializePlateToRPdf(value);
    expect(result[0].leaves[1]).toEqual({ text: ' italic', italic: true });
  });

  it('preserves underline mark', () => {
    const value: Value = [
      richBlock('p', [{ text: 'underlined', underline: true }]),
    ];
    const result = serializePlateToRPdf(value);
    expect(result[0].leaves[0]).toEqual({ text: 'underlined', underline: true });
  });

  it('preserves code mark on inline code', () => {
    const value: Value = [
      richBlock('p', [
        { text: 'Call ' },
        { text: 'foo()', code: true },
        { text: ' now' },
      ]),
    ];
    const result = serializePlateToRPdf(value);
    expect(result[0].leaves[1]).toEqual({ text: 'foo()', code: true });
  });

  it('handles multiple inline runs in one block', () => {
    const value: Value = [
      richBlock('p', [
        { text: 'one ' },
        { text: 'two', bold: true },
        { text: ' three' },
      ]),
    ];
    const result = serializePlateToRPdf(value);
    expect(result[0].leaves).toHaveLength(3);
  });

  it('skips unknown node types and logs a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const value: Value = [
      { type: 'some-unknown-block', children: [] } as never,
    ];
    const result = serializePlateToRPdf(value);
    expect(result).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('some-unknown-block')
    );
  });

  it('serializes multiple blocks in order', () => {
    const value: Value = [
      block('h1', 'Title'),
      block('p', 'Paragraph one'),
      block('p', 'Paragraph two'),
    ];
    const result = serializePlateToRPdf(value);
    expect(result).toHaveLength(3);
    expect(result[1].leaves[0].text).toBe('Paragraph one');
    expect(result[2].leaves[0].text).toBe('Paragraph two');
  });

  it('produces a leaf for each text node', () => {
    const value: Value = [
      richBlock('p', [
        { text: 'A', bold: true },
        { text: 'B', italic: true },
        { text: 'C', underline: true },
        { text: 'D' },
      ]),
    ];
    const result = serializePlateToRPdf(value);
    expect(result[0].leaves).toHaveLength(4);
    expect(result[0].leaves[2].underline).toBe(true);
  });
});

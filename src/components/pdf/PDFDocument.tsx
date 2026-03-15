'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { PDFBlock, PDFLeaf } from '@/lib/pdf/serialize';
import { styles } from '@/lib/pdf/styles';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PDFDocumentProps {
  title: string;
  blocks: PDFBlock[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PDFDocument({ title, blocks }: PDFDocumentProps) {
  return (
    <Document title={title} author="PaperFlow">
      <Page size="A4" style={styles.page}>
        {blocks.map((block, i) => (
          <BlockView key={i} block={block} />
        ))}
      </Page>
    </Document>
  );
}

// ─── Block renderer ──────────────────────────────────────────────────────────

function BlockView({ block }: { block: PDFBlock }) {
  if (block.type === 'hr') {
    return <View style={styles.hr} />;
  }

  const blockStyle = styles[block.type as keyof typeof styles];

  return (
    <Text style={blockStyle}>
      {block.leaves.length === 0
        ? ' ' // prevent zero-height text blocks
        : block.leaves.map((leaf, i) => (
            <LeafSpan key={i} leaf={leaf} isCodeBlock={block.type === 'code_block'} />
          ))}
    </Text>
  );
}

// ─── Leaf mark styles (pre-built for type safety) ────────────────────────────

const markStyles = StyleSheet.create({
  bold: { fontFamily: 'Times-Bold' },
  italic: { fontFamily: 'Times-Italic' },
  boldItalic: { fontFamily: 'Times-BoldItalic' },
  underline: { textDecoration: 'underline' },
  code: { fontFamily: 'Courier', fontSize: 11, backgroundColor: '#f0f0f0' },
  boldUnderline: { fontFamily: 'Times-Bold', textDecoration: 'underline' },
  italicUnderline: { fontFamily: 'Times-Italic', textDecoration: 'underline' },
  boldItalicUnderline: { fontFamily: 'Times-BoldItalic', textDecoration: 'underline' },
});

// ─── Leaf (inline run) renderer ───────────────────────────────────────────────

function LeafSpan({
  leaf,
  isCodeBlock,
}: {
  leaf: PDFLeaf;
  isCodeBlock: boolean;
}) {
  // Code blocks use Courier for everything — no need for extra inline styles
  if (isCodeBlock) {
    return <Text>{leaf.text}</Text>;
  }

  // Inline code gets its own style
  if (leaf.code) {
    return <Text style={markStyles.code}>{leaf.text}</Text>;
  }

  // Pick a pre-built combined style for the mark combination
  if (leaf.bold && leaf.italic && leaf.underline) {
    return <Text style={markStyles.boldItalicUnderline}>{leaf.text}</Text>;
  }
  if (leaf.bold && leaf.underline) {
    return <Text style={markStyles.boldUnderline}>{leaf.text}</Text>;
  }
  if (leaf.italic && leaf.underline) {
    return <Text style={markStyles.italicUnderline}>{leaf.text}</Text>;
  }
  if (leaf.bold && leaf.italic) {
    return <Text style={markStyles.boldItalic}>{leaf.text}</Text>;
  }
  if (leaf.bold) {
    return <Text style={markStyles.bold}>{leaf.text}</Text>;
  }
  if (leaf.italic) {
    return <Text style={markStyles.italic}>{leaf.text}</Text>;
  }
  if (leaf.underline) {
    return <Text style={markStyles.underline}>{leaf.text}</Text>;
  }

  return <Text>{leaf.text}</Text>;
}

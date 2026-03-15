# PaperFlow

PaperFlow is a student-focused document editor built to replace the formatting headaches of Microsoft Word. It runs entirely in the browser with no account required — documents are stored in localStorage, the editor feels like a clean A4 page, and exporting to PDF takes three clicks. Built on Next.js, Plate.js, and shadcn/ui, it ships a polished writing experience without a backend.

## Screenshots

> _Screenshots coming soon — run the app locally to see it in action._

## Getting started

```bash
git clone https://github.com/your-username/paper-flow.git
cd paper-flow
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

| Layer | Library |
|-------|---------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Editor | [Plate.js v52](https://platejs.org) |
| UI components | [shadcn/ui](https://ui.shadcn.com) |
| PDF export | [@react-pdf/renderer v4](https://react-pdf.org) |
| Styling | Tailwind CSS v4 |
| Tests | Vitest + Testing Library |

## Features

- **3 document templates** — Essay (1,000-word target), Lab Report (800-word target), and Blank
- **Auto-save** — debounced 1s save with a "Saved" indicator; sync save on tab close so no content is lost
- **Word count target** — live progress arc that turns green at 100%
- **PDF export** — A4 multi-page export triggered by a submission checklist modal
- **Dark mode** — system-preference aware; A4 page stays white in any theme
- **Markdown shortcuts** — `# ` → H1, `## ` → H2, `**text**` → bold, `` `code` `` → inline code, and more

## Project structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Dashboard
│   └── document/[id]/    # Editor route
├── components/
│   ├── dashboard/        # DocumentGrid, DocumentCard, CreateDocumentModal
│   └── editor/           # EditorShell, PageCanvas, WordCountBar, SubmissionChecklist
├── hooks/                # useAutoSave, useWordCount, usePagination
├── lib/
│   ├── editor/           # Plate.js config + paginator
│   ├── pdf/              # serialize, styles, export
│   └── store/            # IDocumentStore, LocalStorageDocumentStore, migrations
└── providers/            # DocumentStoreProvider, ThemeProvider
```

## Running tests

```bash
pnpm test          # watch mode
npx vitest run     # single run
```

## License

MIT

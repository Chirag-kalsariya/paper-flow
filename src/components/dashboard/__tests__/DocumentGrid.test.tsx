import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentGrid } from "../DocumentGrid";
import { DocumentStoreProvider } from "@/providers/DocumentStoreProvider";
import type { IDocumentStore, PFDocument } from "@/lib/store/types";

// ─── Next.js router mock ──────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ─── Store mock factory ───────────────────────────────────────────────────────

function makeDoc(id: string, title: string, template: PFDocument["template"] = "essay"): PFDocument {
  return {
    id,
    schemaVersion: 1,
    title,
    content: [],
    template,
    wordCount: 0,
    formatting: {
      fontFamily: "times-new-roman",
      fontSize: 12,
      lineSpacing: 2,
      margins: { top: 1, bottom: 1, left: 1, right: 1 },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function makeStore(docs: PFDocument[]): IDocumentStore {
  return {
    getAll: vi.fn().mockResolvedValue(docs),
    get: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation(async (template) =>
      makeDoc("new-id", "Untitled", template)
    ),
    update: vi.fn().mockResolvedValue(true),
    delete: vi.fn().mockResolvedValue(undefined),
    saveSync: vi.fn().mockReturnValue(true),
    getStorageStats: vi.fn().mockReturnValue({ usedBytes: 0, estimatedTotalBytes: 5 * 1024 * 1024 }),
  };
}

function renderGrid(store: IDocumentStore) {
  return render(
    <DocumentStoreProvider store={store}>
      <DocumentGrid />
    </DocumentStoreProvider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("DocumentGrid", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("shows loading state initially then renders empty state", async () => {
    const store = makeStore([]);
    renderGrid(store);
    // After load, empty state CTA appears
    await waitFor(() =>
      expect(
        screen.getByText("Create your first document and start writing")
      ).toBeInTheDocument()
    );
  });

  it("renders document cards when documents exist", async () => {
    const store = makeStore([
      makeDoc("id-1", "Essay One"),
      makeDoc("id-2", "Lab Report One", "lab-report"),
    ]);
    renderGrid(store);
    await waitFor(() => expect(screen.getByText("Essay One")).toBeInTheDocument());
    expect(screen.getByText("Lab Report One")).toBeInTheDocument();
  });

  it("shows document count in header", async () => {
    const store = makeStore([makeDoc("id-1", "My Doc"), makeDoc("id-2", "Doc 2")]);
    renderGrid(store);
    await waitFor(() => expect(screen.getByText("2 documents")).toBeInTheDocument());
  });

  it("shows singular 'document' for exactly one doc", async () => {
    const store = makeStore([makeDoc("id-1", "Solo Doc")]);
    renderGrid(store);
    await waitFor(() => expect(screen.getByText("1 document")).toBeInTheDocument());
  });

  it("opens create modal when empty state CTA is clicked", async () => {
    const store = makeStore([]);
    renderGrid(store);
    await waitFor(() =>
      expect(screen.getByText("Create your first document")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("Create your first document"));
    // Modal should appear
    await waitFor(() =>
      expect(screen.getByText("New document")).toBeInTheDocument()
    );
  });

  it("opens create modal when New document button is clicked", async () => {
    const store = makeStore([makeDoc("id-1", "Existing Doc")]);
    renderGrid(store);
    await waitFor(() => expect(screen.getByText("New document")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /New document/i }));
    // Modal title
    await waitFor(() =>
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    );
  });

  it("calls store.delete and removes card when delete is confirmed", async () => {
    const user = userEvent.setup();
    const store = makeStore([makeDoc("id-1", "Delete Me")]);
    renderGrid(store);

    await waitFor(() => expect(screen.getByText("Delete Me")).toBeInTheDocument());

    // Open dropdown on card via userEvent (Radix needs pointer events)
    await user.click(screen.getByRole("button", { name: /Document options/i }));
    const deleteItem = await screen.findByRole("menuitem", { name: /Delete/i });
    await user.click(deleteItem);
    const confirmBtn = await screen.findByRole("button", { name: /^Delete$/i });
    await user.click(confirmBtn);

    expect(store.delete).toHaveBeenCalledWith("id-1");
    await waitFor(() =>
      expect(screen.queryByText("Delete Me")).not.toBeInTheDocument()
    );
  });

  it("navigates to editor after creating a document", async () => {
    const store = makeStore([makeDoc("id-1", "Existing")]);
    renderGrid(store);

    await waitFor(() => expect(screen.getByText("New document")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /New document/i }));

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Create document/i }));

    expect(store.create).toHaveBeenCalled();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/document/new-id"));
  });
});

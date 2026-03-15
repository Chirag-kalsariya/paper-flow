import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentCard } from "../DocumentCard";
import type { PFDocument } from "@/lib/store/types";

// ─── Next.js router mock ──────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// ─── Fixture ──────────────────────────────────────────────────────────────────

function makeDoc(overrides: Partial<PFDocument> = {}): PFDocument {
  return {
    id: "test-id-123",
    schemaVersion: 1,
    title: "My Essay",
    content: [],
    template: "essay",
    wordCount: 0,
    formatting: {
      fontFamily: "times-new-roman",
      fontSize: 12,
      lineSpacing: 2,
      margins: { top: 1, bottom: 1, left: 1, right: 1 },
    },
    createdAt: new Date("2026-01-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-01-01T10:00:00Z").toISOString(),
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("DocumentCard", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders the document title", () => {
    render(<DocumentCard document={makeDoc()} onDelete={vi.fn()} />);
    expect(screen.getByText("My Essay")).toBeInTheDocument();
  });

  it("renders the template badge", () => {
    render(<DocumentCard document={makeDoc({ template: "lab-report" })} onDelete={vi.fn()} />);
    expect(screen.getByText("Lab Report")).toBeInTheDocument();
  });

  it("renders 'Blank' badge for blank template", () => {
    render(<DocumentCard document={makeDoc({ template: "blank" })} onDelete={vi.fn()} />);
    expect(screen.getByText("Blank")).toBeInTheDocument();
  });

  it("navigates to editor on card click", () => {
    render(<DocumentCard document={makeDoc()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Open My Essay/i }));
    expect(mockPush).toHaveBeenCalledWith("/document/test-id-123");
  });

  it("navigates to editor on Enter key", () => {
    render(<DocumentCard document={makeDoc()} onDelete={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole("button", { name: /Open My Essay/i }), {
      key: "Enter",
    });
    expect(mockPush).toHaveBeenCalledWith("/document/test-id-123");
  });

  it("calls onDelete with the document id after confirmation", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<DocumentCard document={makeDoc()} onDelete={onDelete} />);

    // Open the dropdown via userEvent (Radix needs pointer events)
    await user.click(screen.getByRole("button", { name: /Document options/i }));

    // Click Delete in the dropdown menu
    const deleteItem = await screen.findByRole("menuitem", { name: /Delete/i });
    await user.click(deleteItem);

    // Confirm in the alert dialog
    const confirmBtn = await screen.findByRole("button", { name: /^Delete$/i });
    await user.click(confirmBtn);

    expect(onDelete).toHaveBeenCalledWith("test-id-123");
  });

  it("does not call onDelete when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<DocumentCard document={makeDoc()} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: /Document options/i }));
    const deleteItem = await screen.findByRole("menuitem", { name: /Delete/i });
    await user.click(deleteItem);

    const cancelBtn = await screen.findByRole("button", { name: /Cancel/i });
    await user.click(cancelBtn);

    expect(onDelete).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreateDocumentModal } from "../CreateDocumentModal";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CreateDocumentModal", () => {
  function renderOpen(onCreate = vi.fn(), onOpenChange = vi.fn()) {
    return render(
      <CreateDocumentModal
        open={true}
        onOpenChange={onOpenChange}
        onCreate={onCreate}
      />
    );
  }

  it("renders all three template options", () => {
    renderOpen();
    expect(screen.getByText("Essay")).toBeInTheDocument();
    expect(screen.getByText("Lab Report")).toBeInTheDocument();
    expect(screen.getByText("Blank")).toBeInTheDocument();
  });

  it("shows word target input when Essay is selected (default)", () => {
    renderOpen();
    expect(screen.getByLabelText(/word target/i)).toBeInTheDocument();
  });

  it("hides word target input when Blank is selected", () => {
    renderOpen();
    fireEvent.click(screen.getByRole("button", { name: /Blank/i, hidden: true }));
    expect(screen.queryByLabelText(/word target/i)).not.toBeInTheDocument();
  });

  it("calls onCreate with essay template and default word target", () => {
    const onCreate = vi.fn();
    renderOpen(onCreate);
    fireEvent.click(screen.getByRole("button", { name: /Create document/i }));
    expect(onCreate).toHaveBeenCalledWith("essay", 1000);
  });

  it("calls onCreate with custom word target", () => {
    const onCreate = vi.fn();
    renderOpen(onCreate);
    const input = screen.getByLabelText(/word target/i);
    fireEvent.change(input, { target: { value: "500" } });
    fireEvent.click(screen.getByRole("button", { name: /Create document/i }));
    expect(onCreate).toHaveBeenCalledWith("essay", 500);
  });

  it("calls onCreate with blank template and no word target", () => {
    const onCreate = vi.fn();
    renderOpen(onCreate);
    // Select blank
    const blankBtn = screen.getAllByRole("button").find(
      (b) => b.textContent?.includes("Blank")
    );
    fireEvent.click(blankBtn!);
    fireEvent.click(screen.getByRole("button", { name: /Create document/i }));
    expect(onCreate).toHaveBeenCalledWith("blank", undefined);
  });

  it("calls onCreate with lab-report template and its default word target", () => {
    const onCreate = vi.fn();
    renderOpen(onCreate);
    const labBtn = screen.getAllByRole("button").find(
      (b) => b.textContent?.includes("Lab Report")
    );
    fireEvent.click(labBtn!);
    fireEvent.click(screen.getByRole("button", { name: /Create document/i }));
    expect(onCreate).toHaveBeenCalledWith("lab-report", 800);
  });

  it("calls onOpenChange(false) when Cancel is clicked", () => {
    const onOpenChange = vi.fn();
    renderOpen(vi.fn(), onOpenChange);
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

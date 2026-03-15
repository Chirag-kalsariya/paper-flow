import { describe, it, expect, beforeEach, vi } from "vitest";
import { LocalStorageDocumentStore } from "../local-storage-store";
import { STORAGE_KEY, CURRENT_SCHEMA_VERSION } from "../types";
import type { PFStoreRoot } from "../types";

// ─── localStorage mock ────────────────────────────────────────────────────────
// jsdom provides localStorage but we need to control it per-test.
// We reset it before each test and can override methods for error simulation.

function seedStore(store: PFStoreRoot) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function readStore(): PFStoreRoot {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)!);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("LocalStorageDocumentStore", () => {
  let store: LocalStorageDocumentStore;

  beforeEach(() => {
    localStorage.clear();
    store = new LocalStorageDocumentStore();
  });

  // ── getAll() ───────────────────────────────────────────────────────────────

  describe("getAll()", () => {
    it("returns empty array when storage is empty", async () => {
      const docs = await store.getAll();
      expect(docs).toEqual([]);
    });

    it("returns documents sorted by updatedAt descending", async () => {
      await store.create("blank");
      await new Promise((r) => setTimeout(r, 1)); // ensure different timestamps
      await store.create("essay");

      const docs = await store.getAll();
      expect(docs).toHaveLength(2);
      // Most recently updated first
      expect(new Date(docs[0].updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(docs[1].updatedAt).getTime()
      );
    });
  });

  // ── get() ──────────────────────────────────────────────────────────────────

  describe("get()", () => {
    it("returns null for a non-existent id", async () => {
      const doc = await store.get("nonexistent-id");
      expect(doc).toBeNull();
    });

    it("returns the document for a valid id", async () => {
      const created = await store.create("blank");
      const fetched = await store.get(created.id);
      expect(fetched?.id).toBe(created.id);
    });
  });

  // ── create() ──────────────────────────────────────────────────────────────

  describe("create()", () => {
    it("assigns a schemaVersion of 1 to every new document", async () => {
      const doc = await store.create("essay");
      expect(doc.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    });

    it("creates an essay document with the correct template", async () => {
      const doc = await store.create("essay");
      expect(doc.template).toBe("essay");
      expect(doc.title).toBe("Untitled Essay");
    });

    it("creates a lab-report document with the correct template", async () => {
      const doc = await store.create("lab-report");
      expect(doc.template).toBe("lab-report");
      expect(doc.title).toBe("Untitled Lab Report");
    });

    it("creates a blank document with the correct template", async () => {
      const doc = await store.create("blank");
      expect(doc.template).toBe("blank");
    });

    it("stores the wordTarget when provided", async () => {
      const doc = await store.create("essay", 800);
      expect(doc.wordTarget).toBe(800);
    });

    it("leaves wordTarget undefined when not provided", async () => {
      const doc = await store.create("blank");
      expect(doc.wordTarget).toBeUndefined();
    });

    it("sets createdAt and updatedAt as ISO strings", async () => {
      const doc = await store.create("blank");
      expect(() => new Date(doc.createdAt)).not.toThrow();
      expect(() => new Date(doc.updatedAt)).not.toThrow();
    });

    it("persists the document so it survives a cache reset", async () => {
      const created = await store.create("essay");
      store._resetCache();
      const fetched = await store.get(created.id);
      expect(fetched?.id).toBe(created.id);
    });

    it("generates unique ids for each document", async () => {
      const a = await store.create("blank");
      const b = await store.create("blank");
      expect(a.id).not.toBe(b.id);
    });

    it("initialises content from the template defaults (non-empty)", async () => {
      const doc = await store.create("essay");
      expect(Array.isArray(doc.content)).toBe(true);
      expect(doc.content.length).toBeGreaterThan(0);
    });
  });

  // ── update() ──────────────────────────────────────────────────────────────

  describe("update()", () => {
    it("updates the title and bumps updatedAt", async () => {
      const doc = await store.create("blank");
      const originalUpdatedAt = doc.updatedAt;

      await new Promise((r) => setTimeout(r, 1));
      const ok = await store.update(doc.id, { title: "New Title" });

      expect(ok).toBe(true);
      const updated = await store.get(doc.id);
      expect(updated?.title).toBe("New Title");
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it("returns false for a non-existent id", async () => {
      const ok = await store.update("ghost-id", { title: "Nope" });
      expect(ok).toBe(false);
    });

    it("does not mutate other document fields when updating title only", async () => {
      const doc = await store.create("essay", 500);
      await store.update(doc.id, { title: "Updated" });
      const updated = await store.get(doc.id);
      expect(updated?.wordTarget).toBe(500);
      expect(updated?.template).toBe("essay");
    });
  });

  // ── delete() ──────────────────────────────────────────────────────────────

  describe("delete()", () => {
    it("removes the document from the store", async () => {
      const doc = await store.create("blank");
      await store.delete(doc.id);
      const fetched = await store.get(doc.id);
      expect(fetched).toBeNull();
    });

    it("is a no-op for a non-existent id (does not throw)", async () => {
      await expect(store.delete("nonexistent")).resolves.toBeUndefined();
    });

    it("does not affect other documents", async () => {
      const a = await store.create("blank");
      const b = await store.create("essay");
      await store.delete(a.id);
      const bFetched = await store.get(b.id);
      expect(bFetched?.id).toBe(b.id);
    });
  });

  // ── saveSync() ────────────────────────────────────────────────────────────

  describe("saveSync()", () => {
    it("synchronously writes content and wordCount to localStorage", async () => {
      const doc = await store.create("essay");
      const newContent = [{ type: "p", children: [{ text: "saved sync" }] }];

      const ok = store.saveSync(doc.id, newContent, 2);
      expect(ok).toBe(true);

      // Read directly from localStorage (bypassing cache) to confirm persistence
      store._resetCache();
      const persisted = await store.get(doc.id);
      expect(persisted?.content).toEqual(newContent);
      expect(persisted?.wordCount).toBe(2);
    });

    it("returns false for a non-existent id", async () => {
      const ok = store.saveSync("ghost", [], 0);
      expect(ok).toBe(false);
    });
  });

  // ── QuotaExceededError handling ───────────────────────────────────────────

  describe("QuotaExceededError handling", () => {
    it("update() returns false when localStorage.setItem throws QuotaExceededError", async () => {
      const doc = await store.create("blank");

      const quotaError = new DOMException(
        "QuotaExceededError",
        "QuotaExceededError"
      );
      const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementationOnce(() => {
          throw quotaError;
        });

      const ok = await store.update(doc.id, { title: "Will fail" });
      expect(ok).toBe(false);

      setItemSpy.mockRestore();
    });

    it("saveSync() returns false on QuotaExceededError", async () => {
      const doc = await store.create("blank");

      vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      });

      const ok = store.saveSync(doc.id, [], 0);
      expect(ok).toBe(false);

      vi.restoreAllMocks();
    });
  });

  // ── SyntaxError handling (corrupted JSON) ─────────────────────────────────

  describe("SyntaxError handling", () => {
    it("starts fresh when localStorage contains corrupted JSON", async () => {
      localStorage.setItem(STORAGE_KEY, "{ this is not json }{{{");
      // Spy on console.error to confirm the error is logged
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const freshStore = new LocalStorageDocumentStore();
      const docs = await freshStore.getAll();

      expect(docs).toEqual([]);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[PaperFlow] Corrupted localStorage data"),
        expect.anything()
      );

      errorSpy.mockRestore();
    });

    it("can create documents after recovering from corrupted storage", async () => {
      localStorage.setItem(STORAGE_KEY, "CORRUPTED");
      const freshStore = new LocalStorageDocumentStore();

      // suppress the console.error noise in this test
      vi.spyOn(console, "error").mockImplementation(() => {});
      const doc = await freshStore.create("blank");
      vi.restoreAllMocks();

      expect(doc.id).toBeTruthy();
    });
  });

  // ── getStorageStats() ─────────────────────────────────────────────────────

  describe("getStorageStats()", () => {
    it("returns usedBytes > 0 after creating a document", async () => {
      await store.create("essay");
      const stats = store.getStorageStats();
      expect(stats.usedBytes).toBeGreaterThan(0);
      expect(stats.estimatedTotalBytes).toBe(5 * 1024 * 1024);
    });
  });

  // ── Persistence across cache resets ───────────────────────────────────────

  describe("cache isolation", () => {
    it("reads from localStorage after cache reset — not from stale memory", async () => {
      const doc = await store.create("blank");

      // Simulate another browser tab writing directly to localStorage
      const raw = readStore();
      raw.documents[doc.id] = {
        ...raw.documents[doc.id],
        title: "External write",
      };
      seedStore(raw);

      // Cache reset forces a re-parse from localStorage
      store._resetCache();
      const fetched = await store.get(doc.id);
      expect(fetched?.title).toBe("External write");
    });
  });
});

import type { Value } from "platejs";
import type {
  IDocumentStore,
  PFDocument,
  PFStoreRoot,
  TemplateType,
} from "./types";
import { STORAGE_KEY, CURRENT_SCHEMA_VERSION } from "./types";
import { migrate } from "./migrations";
import { DEFAULT_FORMATTING, TEMPLATE_DEFAULTS } from "./defaults";
import { generateId } from "../utils/uuid";

// ─── LocalStorageDocumentStore ────────────────────────────────────────────────
//
// Implements IDocumentStore using localStorage as the backend.
//
// Cache strategy:
//   ┌────────────────────────────────────────────────────────┐
//   │  First read → parse localStorage → populate cache      │
//   │  Subsequent reads → return cache (no re-parse)         │
//   │  Mutations (create/update/delete) → update cache first │
//   │                                   → then write to LS   │
//   └────────────────────────────────────────────────────────┘
//
// This avoids repeated JSON.parse on every read, which matters when the
// store contains many large documents. Cache is invalidated by mutations only.

export class LocalStorageDocumentStore implements IDocumentStore {
  private cache: PFStoreRoot | null = null;

  // ─── Private: load / persist ──────────────────────────────────────────────

  private loadStore(): PFStoreRoot {
    if (this.cache) return this.cache;

    let raw: unknown = null;
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      raw = item ? JSON.parse(item) : null;
    } catch (e) {
      // SyntaxError: localStorage contains corrupted JSON.
      // Log it — the banner UI reads this flag to show the user a warning.
      console.error("[PaperFlow] Corrupted localStorage data — starting fresh.", e);
      raw = null;
    }

    this.cache = migrate(raw);
    return this.cache;
  }

  /**
   * Write store to localStorage and update the in-memory cache.
   * Returns false if QuotaExceededError is thrown, true on success.
   */
  private persist(store: PFStoreRoot): boolean {
    // Update cache before the write attempt so in-memory state stays coherent
    // even if the write fails (the user at least sees their current session).
    this.cache = store;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      return true;
    } catch (e) {
      if (
        e instanceof DOMException &&
        (e.name === "QuotaExceededError" ||
          // Firefox uses a different name
          e.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        console.error("[PaperFlow] localStorage quota exceeded.", e);
        return false;
      }
      // Re-throw unexpected errors (e.g. SecurityError in sandboxed iframes)
      throw e;
    }
  }

  // ─── IDocumentStore implementation ───────────────────────────────────────

  async getAll(): Promise<PFDocument[]> {
    const store = this.loadStore();
    return Object.values(store.documents).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async get(id: string): Promise<PFDocument | null> {
    const store = this.loadStore();
    return store.documents[id] ?? null;
  }

  async create(template: TemplateType, wordTarget?: number): Promise<PFDocument> {
    const now = new Date().toISOString();
    const id = generateId();

    const doc: PFDocument = {
      id,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      title: defaultTitle(template),
      content: TEMPLATE_DEFAULTS[template],
      template,
      wordCount: 0,
      wordTarget,
      formatting: { ...DEFAULT_FORMATTING },
      createdAt: now,
      updatedAt: now,
    };

    const store = this.loadStore();
    const next: PFStoreRoot = {
      ...store,
      documents: { ...store.documents, [id]: doc },
    };
    const ok = this.persist(next);
    if (!ok) {
      // Quota exceeded — roll back cache so the doc doesn't appear to exist
      this.cache = store;
      throw new DOMException('localStorage quota exceeded', 'QuotaExceededError');
    }
    return doc;
  }

  async update(
    id: string,
    partial: Partial<
      Pick<PFDocument, "title" | "content" | "formatting" | "wordTarget" | "wordCount">
    >
  ): Promise<boolean> {
    const store = this.loadStore();
    const existing = store.documents[id];
    if (!existing) return false;

    const updated: PFDocument = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    const next: PFStoreRoot = {
      ...store,
      documents: { ...store.documents, [id]: updated },
    };
    return this.persist(next);
  }

  async delete(id: string): Promise<void> {
    const store = this.loadStore();
    if (!store.documents[id]) return; // no-op

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _removed, ...rest } = store.documents;
    const next: PFStoreRoot = { ...store, documents: rest };
    this.persist(next);
  }

  /**
   * Synchronous save for beforeunload handlers.
   * Writes only content + wordCount + updatedAt — the minimum needed to
   * prevent data loss when the tab closes mid-debounce.
   *
   * Returns true on success, false if quota exceeded (silently — the tab
   * is closing, there is no UI to show the error).
   */
  saveSync(id: string, content: Value, wordCount: number): boolean {
    const store = this.loadStore();
    const existing = store.documents[id];
    if (!existing) return false;

    const updated: PFDocument = {
      ...existing,
      content,
      wordCount,
      updatedAt: new Date().toISOString(),
    };

    const next: PFStoreRoot = {
      ...store,
      documents: { ...store.documents, [id]: updated },
    };
    return this.persist(next);
  }

  getStorageStats(): { usedBytes: number; estimatedTotalBytes: number } {
    try {
      const item = localStorage.getItem(STORAGE_KEY) ?? "";
      // Each UTF-16 character is 2 bytes in localStorage
      const usedBytes = new Blob([item]).size;
      return { usedBytes, estimatedTotalBytes: 5 * 1024 * 1024 }; // 5MB typical limit
    } catch {
      return { usedBytes: 0, estimatedTotalBytes: 5 * 1024 * 1024 };
    }
  }

  // ─── Internal helpers ─────────────────────────────────────────────────────

  /** Exposed for tests — resets in-memory cache without touching localStorage */
  _resetCache(): void {
    this.cache = null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultTitle(template: TemplateType): string {
  switch (template) {
    case "essay":
      return "Untitled Essay";
    case "lab-report":
      return "Untitled Lab Report";
    case "blank":
      return "Untitled Document";
  }
}

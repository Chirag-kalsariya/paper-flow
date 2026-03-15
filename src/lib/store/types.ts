import type { Value } from "platejs";

// ─── Document templates ───────────────────────────────────────────────────────

export type TemplateType = "essay" | "lab-report" | "blank";

// ─── Per-document formatting ──────────────────────────────────────────────────

export type FontFamily = "times-new-roman" | "arial" | "calibri";

export interface PFFormatting {
  fontFamily: FontFamily;
  /** Point size — default 12 */
  fontSize: number;
  /** Line spacing multiplier — 1 = single, 2 = double */
  lineSpacing: number;
  /** Page margins in inches */
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// ─── Core document type ───────────────────────────────────────────────────────

/**
 * A PaperFlow document as stored in localStorage.
 *
 * IMPORTANT: bump schemaVersion whenever the shape of this interface changes.
 * The migrations.ts pipeline will handle upgrading persisted documents.
 * Never remove schemaVersion — it is the only migration hook we have.
 */
export interface PFDocument {
  id: string; // crypto.randomUUID()
  schemaVersion: 1;
  title: string;
  /** Plate/Slate JSON — stored as-is, never serialized to Markdown */
  content: Value;
  template: TemplateType;
  wordCount: number;
  wordTarget?: number;
  formatting: PFFormatting;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ─── Store root ───────────────────────────────────────────────────────────────

export interface PFStoreRoot {
  /** Store-level schema version for root-shape migrations */
  schemaVersion: 1;
  documents: Record<string, PFDocument>;
}

export const STORAGE_KEY = "paperflow:store" as const;

export const CURRENT_SCHEMA_VERSION = 1 as const;

// ─── IDocumentStore interface ─────────────────────────────────────────────────
//
// LocalStorageDocumentStore implements this for v1.
// A future CloudDocumentStore will implement this to enable cloud sync without
// touching any component code.
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  Components / hooks                                                     │
// │       │                                                                 │
// │       ▼                                                                 │
// │  IDocumentStore  (this interface)                                       │
// │       │                                                                 │
// │       ├── LocalStorageDocumentStore  (v1)                              │
// │       └── CloudDocumentStore         (v2, future)                      │
// └─────────────────────────────────────────────────────────────────────────┘

export interface IDocumentStore {
  /** Return all documents sorted by updatedAt descending */
  getAll(): Promise<PFDocument[]>;

  /** Return a single document or null if not found */
  get(id: string): Promise<PFDocument | null>;

  /** Create a new document from a template with optional word target */
  create(template: TemplateType, wordTarget?: number): Promise<PFDocument>;

  /**
   * Persist partial updates to a document.
   * Returns true on success, false if storage quota was exceeded.
   */
  update(
    id: string,
    partial: Partial<
      Pick<PFDocument, "title" | "content" | "formatting" | "wordTarget" | "wordCount">
    >
  ): Promise<boolean>;

  /** Delete a document by id. No-op if id not found. */
  delete(id: string): Promise<void>;

  /**
   * Synchronous save for use in beforeunload handlers only.
   * CloudDocumentStore must implement this as a no-op with a console.warn —
   * async cloud saves are impossible in beforeunload.
   *
   * Returns true on success, false if quota exceeded.
   */
  saveSync(
    id: string,
    content: Value,
    wordCount: number
  ): boolean;

  /** Storage usage stats for the quota warning UI */
  getStorageStats(): { usedBytes: number; estimatedTotalBytes: number };
}

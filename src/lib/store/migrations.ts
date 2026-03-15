import type { PFStoreRoot } from "./types";
import { CURRENT_SCHEMA_VERSION } from "./types";

// ─── Migration pipeline ───────────────────────────────────────────────────────
//
// Add new entries here whenever PFStoreRoot or PFDocument shape changes.
// Each migration receives the output of the previous one.
//
// Version history:
//   1 → baseline (no migration needed)
//
// ┌──────────┐    ┌──────────┐    ┌──────────┐
// │  raw     │───▶│ v0→v1   │───▶│  valid   │
// │  unknown │    │ (no-op) │    │ PFStore  │
// └──────────┘    └──────────┘    └──────────┘

type MigrationFn = (store: PFStoreRoot) => PFStoreRoot;

const MIGRATIONS: Record<number, MigrationFn> = {
  // v1 is the baseline — nothing to transform
  1: (store) => store,
};

/**
 * Parse and migrate raw localStorage data into a valid PFStoreRoot.
 *
 * Handles:
 *  - null / undefined input        → returns empty store
 *  - missing schemaVersion         → treats as version 0, runs all migrations
 *  - unknown shape (not an object) → returns empty store
 *  - malformed documents field     → resets documents to {}
 *  - future schema versions        → returns as-is (forward-compat)
 */
export function migrate(raw: unknown): PFStoreRoot {
  const empty = emptyStore();

  if (raw === null || raw === undefined) return empty;
  if (typeof raw !== "object" || Array.isArray(raw)) return empty;

  const record = raw as Record<string, unknown>;

  // Determine the stored version — default to 0 if missing
  const storedVersion =
    typeof record.schemaVersion === "number" ? record.schemaVersion : 0;

  // Forward-compat: if the stored version is newer than we know, return as-is.
  // This prevents data loss if the user opens an older build.
  if (storedVersion > CURRENT_SCHEMA_VERSION) {
    return raw as PFStoreRoot;
  }

  // Build a base store from the raw data, sanitizing the documents field
  let store: PFStoreRoot = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    documents: sanitizeDocuments(record.documents),
  };

  // Run migrations from storedVersion+1 up to CURRENT_SCHEMA_VERSION
  for (let v = storedVersion + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    const migration = MIGRATIONS[v];
    if (migration) {
      store = migration(store);
    }
  }

  return store;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyStore(): PFStoreRoot {
  return { schemaVersion: CURRENT_SCHEMA_VERSION, documents: {} };
}

/**
 * Sanitize the documents field.
 * Returns an empty object if the field is missing, not an object, or an array.
 * Individual malformed entries are dropped (not crashed over).
 */
function sanitizeDocuments(raw: unknown): PFStoreRoot["documents"] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const docs: PFStoreRoot["documents"] = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      // Cast — we trust migrate() callers to run type validation at runtime.
      // Full Zod validation would be ideal but is out of scope for v1.
      docs[key] = val as PFStoreRoot["documents"][string];
    }
  }
  return docs;
}

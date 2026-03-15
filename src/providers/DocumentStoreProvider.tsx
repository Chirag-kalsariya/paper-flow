"use client";

import React, { createContext, useMemo, type ReactNode } from "react";
import type { IDocumentStore } from "@/lib/store/types";
import { LocalStorageDocumentStore } from "@/lib/store/local-storage-store";

// ─── Context ──────────────────────────────────────────────────────────────────

/**
 * Provides the active IDocumentStore to the component tree.
 *
 * In v1: LocalStorageDocumentStore
 * In v2 (future): swap in CloudDocumentStore here — zero component changes.
 *
 * null! is intentional: useDocumentStore() guards against missing provider.
 */
export const DocumentStoreContext = createContext<IDocumentStore>(null!);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface DocumentStoreProviderProps {
  children: ReactNode;
  /** Override the store implementation — used in tests to inject a mock */
  store?: IDocumentStore;
}

export function DocumentStoreProvider({
  children,
  store: storeProp,
}: DocumentStoreProviderProps) {
  // useMemo ensures the store instance is created once and stable across renders.
  // Without this, every render would create a new instance and reset the cache.
  const store = useMemo(
    () => storeProp ?? new LocalStorageDocumentStore(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // intentionally empty — the store is a singleton for the provider's lifetime
  );

  return (
    <DocumentStoreContext.Provider value={store}>
      {children}
    </DocumentStoreContext.Provider>
  );
}

import { useContext } from "react";
import { DocumentStoreContext } from "@/providers/DocumentStoreProvider";
import type { IDocumentStore } from "@/lib/store/types";

/**
 * Returns the active IDocumentStore from context.
 *
 * Throws if called outside a <DocumentStoreProvider> — this is intentional.
 * A missing provider is a programmer error, not a runtime condition.
 */
export function useDocumentStore(): IDocumentStore {
  const store = useContext(DocumentStoreContext);
  if (!store) {
    throw new Error(
      "useDocumentStore must be used within a <DocumentStoreProvider>. " +
        "Wrap your app root with <DocumentStoreProvider> in layout.tsx."
    );
  }
  return store;
}

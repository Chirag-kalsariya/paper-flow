/**
 * Generate a UUID for document IDs.
 *
 * Uses crypto.randomUUID() when available (all modern browsers + Node 14.17+).
 * Falls back to a Math.random()-based v4 UUID for environments that lack it.
 * The fallback is not cryptographically secure but is collision-resistant
 * enough for local document IDs.
 */
export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  // Fallback: RFC 4122 v4 UUID via Math.random()
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

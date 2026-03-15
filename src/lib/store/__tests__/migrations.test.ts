import { describe, it, expect } from "vitest";
import { migrate } from "../migrations";
import { CURRENT_SCHEMA_VERSION } from "../types";

describe("migrate()", () => {
  it("returns empty store for null input", () => {
    const result = migrate(null);
    expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(result.documents).toEqual({});
  });

  it("returns empty store for undefined input", () => {
    const result = migrate(undefined);
    expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(result.documents).toEqual({});
  });

  it("returns empty store for non-object input (string)", () => {
    const result = migrate("corrupted string");
    expect(result.documents).toEqual({});
  });

  it("returns empty store for array input", () => {
    const result = migrate([{ type: "h1" }]);
    expect(result.documents).toEqual({});
  });

  it("handles missing schemaVersion — treats as v0, runs all migrations", () => {
    const raw = {
      documents: {
        "doc-1": {
          id: "doc-1",
          title: "Test",
          content: [],
          template: "blank",
          wordCount: 0,
          formatting: {},
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      },
    };
    const result = migrate(raw);
    expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(result.documents["doc-1"]).toBeDefined();
  });

  it("returns valid store unchanged for current v1 schema", () => {
    const raw = {
      schemaVersion: 1,
      documents: {
        "abc-123": {
          id: "abc-123",
          schemaVersion: 1,
          title: "My Essay",
          content: [{ type: "p", children: [{ text: "Hello" }] }],
          template: "essay",
          wordCount: 1,
          formatting: {
            fontFamily: "times-new-roman",
            fontSize: 12,
            lineSpacing: 2,
            margins: { top: 1, bottom: 1, left: 1, right: 1 },
          },
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      },
    };
    const result = migrate(raw);
    expect(result.schemaVersion).toBe(1);
    expect(result.documents["abc-123"].title).toBe("My Essay");
  });

  it("drops malformed individual documents, keeps valid ones", () => {
    const raw = {
      schemaVersion: 1,
      documents: {
        "bad-doc": "this is a string, not an object",
        "bad-array": [1, 2, 3],
        "good-doc": {
          id: "good-doc",
          title: "Good",
          content: [],
          template: "blank",
          wordCount: 0,
          formatting: {},
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      },
    };
    const result = migrate(raw);
    expect(result.documents["bad-doc"]).toBeUndefined();
    expect(result.documents["bad-array"]).toBeUndefined();
    expect(result.documents["good-doc"]).toBeDefined();
  });

  it("returns store as-is for future schema version (forward compat)", () => {
    const raw = {
      schemaVersion: 999,
      documents: { "future-doc": { id: "future-doc", title: "Future" } },
    };
    const result = migrate(raw);
    // Should not crash or discard data from a newer version
    expect(result.schemaVersion).toBe(999);
    expect(result.documents["future-doc"]).toBeDefined();
  });

  it("handles null documents field — resets to empty object", () => {
    const raw = { schemaVersion: 1, documents: null };
    const result = migrate(raw);
    expect(result.documents).toEqual({});
  });

  it("handles missing documents field — resets to empty object", () => {
    const raw = { schemaVersion: 1 };
    const result = migrate(raw);
    expect(result.documents).toEqual({});
  });
});

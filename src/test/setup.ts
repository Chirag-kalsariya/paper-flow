import "@testing-library/react/pure";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Auto-cleanup after each test
afterEach(() => {
  cleanup();
});

// Suppress ResizeObserver loop errors — these fire constantly during
// DOM-measured pagination and are benign. Without this, they appear as
// false test failures in the console.
//
// See: https://github.com/nickvdyck/resize-observer-polyfill/issues/38
const originalError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("ResizeObserver loop")
    ) {
      return;
    }
    originalError(...args);
  };
});

afterEach(() => {
  console.error = originalError;
});

// Stub window.ResizeObserver for jsdom (not implemented in jsdom)
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

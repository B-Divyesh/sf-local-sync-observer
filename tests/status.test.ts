import { describe, expect, it } from "vitest";
import { relativeTime, summarizeFolders, worstState } from "../src/status";
import type { FolderReading } from "../src/types";

const folder = (overrides: Partial<FolderReading> = {}): FolderReading => ({
  id: "notes",
  label: "Notes",
  path: "/notes",
  state: "converged",
  pendingFiles: 0,
  conflictFiles: 0,
  lastGoodAt: 1,
  newestChangeAt: 1,
  note: "Provider reports zero pending items",
  ...overrides
});

describe("evidence status", () => {
  it("@claim:evidence-boundary never lets convergence hide a conflict or missing evidence", () => {
    expect(worstState(["converged", "pending", "conflict"])).toBe("conflict");
    expect(summarizeFolders([folder({ state: "unknown", pendingFiles: null })])).toEqual({
      state: "unknown",
      summary: "Not enough evidence to claim convergence"
    });
  });

  it("counts conflicts before pending work", () => {
    expect(summarizeFolders([
      folder({ state: "pending", pendingFiles: 3 }),
      folder({ id: "archive", state: "conflict", conflictFiles: 1 })
    ])).toEqual({ state: "conflict", summary: "1 conflict file needs attention" });
  });

  it("formats recent checks without future-looking values", () => {
    expect(relativeTime(95_000, 100_000)).toBe("just now");
    expect(relativeTime(40_000, 100_000)).toBe("1m ago");
  });
});

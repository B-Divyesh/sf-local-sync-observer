import type { FolderReading, SourceReading, StatusKind } from "./types";

const priority: Record<StatusKind, number> = {
  conflict: 6,
  error: 5,
  offline: 4,
  pending: 3,
  unknown: 2,
  converged: 1
};

export function worstState(states: StatusKind[]): StatusKind {
  if (states.length === 0) return "unknown";
  return states.reduce((worst, state) => priority[state] > priority[worst] ? state : worst);
}

export function summarizeFolders(folders: FolderReading[]): Pick<SourceReading, "state" | "summary"> {
  const state = worstState(folders.map((folder) => folder.state));
  const conflicts = folders.reduce((total, folder) => total + folder.conflictFiles, 0);
  const pendingKnown = folders.filter((folder) => folder.pendingFiles !== null);
  const pending = pendingKnown.reduce((total, folder) => total + (folder.pendingFiles ?? 0), 0);
  if (conflicts > 0) return { state: "conflict", summary: `${conflicts} conflict ${conflicts === 1 ? "file needs" : "files need"} attention` };
  if (state === "error") return { state, summary: "Provider returned an error" };
  if (state === "offline") return { state, summary: "Provider cannot be reached" };
  if (pending > 0) return { state: "pending", summary: `${pending} ${pending === 1 ? "item" : "items"} still pending` };
  if (state === "converged" && pendingKnown.length === folders.length) return { state, summary: "All reported items are up to date" };
  return { state: "unknown", summary: "Not enough information to show syncing finished" };
}

export function relativeTime(timestamp: number | null, now = Date.now()): string {
  if (!timestamp) return "Not established";
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

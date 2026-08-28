export type StatusKind = "converged" | "pending" | "conflict" | "offline" | "unknown" | "error";

export interface SyncthingSource {
  id: string;
  kind: "syncthing";
  name: string;
  endpoint: string;
  apiKey: string;
  ownerUrl: string;
}

export interface FolderSource {
  id: string;
  kind: "folder";
  name: string;
  path: string;
  ownerUrl?: string;
}

export type Source = SyncthingSource | FolderSource;

export interface FolderReading {
  id: string;
  label: string;
  path: string;
  state: StatusKind;
  pendingFiles: number | null;
  conflictFiles: number;
  lastGoodAt: number | null;
  newestChangeAt: number | null;
  note: string;
}

export interface SourceReading {
  sourceId: string;
  provider: string;
  state: StatusKind;
  checkedAt: number;
  summary: string;
  folders: FolderReading[];
  coverage: string;
}

export interface StoredState {
  sources: Source[];
  readings: Record<string, SourceReading>;
}

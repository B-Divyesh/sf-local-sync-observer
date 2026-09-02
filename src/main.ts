import "./styles.css";
import type { FolderReading, FolderSource, NextcloudSource, Source, SourceReading, StatusKind, StoredState, SyncthingSource } from "./types";
import { relativeTime, summarizeFolders, worstState } from "./status";

const STORAGE_KEY = "local-sync-observer.v1";
const DEMO_STORAGE_KEY = "demo:local-sync-observer.v1";
let demoMode = new URLSearchParams(window.location.search).get("demo") === "1";
const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) throw new Error("App root is missing");
const app: HTMLDivElement = appRoot;

const state: StoredState & { loading: Set<string>; selectedId: string | null; notice: string } = {
  sources: [], readings: {}, loading: new Set(), selectedId: null, notice: ""
};

function load(): void {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey()) ?? "null") as Partial<StoredState> | null;
    state.sources = Array.isArray(saved?.sources) ? saved.sources : [];
    state.readings = saved?.readings && typeof saved.readings === "object" ? saved.readings : {};
    state.selectedId = state.sources[0]?.id ?? null;
  } catch {
    state.notice = "Saved settings could not be read. Add a source again.";
  }
}

function save(): void {
  localStorage.setItem(storageKey(), JSON.stringify({ sources: state.sources, readings: state.readings }));
}

function storageKey(): string {
  return demoMode ? DEMO_STORAGE_KEY : STORAGE_KEY;
}

function setDemoLocation(enabled: boolean): void {
  const url = new URL(window.location.href);
  if (enabled) url.searchParams.set("demo", "1");
  else url.searchParams.delete("demo");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

const statusMeta: Record<StatusKind, { label: string; symbol: string }> = {
  converged: { label: "Converged", symbol: "✓" },
  pending: { label: "Pending", symbol: "↻" },
  conflict: { label: "Conflict", symbol: "!" },
  offline: { label: "Offline", symbol: "×" },
  unknown: { label: "Unknown", symbol: "?" },
  error: { label: "Error", symbol: "!" }
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
}

function statusChip(kind: StatusKind): string {
  const meta = statusMeta[kind];
  return `<span class="status status--${kind}"><span aria-hidden="true">${meta.symbol}</span>${meta.label}</span>`;
}

function isTauri(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

async function invoke<T>(command: string, args: Record<string, unknown>): Promise<T> {
  if (!isTauri()) throw new Error("Native checks run in the installed desktop app.");
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
  return tauriInvoke<T>(command, args);
}

function selectedSource(): Source | undefined {
  return state.sources.find((source) => source.id === state.selectedId);
}

function overallState(): StatusKind {
  if (state.sources.length === 0) return "unknown";
  return worstState(state.sources.map((source) => state.readings[source.id]?.state ?? "unknown"));
}

function render(): void {
  const selected = selectedSource();
  const overall = overallState();
  const attentionCount = state.sources.filter((source) => ["conflict", "error", "offline"].includes(state.readings[source.id]?.state ?? "unknown")).length;
  app.innerHTML = `
    <header class="app-header">
      <a class="brand" href="#main" aria-label="Local Sync Observer home"><span class="brand-mark" aria-hidden="true">LS/O</span><span>Local Sync Observer</span></a>
      <div class="header-actions">
        <span class="privacy-mark"><span aria-hidden="true">●</span> Local only</span>
        <button class="button button--small" type="button" data-action="configure">Configure sources</button>
      </div>
    </header>
    <main id="main" tabindex="-1">
      ${demoMode ? renderDemoBanner() : ""}
      <section class="summary-strip" aria-labelledby="board-title">
        <div>
          <p class="eyebrow">Sync status</p>
          <h1 id="board-title">Check whether your folders finished syncing.</h1>
        </div>
        <div class="overall-reading">
          <span class="overall-label">Overall reading</span>
          ${statusChip(overall)}
          <span>${state.sources.length === 0 ? "Add a source to begin" : attentionCount ? `${attentionCount} ${attentionCount === 1 ? "source needs" : "sources need"} attention` : overall === "converged" ? "Every reporting source agrees" : "Status details are incomplete"}</span>
        </div>
      </section>
      ${state.notice ? `<div class="notice" role="status">${escapeHtml(state.notice)}<button type="button" data-action="dismiss-notice" aria-label="Dismiss message">×</button></div>` : ""}
      ${state.sources.length === 0 ? renderEmpty() : renderBoard(selected)}
    </main>
    <footer class="app-footer"><span>Observation only · never writes or syncs files</span><span class="build-id" title="Source commit ${__SOURCE_COMMIT__}" aria-label="Version ${__APP_VERSION__}, source commit ${__SOURCE_COMMIT__}">v${__APP_VERSION__} · build <code>${__SOURCE_COMMIT__.slice(0, 7)}</code></span><button class="text-button" data-action="show-privacy" type="button">Privacy details</button></footer>
    ${renderSourceDialog()}
    ${renderPrivacyDialog()}
  `;
  bindEvents();
  void syncTrayStatus(overall, attentionCount);
}

async function syncTrayStatus(status: StatusKind, attentionCount: number): Promise<void> {
  if (!isTauri()) return;
  try {
    await invoke<void>("update_tray_status", { state: status, attentionCount });
  } catch {
    // The board remains usable if the operating system tray is unavailable.
  }
}

function renderEmpty(): string {
  return `<section class="empty-state" aria-labelledby="empty-title">
    <div class="empty-register" aria-hidden="true"><span></span><span></span><span></span></div>
    <p class="ticket">NO SOURCES ADDED</p>
    <h2 id="empty-title">Add Syncthing or choose a folder.</h2>
    <p>Connect Syncthing on this computer, add a Nextcloud desktop log, or choose a folder to check names and timestamps. Nothing is changed.</p>
    <div class="button-row">
      <button class="button button--primary" type="button" data-action="configure">Add first source</button>
      <button class="button" type="button" data-action="sample">Try sample data</button>
    </div>
    <p class="fineprint">A green result appears only after Syncthing reports zero pending items or Nextcloud logs a completed sync. Folder checks alone stay “Unknown” unless they find a conflict.</p>
  </section>`;
}

function renderDemoBanner(): string {
  return `<section class="demo-banner" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved to your real observer.</strong><div class="button-row"><button class="text-button" type="button" data-action="reset-demo">Reset demo</button><button class="text-button" type="button" data-action="start-real">Add your sources</button></div></section>`;
}

function renderBoard(selected?: Source): string {
  const reading = selected ? state.readings[selected.id] : undefined;
  return `<div class="board-layout">
    <aside class="source-rail" aria-label="Observed sources">
      <div class="rail-heading"><h2>Sources</h2><span>${state.sources.length}</span></div>
      <ul class="source-list">${state.sources.map((source) => {
        const sourceReading = state.readings[source.id];
        const status = state.loading.has(source.id) ? "unknown" : sourceReading?.state ?? "unknown";
        return `<li><button class="source-button${source.id === state.selectedId ? " is-selected" : ""}" type="button" data-source-id="${escapeHtml(source.id)}" aria-current="${source.id === state.selectedId ? "true" : "false"}">
          <span class="source-provider">${source.kind === "syncthing" ? "SYNCTHING" : source.kind === "nextcloud" ? "NEXTCLOUD LOG" : "FOLDER CHECK"}</span>
          <strong>${escapeHtml(source.name)}</strong>
          <span class="source-state"><span class="dot dot--${status}" aria-hidden="true"></span>${state.loading.has(source.id) ? "Checking…" : statusMeta[status].label}</span>
        </button></li>`;
      }).join("")}</ul>
      <button class="button rail-add" type="button" data-action="configure">+ Add source</button>
    </aside>
    <section class="evidence" aria-live="polite">
      ${selected ? renderEvidence(selected, reading) : ""}
    </section>
  </div>`;
}

function renderEvidence(source: Source, reading?: SourceReading): string {
  if (state.loading.has(source.id)) return `<div class="loading-state" role="status"><div class="registration-loader" aria-hidden="true"></div><h2>Inspecting ${escapeHtml(source.name)}</h2><p>Reading provider metadata. No file content leaves this device.</p></div>`;
  const sourceLocation = source.kind === "syncthing" ? source.endpoint : source.kind === "nextcloud" ? source.logPath : source.path;
  const sourceLabel = source.kind === "syncthing" ? "Syncthing status" : source.kind === "nextcloud" ? "Nextcloud desktop log" : "Folder names and metadata";
  const ownerAction = source.kind === "nextcloud"
    ? `<button class="button button--primary" type="button" data-action="open-owner" data-source-id="${escapeHtml(source.id)}">Open Nextcloud ↗</button>`
    : source.ownerUrl ? `<button class="button button--primary" type="button" data-action="open-owner" data-source-id="${escapeHtml(source.id)}">Open sync tool ↗</button>` : "";
  return `<div class="evidence-heading">
      <div><p class="eyebrow">${sourceLabel}</p><h2>${escapeHtml(source.name)}</h2><p class="path" title="${escapeHtml(sourceLocation)}">${escapeHtml(sourceLocation)}</p></div>
      <div class="button-row">${demoMode ? `<button class="button" type="button" data-action="reset-demo">Reset demo</button>` : `<button class="button" type="button" data-action="refresh" data-source-id="${escapeHtml(source.id)}">Refresh status</button>`}${ownerAction}</div>
    </div>
    ${reading ? renderReading(reading) : renderNeverChecked(source)}
    <div class="evidence-footer"><span>Coverage: ${escapeHtml(reading?.coverage ?? (source.kind === "syncthing" ? "Folder completion and connection metadata" : source.kind === "nextcloud" ? "Desktop log status messages" : "Conflict filename patterns and timestamps"))}</span><button class="text-button danger-text" type="button" data-action="remove" data-source-id="${escapeHtml(source.id)}">Remove source</button></div>`;
}

function renderNeverChecked(source: Source): string {
  return `<div class="state-panel state-panel--unknown"><div class="state-symbol" aria-hidden="true">?</div><div><h3>Status not checked yet</h3><p>${isTauri() ? "Run a read-only check to see the current status." : "Install and open the desktop app to run local checks."}</p></div></div>
    <button class="button button--primary check-first" type="button" data-action="refresh" data-source-id="${escapeHtml(source.id)}">${isTauri() ? "Check now" : "Try check"}</button>`;
}

function renderReading(reading: SourceReading): string {
  return `<div class="state-panel state-panel--${reading.state}">
      <div class="state-symbol" aria-hidden="true">${statusMeta[reading.state].symbol}</div>
      <div><p class="eyebrow">${statusMeta[reading.state].label}</p><h3>${escapeHtml(reading.summary)}</h3><p>Checked ${relativeTime(reading.checkedAt)}</p></div>
    </div>
    ${reading.folders.length ? `<div class="reading-table" role="region" aria-label="Folder readings" tabindex="0"><table><thead><tr><th scope="col">Folder</th><th scope="col">State</th><th scope="col">Pending</th><th scope="col">Conflicts</th><th scope="col">Last good</th></tr></thead><tbody>${reading.folders.map((folder) => `<tr><th scope="row"><span>${escapeHtml(folder.label)}</span><small>${escapeHtml(folder.path)}</small></th><td>${statusChip(folder.state)}</td><td>${folder.pendingFiles ?? "Not reported"}</td><td>${folder.conflictFiles}</td><td>${relativeTime(folder.lastGoodAt)}</td></tr><tr class="folder-note"><td colspan="5">${escapeHtml(folder.note)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="no-folders"><h3>No folder status returned</h3><p>The sync tool connected, but did not report any folder status. Open the sync tool to check its setup.</p></div>`}`;
}

function renderSourceDialog(): string {
  return `<dialog id="source-dialog" aria-labelledby="source-dialog-title">
    <form method="dialog" class="dialog-shell" id="source-form">
      <div class="dialog-heading"><div><p class="eyebrow">Read-only setup</p><h2 id="source-dialog-title">Add a source</h2></div><button class="icon-button" type="button" data-action="close-source" aria-label="Close source setup">×</button></div>
      <fieldset class="kind-switch"><legend>Source type</legend><label><input type="radio" name="kind" value="syncthing" checked> Syncthing</label><label><input type="radio" name="kind" value="nextcloud"> Nextcloud desktop log</label><label><input type="radio" name="kind" value="folder"> Folder names and metadata</label></fieldset>
      <div class="form-fields" data-fields="syncthing">
        <label>Display name<input name="syncName" value="My Syncthing" required></label>
        <label>Local Syncthing address<input name="endpoint" type="url" value="http://127.0.0.1:8384" required aria-describedby="endpoint-help"></label>
        <small id="endpoint-help">Use Syncthing on this computer or a .local address. Remote hosts are rejected.</small>
        <label>API key<input name="apiKey" type="password" autocomplete="off" required aria-describedby="api-help"></label>
        <small id="api-help">Stored only in this app’s local WebView storage. You can revoke it in Syncthing.</small>
      </div>
      <div class="form-fields" data-fields="folder" hidden aria-hidden="true">
        <label>Display name<input name="folderName" value="Observed folder" required disabled></label>
        <label>Folder path<span class="path-input"><input name="path" required disabled><button type="button" class="button" data-action="choose-folder">Choose…</button></span></label>
        <label>Sync tool URL <span class="optional">optional</span><input name="ownerUrl" type="url" placeholder="http://127.0.0.1:8384" disabled></label>
        <small>Only names, timestamps, and file sizes are inspected. File contents are never opened.</small>
      </div>
      <div class="form-fields" data-fields="nextcloud" hidden aria-hidden="true">
        <label>Display name<input name="nextcloudName" value="My Nextcloud" required disabled></label>
        <label>Nextcloud desktop log path<span class="path-input"><input name="logPath" required disabled aria-describedby="nextcloud-help"><button type="button" class="button" data-action="choose-nextcloud-log">Choose log…</button></span></label>
        <small id="nextcloud-help">Choose Nextcloud’s current <code>nextcloud.log</code>. The observer reads status lines only and never changes the log or synced files.</small>
      </div>
      <p class="form-error" id="form-error" role="alert"></p>
      <div class="dialog-actions"><button class="button" type="button" data-action="close-source">Cancel</button><button class="button button--primary" type="submit">Save and inspect</button></div>
    </form>
  </dialog>`;
}

function renderPrivacyDialog(): string {
  return `<dialog id="privacy-dialog" aria-labelledby="privacy-title"><div class="dialog-shell prose"><div class="dialog-heading"><h2 id="privacy-title">Your settings stay here</h2><button class="icon-button" data-action="close-privacy" aria-label="Close privacy details">×</button></div><p>Local Sync Observer checks local addresses, folders, and Nextcloud logs that you choose. It stores source labels, paths, addresses, and API keys in this app’s local storage. It sends no telemetry and never changes synced files.</p><p>Removing a source removes its saved settings and cached reading. Uninstalling the app removes data according to your operating system’s application-data rules.</p><button class="button button--primary" data-action="close-privacy">Understood</button></div></dialog>`;
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>("[data-action]").forEach((element) => element.addEventListener("click", handleAction));
  document.querySelectorAll<HTMLButtonElement>("[data-source-id]:not([data-action])").forEach((button) => button.addEventListener("click", () => {
    state.selectedId = button.dataset.sourceId ?? null;
    render();
  }));
  const form = document.querySelector<HTMLFormElement>("#source-form");
  form?.addEventListener("submit", handleSourceSubmit);
  form?.querySelectorAll<HTMLInputElement>('input[name="kind"]').forEach((input) => input.addEventListener("change", toggleSourceFields));
}

async function handleAction(event: Event): Promise<void> {
  const element = event.currentTarget as HTMLElement;
  const action = element.dataset.action;
  if (action === "configure") {
    document.querySelector<HTMLDialogElement>("#source-dialog")?.showModal();
    document.querySelector<HTMLInputElement>('input[name="syncName"]')?.focus();
  }
  if (action === "close-source") document.querySelector<HTMLDialogElement>("#source-dialog")?.close();
  if (action === "dismiss-notice") { state.notice = ""; render(); }
  if (action === "show-privacy") document.querySelector<HTMLDialogElement>("#privacy-dialog")?.showModal();
  if (action === "close-privacy") document.querySelector<HTMLDialogElement>("#privacy-dialog")?.close();
  if (action === "choose-folder") await chooseFolder();
  if (action === "choose-nextcloud-log") await chooseNextcloudLog();
  if (action === "refresh" && element.dataset.sourceId) await refreshSource(element.dataset.sourceId);
  if (action === "open-owner" && element.dataset.sourceId) await openOwner(element.dataset.sourceId);
  if (action === "remove" && element.dataset.sourceId) removeSource(element.dataset.sourceId);
  if (action === "sample") addSample();
  if (action === "reset-demo") resetDemo();
  if (action === "start-real") startForReal();
}

function toggleSourceFields(event: Event): void {
  const kind = (event.target as HTMLInputElement).value;
  document.querySelectorAll<HTMLElement>("[data-fields]").forEach((group) => {
    const active = group.dataset.fields === kind;
    group.hidden = !active;
    group.setAttribute("aria-hidden", String(!active));
    group.querySelectorAll<HTMLInputElement>("input").forEach((input) => { input.disabled = !active; });
  });
}

async function chooseFolder(): Promise<void> {
  if (!isTauri()) {
    setFormError("Folder selection is available in the installed desktop app.");
    return;
  }
  const { open } = await import("@tauri-apps/plugin-dialog");
  const selected = await open({ directory: true, multiple: false, title: "Choose a folder to observe" });
  if (typeof selected === "string") {
    const input = document.querySelector<HTMLInputElement>('input[name="path"]');
    if (input) input.value = selected;
  }
}

async function chooseNextcloudLog(): Promise<void> {
  if (!isTauri()) {
    setFormError("Log selection is available in the installed desktop app.");
    return;
  }
  const { open } = await import("@tauri-apps/plugin-dialog");
  const selected = await open({ multiple: false, title: "Choose Nextcloud desktop log", filters: [{ name: "Log files", extensions: ["log", "txt"] }] });
  if (typeof selected === "string") {
    const input = document.querySelector<HTMLInputElement>('input[name="logPath"]');
    if (input) input.value = selected;
  }
}

function setFormError(message: string): void {
  const error = document.querySelector<HTMLElement>("#form-error");
  if (error) error.textContent = message;
}

function localEndpoint(value: string): boolean {
  try {
    const host = new URL(value).hostname;
    return host === "127.0.0.1" || host === "localhost" || host === "::1" || host.endsWith(".local");
  } catch { return false; }
}

async function handleSourceSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);
  const kind = String(data.get("kind"));
  const id = crypto.randomUUID();
  let source: Source;
  if (kind === "syncthing") {
    const endpoint = String(data.get("endpoint") ?? "").replace(/\/$/, "");
    if (!localEndpoint(endpoint)) { setFormError("Use Syncthing on this computer or a .local address. Remote addresses are outside this product’s scope."); return; }
    source = { id, kind: "syncthing", name: String(data.get("syncName")), endpoint, apiKey: String(data.get("apiKey")), ownerUrl: endpoint } satisfies SyncthingSource;
  } else if (kind === "nextcloud") {
    const logPath = String(data.get("logPath") ?? "");
    if (!logPath) { setFormError("Choose the current Nextcloud desktop log before saving."); return; }
    source = { id, kind: "nextcloud", name: String(data.get("nextcloudName")), logPath } satisfies NextcloudSource;
  } else {
    const path = String(data.get("path") ?? "");
    if (!path) { setFormError("Choose a folder before saving."); return; }
    source = { id, kind: "folder", name: String(data.get("folderName")), path, ownerUrl: String(data.get("ownerUrl") ?? "") || undefined } satisfies FolderSource;
  }
  state.sources.push(source);
  state.selectedId = source.id;
  save();
  document.querySelector<HTMLDialogElement>("#source-dialog")?.close();
  render();
  await refreshSource(source.id);
}

async function refreshSource(id: string): Promise<void> {
  if (demoMode) {
    state.notice = "Sample status is fixed so it never contacts a sync tool.";
    render();
    return;
  }
  const source = state.sources.find((candidate) => candidate.id === id);
  if (!source) return;
  state.loading.add(id);
  render();
  try {
    const reading = source.kind === "syncthing"
      ? await invoke<SourceReading>("probe_syncthing", { sourceId: source.id, name: source.name, endpoint: source.endpoint, apiKey: source.apiKey })
      : source.kind === "nextcloud"
        ? await invoke<SourceReading>("probe_nextcloud_log", { sourceId: source.id, name: source.name, logPath: source.logPath })
        : await invoke<SourceReading>("inspect_folder", { sourceId: source.id, name: source.name, path: source.path });
    state.readings[id] = reading;
    state.notice = `${source.name}: ${reading.summary}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    state.readings[id] = { sourceId: id, provider: source.kind, state: message.includes("Native checks") ? "offline" : "error", checkedAt: Date.now(), summary: message, folders: [], coverage: "Check failed before status details could be collected" };
    state.notice = `${source.name}: ${message}`;
  } finally {
    state.loading.delete(id);
    save();
    render();
  }
}

async function openOwner(id: string): Promise<void> {
  const source = state.sources.find((candidate) => candidate.id === id);
  if (source?.kind === "nextcloud") {
    if (!isTauri()) {
      state.notice = "Open Nextcloud in the installed desktop app to resolve this status.";
      render();
      return;
    }
    try {
      await invoke<void>("open_nextcloud", {});
    } catch (error) {
      state.notice = error instanceof Error ? error.message : String(error);
      render();
    }
    return;
  }
  const url = source?.ownerUrl;
  if (!url) return;
  if (isTauri()) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else window.open(url, "_blank", "noopener,noreferrer");
}

function removeSource(id: string): void {
  const source = state.sources.find((candidate) => candidate.id === id);
  if (!source || !window.confirm(`Remove “${source.name}” and its cached readings? No files will be changed.`)) return;
  state.sources = state.sources.filter((candidate) => candidate.id !== id);
  delete state.readings[id];
  state.selectedId = state.sources[0]?.id ?? null;
  state.notice = `${source.name} was removed from this observer.`;
  save();
  render();
}

function addSample(): void {
  demoMode = true;
  setDemoLocation(true);
  state.sources = [];
  state.readings = {};
  const id = "sample-evidence";
  const source: SyncthingSource = { id, kind: "syncthing", name: "Example: field notes", endpoint: "http://127.0.0.1:8384", apiKey: "demo-only", ownerUrl: "http://127.0.0.1:8384" };
  const nextcloud: NextcloudSource = { id: "sample-nextcloud", kind: "nextcloud", name: "Example: shared research", logPath: "~/Library/Application Support/Nextcloud/nextcloud.log" };
  const folders: FolderReading[] = [
    { id: "field-notes", label: "Field notes", path: "/Users/you/Documents/Field notes", state: "conflict", pendingFiles: null, conflictFiles: 1, lastGoodAt: Date.now() - 42 * 60_000, newestChangeAt: Date.now() - 3 * 60_000, note: "Found a filename matching Syncthing’s conflict-copy pattern. Open the sync tool to compare versions." }
  ];
  const summary = summarizeFolders(folders);
  const nextcloudFolders: FolderReading[] = [
    { id: "shared-research", label: "Shared research", path: nextcloud.logPath, state: "pending", pendingFiles: null, conflictFiles: 0, lastGoodAt: null, newestChangeAt: Date.now() - 2 * 60_000, note: "Sample Nextcloud desktop log reports sync activity still pending. It does not provide a reliable pending-file count." }
  ];
  state.sources = [source, nextcloud];
  state.readings = {
    [id]: { sourceId: id, provider: "Example Syncthing", checkedAt: Date.now(), folders, coverage: "Sample Syncthing conflict filename and status", ...summary },
    [nextcloud.id]: { sourceId: nextcloud.id, provider: "Example Nextcloud desktop log", checkedAt: Date.now(), folders: nextcloudFolders, coverage: "Sample Nextcloud desktop log status; no reliable pending-file count", state: "pending", summary: "Nextcloud reported sync activity still pending" }
  };
  state.selectedId = id;
  state.notice = "Sample board loaded in an isolated demo. It cannot change your real observer.";
  save();
  render();
}

function resetDemo(): void {
  if (!demoMode) return;
  localStorage.removeItem(DEMO_STORAGE_KEY);
  state.sources = [];
  state.readings = {};
  state.selectedId = null;
  state.notice = "";
  addSample();
}

function startForReal(): void {
  if (!demoMode) return;
  localStorage.removeItem(DEMO_STORAGE_KEY);
  demoMode = false;
  setDemoLocation(false);
  state.sources = [];
  state.readings = {};
  state.selectedId = null;
  state.notice = "Demo data was discarded. Add a source when you are ready.";
  render();
}

load();
if (demoMode && state.sources.length === 0) addSample();
else render();

if (isTauri()) {
  if (state.sources.length > 0) void Promise.all(state.sources.map((source) => refreshSource(source.id)));
  window.setInterval(() => { void Promise.all(state.sources.map((source) => refreshSource(source.id))); }, 30_000);
}

interface RouteState {
  localSyncObserverScroll?: { x: number; y: number };
}

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function saveScrollPosition(): void {
  try {
    history.replaceState({
      ...(history.state as RouteState | null ?? {}),
      localSyncObserverScroll: { x: window.scrollX, y: window.scrollY }
    } satisfies RouteState, "");
  } catch {
    // A document can become inactive before pagehide finishes. In that case,
    // the browser keeps the last position saved by the capture handlers.
  }
}

function restoreScrollPosition(): void {
  const position = (history.state as RouteState | null)?.localSyncObserverScroll;
  if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) return;
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(position.x, position.y);
  root.style.scrollBehavior = previousBehavior;
}

function announceRoute(restoreScroll = false): void {
  const heading = document.querySelector<HTMLElement>("main h1");
  const announcement = document.querySelector<HTMLElement>("[data-route-announcement]");
  if (!heading) return;
  requestAnimationFrame(() => {
    heading.focus({ preventScroll: true });
    if (restoreScroll) restoreScrollPosition();
    if (announcement) announcement.textContent = `${heading.textContent?.trim() ?? "Page"} loaded`;
  });
}

const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
const restoresHistoryEntry = navigation?.type === "back_forward";
const initializeRoute = (): void => announceRoute(restoresHistoryEntry);

document.addEventListener("click", event => {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
  if (link && link.origin === location.origin) saveScrollPosition();
}, { capture: true });
window.addEventListener("pagehide", saveScrollPosition);
window.addEventListener("pageshow", event => {
  if (event.persisted) announceRoute(true);
});
document.addEventListener("local-sync-observer:layout-ready", () => {
  if (restoresHistoryEntry) restoreScrollPosition();
});

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeRoute, { once: true });
else initializeRoute();

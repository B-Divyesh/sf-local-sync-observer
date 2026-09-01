function announceRoute(): void {
  const heading = document.querySelector<HTMLElement>("main h1");
  const announcement = document.querySelector<HTMLElement>("[data-route-announcement]");
  if (!heading) return;
  requestAnimationFrame(() => {
    heading.focus({ preventScroll: true });
    if (announcement) announcement.textContent = `${heading.textContent?.trim() ?? "Page"} loaded`;
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", announceRoute, { once: true });
else announceRoute();

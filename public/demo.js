const demoKey = "demo:local-sync-observer.site.v1";
const root = document.querySelector("#demo-app");

function sample() {
  return { checkedAt: Date.now() };
}

function read() {
  try {
    return JSON.parse(localStorage.getItem(demoKey) ?? "null") ?? sample();
  } catch {
    return sample();
  }
}

function render() {
  if (!root) return;
  const data = read();
  localStorage.setItem(demoKey, JSON.stringify(data));
  root.innerHTML = `<div class="demo-banner"><strong>Demo — sample data, nothing is saved to your real observer.</strong><div class="demo-actions"><button class="button" type="button" data-demo="reset">Reset demo</button><a class="button button--primary" href="/#download">Start for real</a></div></div><section class="demo-board" aria-labelledby="sample-reading"><p class="eyebrow">Example: field notes</p><div class="demo-status"><span aria-hidden="true">!</span> 1 conflict file needs attention<p id="sample-reading">Syncthing sample · no file contents opened</p></div><div class="mock-table" role="table" aria-label="Sample conflict reading"><div class="mock-row mock-head" role="row"><span role="columnheader">Folder</span><span role="columnheader">State</span><span role="columnheader">Pending</span></div><div class="mock-row" role="row"><b role="cell">Field notes</b><em class="conflict" role="cell">! Conflict</em><span role="cell">0</span></div></div><p class="demo-note">Evidence: a sample filename matches Syncthing’s conflict-copy pattern. The desktop app checks a provider only after you explicitly add a local source.</p></section>`;
  root.querySelector('[data-demo="reset"]')?.addEventListener("click", () => {
    localStorage.removeItem(demoKey);
    render();
  });
}

render();
if ("serviceWorker" in navigator && (location.protocol === "http:" || location.protocol === "https:")) {
  navigator.serviceWorker.register("/sw.js");
}

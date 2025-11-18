// js/main.js  (clean version: partials only)
async function fetchPartial(name) {
  // Try /partials/name.html first, then /name.html as a fallback
  const paths = [`partials/${name}.html`, `${name}.html`];
  for (const p of paths) {
    try {
      const res = await fetch(p);
      if (res.ok) return await res.text();
    } catch (_) { /* ignore and try next */ }
  }
  console.warn(`[partials] Not found: ${name}.html (tried ${paths.join(", ")})`);
  return null;
}

async function includePartials() {
  const slots = document.querySelectorAll("[data-include]");
  for (const el of slots) {
    const name = el.getAttribute("data-include");
    const html = await fetchPartial(name);
    if (html) {
      el.outerHTML = html;
    } else {
      // Leave a visible hint in the DOM if a partial is missing
      el.outerHTML = `<div style="padding:8px;color:#b91c1c;background:#fee2e2;border:1px solid #fecaca;border-radius:8px;">
        Missing partial: <b>${name}.html</b>
      </div>`;
    }
  }
}

(async () => {
  await includePartials();
})();

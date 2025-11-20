// Voice Phishing (Vishing) Scenario JavaScript
const step_1 = document.getElementById("step-1");
const step_2 = document.getElementById("step-2");
const step_3 = document.getElementById("step-3");
const ex_title = document.getElementById("ex-title");
const ex_list = document.getElementById("ex-list");
const next = document.getElementById("next-link");

document.addEventListener("DOMContentLoaded", async () => {
  const d = await fetch(window.SC_FILE).then(r => r.json());

  // Title
  document.getElementById("sc-title").textContent = d.title || "Voice Phishing Scenario";

  // Build left (legitimate) call
  buildCallInterface("call-a", d.left);
  
  // Build right (phishing) call
  buildCallInterface("call-b", d.right);

  // Interaction: find differences (usually 3-4)
  const needed = new Set(d.differences || []);
  const foundKeys = new Set();
  const meter = document.getElementById("found-count");

  step_1.addEventListener("click", e => {
    const t = e.target.closest(".clickable-area");
    if (!t) return;
    const key = t.dataset.key;
    if (!needed.has(key) || foundKeys.has(key)) return;

    // Highlight all matching elements
    document.querySelectorAll(`.clickable-area[data-key="${key}"]`)
      .forEach(el => el.classList.add("found"));

    foundKeys.add(key);
    meter.textContent = `${foundKeys.size}`;

    if (foundKeys.size === needed.size) {
      step_2.hidden = false;
      step_2.removeAttribute("aria-disabled");
      step_2.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // A/B pick
  const fb = document.getElementById("pick-feedback");
  document.querySelectorAll("#step-2 .pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#step-2 .pick-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");

      const choice = btn.dataset.choice;
      const correct = (choice === (d.answer || "B"));

      fb.textContent = correct ? "✅ Correct." : `❌ Not quite. The phishing call is ${d.answer || "B"}.`;

      sessionStorage.setItem(`scenario:${d.id}:done`, "1");
      next.removeAttribute("disabled");

      buildExplain(d);
      step_3.hidden = false;
      step_3.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  function buildCallInterface(containerId, data) {
    const container = document.getElementById(containerId);
    
    // Build transcript
    let transcriptHtml = '';
    data.transcript.forEach((line, idx) => {
      const isClickable = line.suspicious || false;
      const clickableClass = isClickable ? 'clickable-area' : '';
      const dataKey = isClickable ? `data-key="${line.key}"` : '';
      const speakerClass = line.speaker === 'Caller' ? 'caller' : 'you';
      
      transcriptHtml += `
        <div class="transcript-line ${speakerClass} ${clickableClass}" ${dataKey}>
          <span class="speaker">${line.speaker}:</span>
          <span class="text">${line.text}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="phone-call">
        <div class="caller-avatar">${data.avatar || "📞"}</div>
        <div class="caller-name">${data.callerName}</div>
        <div class="caller-number">${data.callerNumber}</div>
        <div class="call-status">Incoming Call</div>
        <div class="call-transcript">
          ${transcriptHtml}
        </div>
      </div>
    `;
  }

  function buildExplain(data) {
    ex_title.textContent = data.explainTitle || "Correct!";
    ex_list.innerHTML = (data.explainPoints || [])
      .map(p => `<li>${p}</li>`)
      .join("");
  }
});

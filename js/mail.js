// Shorthand refs
const step_1 = document.getElementById("step-1");
const step_2 = document.getElementById("step-2");
const step_3 = document.getElementById("step-3");
const a_from = document.getElementById("a-from");
const a_to   = document.getElementById("a-to");
const a_subj = document.getElementById("a-subj");
const a_body = document.getElementById("a-body");
const b_from = document.getElementById("b-from");
const b_to   = document.getElementById("b-to");
const b_subj = document.getElementById("b-subj");
const b_body = document.getElementById("b-body");
const ex_mail  = document.getElementById("ex-mail");
const ex_title = document.getElementById("ex-title");
const ex_list  = document.getElementById("ex-list");
const next     = document.getElementById("next-link");

// Email Phishing Education Popup - Show once per session
(function() {
  const popupOverlay = document.getElementById("email-popup-overlay");
  const closeBtn = document.getElementById("close-popup-btn");
  
  if (popupOverlay && closeBtn) {
    // Check if user has seen the popup this session
    const hasSeenPopup = sessionStorage.getItem("emailPopupSeen");
    
    if (!hasSeenPopup) {
      // Show popup after a brief delay
      setTimeout(() => {
        popupOverlay.style.display = "flex";
      }, 500);
      
      // Close button handler
      closeBtn.addEventListener("click", () => {
        popupOverlay.style.display = "none";
        sessionStorage.setItem("emailPopupSeen", "true");
      });
      
      // Close on overlay click (optional)
      popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
          popupOverlay.style.display = "none";
          sessionStorage.setItem("emailPopupSeen", "true");
        }
      });
    }
  }
})();

document.addEventListener("DOMContentLoaded", async () => {
  const d = await fetch(window.SC_FILE).then(r => r.json());

  // Title
  document.getElementById("sc-title").textContent = d.title || "Scenario";
  document.getElementById("sc-intro").innerHTML =
    "Select the <b>THREE</b> differences between the two examples.";

  // Wrap helper
  const wrap = (html, key, extra="") =>
    `<span class="pair target ${extra}" data-key="${key}">${html}</span>`;

  // ---------- LEFT (legit) ----------
  // From: wrap only the address inside <...>
  const lm = d.left.from.match(/<([^>]+)>/);
  a_from.innerHTML = lm
    ? d.left.from.replace(`<${lm[1]}>`, wrap(`&lt;${lm[1]}&gt;`, "from"))
    : d.left.from;

  // To:
  a_to.innerHTML = wrap(d.left.to, "to");

  // Subject + body
  a_subj.textContent = d.left.subject;
  a_body.innerHTML   = d.left.bodyHtml;

  // Wrap greeting if it's a difference
  if (d.differences && d.differences.includes("greeting")) {
    const greetingMatch = a_body.innerHTML.match(/(<p>)(Dear [^<,]+|Hi[^<,]*)(,?<\/p>)/i);
    if (greetingMatch) {
      a_body.innerHTML = a_body.innerHTML.replace(
        greetingMatch[0],
        `${greetingMatch[1]}${wrap(greetingMatch[2], "greeting")}${greetingMatch[3]}`
      );
    }
  }

  // Wrap subject if it's a difference
  if (d.differences && d.differences.includes("subject")) {
    a_subj.innerHTML = wrap(d.left.subject, "subject");
  }

  // Link in left (safe portal)
  const leftLink = a_body.querySelector("a.safe") || a_body.querySelector("a");
  if (leftLink) { leftLink.classList.add("pair","target"); leftLink.dataset.key = "link"; }

  // ---------- RIGHT (phish) ----------
  // From: wrap the address inside <...>
  const rm = d.right.from.match(/<([^>]+)>/);
  b_from.innerHTML = rm
    ? d.right.from.replace(`<${rm[1]}>`, wrap(`&lt;${rm[1]}&gt;`, "from"))
    : d.right.from;

  // To:
  b_to.innerHTML = wrap(d.right.to, "to");

  // Subject + body
  b_subj.textContent = d.right.subject;
  b_body.innerHTML   = d.right.bodyHtml;

  // Wrap greeting if it's a difference
  if (d.differences && d.differences.includes("greeting")) {
    const greetingMatch = b_body.innerHTML.match(/(<p>)(Dear [^<,]+|Hi[^<,]*)(,?<\/p>)/i);
    if (greetingMatch) {
      b_body.innerHTML = b_body.innerHTML.replace(
        greetingMatch[0],
        `${greetingMatch[1]}${wrap(greetingMatch[2], "greeting")}${greetingMatch[3]}`
      );
    }
  }

  // Wrap subject if it's a difference
  if (d.differences && d.differences.includes("subject")) {
    b_subj.innerHTML = wrap(d.right.subject, "subject");
  }

  // Link in right (click-here)
  const rightLink = b_body.querySelector("a.click-here") || b_body.querySelector("a");
  if (rightLink) { rightLink.classList.add("pair","target"); rightLink.dataset.key = "link"; }

  // ---------- Interaction: find 3 unique differences ----------
  const needed = new Set(d.differences || ["from","to","link"]);
  const foundKeys = new Set();
  const meter = document.getElementById("found-count");

  step_1.addEventListener("click", e => {
    const t = e.target.closest(".target");
    if (!t) return;
    const key = t.dataset.key;
    if (!needed.has(key) || foundKeys.has(key)) return;

    // Reveal highlight on BOTH sides for this key
    document.querySelectorAll(`.pair[data-key="${key}"]`)
      .forEach(el => el.classList.add("found"));

    foundKeys.add(key);
    meter.textContent = `${foundKeys.size}`;

    if (foundKeys.size === needed.size) {
      step_2.hidden = false;
      step_2.removeAttribute("aria-disabled");
      step_2.scrollIntoView({ behavior:"smooth", block:"start" });
    }
  });

  // ---------- A/B pick ----------
  const fb = document.getElementById("pick-feedback");
  document.querySelectorAll("#step-2 .pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#step-2 .pick-btn").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");

      const choice  = btn.dataset.choice;
      const correct = (choice === (d.answer || "B"));

      fb.textContent = correct ? "✅ Correct." : `❌ Not quite. The phishing one is ${d.answer || "B"}.`;

      sessionStorage.setItem(`scenario:${d.id}:done`, "1");
      next.removeAttribute("disabled");

      buildExplain(d, correct);
      step_3.hidden = false;
      step_3.scrollIntoView({ behavior:"smooth", block:"start" });
    });
  });

  // ---------- Step 3 ----------
  function buildExplain(data, correct){
    // Clone the *phish* email based on answer (A=left[0], B=right[1])
    const phishIndex = (data.answer === "A") ? 0 : 1;
    const clone = document.querySelectorAll("#step-1 .mail")[phishIndex].cloneNode(true);
    let n = 0;
    clone.querySelectorAll('.pair[data-key]').forEach(el => {
      const key = el.dataset.key;
      if (needed.has(key)) {
        el.classList.add("found");
        const num = document.createElement("span");
        num.className = "num-badge";
        num.textContent = String(++n);
        el.after(num);
      }
    });

    ex_mail.innerHTML = "";
    ex_mail.appendChild(clone);

    ex_title.textContent = correct ? (data.explainTitle || "That's right!") : "Here's why:";
    ex_list.innerHTML = (data.explainPoints || []).map(p => `<li>${p}</li>`).join("");
  }
});

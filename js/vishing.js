// Voice Phishing (Vishing) Scenario JavaScript
const step_1 = document.getElementById("step-1");
const step_2 = document.getElementById("step-2");
const step_3 = document.getElementById("step-3");
const ex_title = document.getElementById("ex-title");
const ex_list = document.getElementById("ex-list");
const next = document.getElementById("next-link");

// Voice Phishing Education Popup - Show once per session
(function() {
  const popupOverlay = document.getElementById("vishing-popup-overlay");
  const closeBtn = document.getElementById("close-vishing-popup-btn");
  
  if (popupOverlay && closeBtn) {
    // Check if user has seen the popup this session
    const hasSeenPopup = sessionStorage.getItem("vishingPopupSeen");
    
    if (!hasSeenPopup) {
      // Show popup after a brief delay
      setTimeout(() => {
        popupOverlay.style.display = "flex";
      }, 500);
      
      // Close button handler
      closeBtn.addEventListener("click", () => {
        popupOverlay.style.display = "none";
        sessionStorage.setItem("vishingPopupSeen", "true");
      });
      
      // Close on overlay click (optional)
      popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
          popupOverlay.style.display = "none";
          sessionStorage.setItem("vishingPopupSeen", "true");
        }
      });
    }
  }
})();

document.addEventListener("DOMContentLoaded", async () => {
  const d = await fetch(window.SC_FILE).then(r => r.json());

  // Title
  document.getElementById("sc-title").textContent = d.title || "Voice Phishing Scenario";

  // Build left (legitimate) call
  buildCallInterface("call-a", d.left);
  
  // Build right (phishing) call
  buildCallInterface("call-b", d.right);

  // A/B pick - directly available
  const fb = document.getElementById("pick-feedback");
  document.querySelectorAll(".pick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pick-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");

      const choice = btn.dataset.choice;
      const correct = (choice === (d.answer || "B"));

      fb.textContent = correct ? "✅ Correct." : `❌ Wrong answer. The phishing call is ${d.answer || "B"}.`;

      sessionStorage.setItem(`scenario:${d.id}:done`, "1");
      next.removeAttribute("disabled");

      buildExplain(d, correct);
      const step_2 = document.getElementById("step-2");
      if (step_2) {
        step_2.hidden = false;
        step_2.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  function buildCallInterface(containerId, data) {
    const container = document.getElementById(containerId);
    
    // Build transcript - no clickable areas
    let transcriptHtml = '';
    data.transcript.forEach((line, idx) => {
      const speakerClass = line.speaker === 'Caller' ? 'caller' : 'you';
      
      transcriptHtml += `
        <div class="transcript-line ${speakerClass}">
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

  function buildExplain(data, isCorrect) {
    ex_title.textContent = isCorrect ? "Correct!" : "Not quite right";
    ex_list.innerHTML = (data.explainPoints || [])
      .map(p => `<li>${p}</li>`)
      .join("");
  }
});

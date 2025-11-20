// SMS Scenario JavaScript
const step_1 = document.getElementById("step-1");
const step_2 = document.getElementById("step-2");
const step_3 = document.getElementById("step-3");
const ex_title = document.getElementById("ex-title");
const ex_list = document.getElementById("ex-list");
const next = document.getElementById("next-link");

// SMS Smishing Education Popup - Show once per session
(function() {
  const popupOverlay = document.getElementById("sms-popup-overlay");
  const closeBtn = document.getElementById("close-sms-popup-btn");
  
  if (popupOverlay && closeBtn) {
    // Check if user has seen the popup this session
    const hasSeenPopup = sessionStorage.getItem("smsPopupSeen");
    
    if (!hasSeenPopup) {
      // Show popup after a brief delay
      setTimeout(() => {
        popupOverlay.style.display = "flex";
      }, 500);
      
      // Close button handler
      closeBtn.addEventListener("click", () => {
        popupOverlay.style.display = "none";
        sessionStorage.setItem("smsPopupSeen", "true");
      });
      
      // Close on overlay click (optional)
      popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
          popupOverlay.style.display = "none";
          sessionStorage.setItem("smsPopupSeen", "true");
        }
      });
    }
  }
})();

document.addEventListener("DOMContentLoaded", async () => {
  const d = await fetch(window.SC_FILE).then(r => r.json());

  // Title
  document.getElementById("sc-title").textContent = d.title || "SMS Scenario";

  // Build left (legit) phone
  buildPhone("phone-a", d.left, "from");
  
  // Build right (phish) phone
  buildPhone("phone-b", d.right, "from");

  // Interaction: find differences
  const needed = new Set(d.differences || ["from", "number", "link"]);
  const foundKeys = new Set();

  step_1.addEventListener("click", e => {
    const t = e.target.closest(".clickable-area");
    if (!t) return;
    const key = t.dataset.key;
    if (!needed.has(key) || foundKeys.has(key)) return;

    // Highlight all matching elements
    document.querySelectorAll(`.clickable-area[data-key="${key}"]`)
      .forEach(el => el.classList.add("found"));

    foundKeys.add(key);

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

      fb.textContent = correct ? "✅ Correct." : `❌ Not quite. The phishing one is ${d.answer || "B"}.`;

      sessionStorage.setItem(`scenario:${d.id}:done`, "1");
      next.removeAttribute("disabled");

      buildExplain(d);
      step_3.hidden = false;
      step_3.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  function buildPhone(containerId, data, side) {
    const container = document.getElementById(containerId);
    
    let messagesHtml = '';
    data.messages.forEach((msg, idx) => {
      const msgType = msg.type || 'received';
      const linkClass = msg.hasLink ? 'clickable-area' : '';
      const dataKey = msg.hasLink ? `data-key="message-${idx + 1}"` : '';
      
      messagesHtml += `
        <div class="message-bubble ${msgType}">
          <div class="message-content ${linkClass}" ${dataKey}>
            ${msg.text}
            <div class="message-time">${msg.time}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="phone-container">
        <div class="phone-screen">
          <div class="notch"></div>
          
          <div class="status-bar">
            <div class="status-left">
              <span>9:41</span>
            </div>
            <div class="status-right">
              <span>📶</span>
              <span>📡</span>
              <span>🔋</span>
            </div>
          </div>

          <div class="message-header">
            <p class="contact-name clickable-area" data-key="from">${data.from}</p>
            ${data.number ? `<p class="contact-number clickable-area" data-key="number">${data.number}</p>` : ''}
          </div>

          <div class="messages-area">
            ${messagesHtml}
          </div>

          <div class="input-bar">
            <span style="font-size: 24px; color: #8e8e93;">📷</span>
            <div class="input-placeholder">iMessage</div>
            <span style="font-size: 20px; color: #007aff;">↑</span>
          </div>
        </div>
      </div>
    `;
  }

  function buildExplain(data) {
    ex_title.textContent = data.explainTitle || "That's right!";
    ex_list.innerHTML = "";
    (data.explainPoints || []).forEach(point => {
      const li = document.createElement("li");
      li.innerHTML = point;
      ex_list.appendChild(li);
    });
  }
});

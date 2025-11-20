/* Scenario hub - session-based progress tracking */

const scenarios = [
  { id:"e1",  title:"Password change",       hint:"Email phishing",   thumb:"g1",  href:"email-1.html",  required:true },
  { id:"e2",  title:"Invoice attachment",    hint:"Email phishing",   thumb:"g2",  href:"email-2.html",  required:true },
  { id:"e3",  title:"Delivery notice",       hint:"Email phishing",   thumb:"g3",  href:"email-3.html",  required:true },
  { id:"e4",  title:"Health benefits",       hint:"Email phishing",   thumb:"g4",  href:"email-4.html",  required:true },
  { id:"e5",  title:"Travel booking",        hint:"Email phishing",   thumb:"g5",  href:"email-5.html",  required:true },
  { id:"sms1", title:"Package delivery",     hint:"SMS phishing",     thumb:"g6",  href:"sms-1.html",  required:true },
  { id:"sms2", title:"Bank alert",           hint:"SMS phishing",     thumb:"g7",  href:"sms-2.html",  required:true },
  { id:"sms3", title:"Account verification", hint:"SMS phishing",     thumb:"g8",  href:"sms-3.html",  required:true },
  { id:"vishing1", title:"IT support alert", hint:"Voice phishing",   thumb:"g1",  href:"vishing-1.html",  required:true },
  { id:"vishing2", title:"Bank fraud call",  hint:"Voice phishing",   thumb:"g2",  href:"vishing-2.html",  required:true },

  // unlocks after all required are done
  { id:"summary", title:"Summary", hint:"Your results", thumb:"g2", href:"how.html", required:false, summary:true }
];

const doneKey = id => `scenario:${id}:done`;
const isDone = id => sessionStorage.getItem(doneKey(id)) === "1";

function stats(){
  const req = scenarios.filter(s => s.required);
  const done = req.filter(s => isDone(s.id)).length;
  return { done, total:req.length, all: done === req.length, pct: Math.round((done/req.length)*100) };
}

function render(){
  const grid = document.getElementById("scenario-grid");
  grid.innerHTML = "";

  // Display greeting with user's name if available
  const userName = sessionStorage.getItem('userName');
  const greetingEl = document.getElementById('greeting');
  if (greetingEl && userName) {
    greetingEl.textContent = `Hi ${userName}, Select a scenario`;
  }

  const { done, total, all, pct } = stats();

  scenarios.forEach((s, i) => {
    const finished = isDone(s.id);
    const locked = s.summary && !all;

    const card = document.createElement("article");
    card.className = `card${locked ? " locked" : ""}`;
    card.tabIndex = 0;
    card.setAttribute("role","button");
    card.setAttribute("aria-label", s.title + (locked ? " (locked)" : ""));

    card.innerHTML = `
      <div class="thumb ${s.thumb}"></div>
      <div class="body">
        <h2 class="title">${s.title}</h2>
        <div class="meta">
          <span>${s.summary ? "" : `Scenario ${i+1}`}</span>
          <span class="pill ${finished ? "done" : ""}"><span class="dot"></span>${finished ? "Done" : "Not done"}</span>
        </div>
      </div>
      ${locked ? `<div class="lock" title="Finish all scenarios to unlock">🔒</div>` : ""}
    `;

    const go = () => { if (!locked) window.location.href = s.href; };
    card.addEventListener("click", go);
    card.addEventListener("keydown", e => {
      if ((e.key === "Enter" || e.key === " ") && !locked){ e.preventDefault(); go(); }
    });

    grid.appendChild(card);
  });

  document.getElementById("progress-bar").style.width = pct + "%";
  document.getElementById("progress-text").textContent = `${done}/${total} completed`;
}

document.addEventListener("DOMContentLoaded", render);

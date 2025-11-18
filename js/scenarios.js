/* Scenario hub - session-based progress tracking */

const scenarios = [
  { id:"s1",  title:"Time for change",       hint:"HR update",        thumb:"g1",  href:"scenario-1.html",  required:true },
  { id:"s2",  title:"Please see attached",   hint:"Attachment lure",  thumb:"g2",  href:"scenario-2.html",  required:true },
  { id:"s3",  title:"Get involved",          hint:"Event invite",     thumb:"g3",  href:"scenario-3.html",  required:true },
  { id:"s4",  title:"Your health benefits",  hint:"Benefits portal",  thumb:"g4",  href:"scenario-4.html",  required:true },
  { id:"s5",  title:"Enjoy your stay",       hint:"Travel booking",   thumb:"g5",  href:"scenario-5.html",  required:true },
  { id:"s6",  title:"Verify your account",   hint:"Login reset",      thumb:"g6",  href:"scenario-6.html",  required:true },
  { id:"s7",  title:"Delivery notice",       hint:"Missed package",   thumb:"g7",  href:"scenario-7.html",  required:true },
  { id:"s8",  title:"CEO request",           hint:"Urgent payment",   thumb:"g8",  href:"scenario-8.html",  required:true },
  { id:"s9",  title:"Bank alert",            hint:"OTP harvest",      thumb:"g9",  href:"scenario-9.html",  required:true },
  { id:"s10", title:"Update benefits form",  hint:"Doc link",         thumb:"g10", href:"scenario-10.html", required:true },

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

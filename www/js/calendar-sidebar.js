let phase = "start"; // 'start' or 'end'
let startIdx = null,
  endIdx = null;
// let selectedDate = null;           // set by calendar.js on day-click

const overlay = document.getElementById("menuOverlay");
const menu = document.getElementById("menu");
const bbC = document.getElementById("bbContainer");
const pC = document.getElementById("pereksContainer");
const clear = document.getElementById("clearBtn");
const cancel = document.getElementById("cancelBtn");
const back = document.getElementById("backBtn");
const instr = document.getElementById("instruction");
const clearAll = document.getElementById('clearAllBtn');

// compute global index
function findIndex(mi, pi) {
  let c = 0;
  for (let i = 0; i < mi; i++) c += mesechtotData[i].pereks;
  return c + pi - 1;
}

// show masechet buttons
mesechtotData.forEach((m, mi) => {
  const btn = document.createElement("div");
  btn.className = "bb";
  btn.innerText = m.name;
  back.classList.add("hidden");
  //   pC.innerHTML = 'step 1/4 select masechet';
  btn.addEventListener("click", () => {
    // switch to perek list for this masechet
    bbC.classList.add("hidden");

    back.classList.add("hidden");

    if (phase === "start") {
      instr.innerText = "Select start perek";
      back.classList.remove("hidden");
    } else {
      instr.innerText = "Select end perek";
      back.classList.remove("hidden");
    }

    // build perek buttons
    for (let j = 1; j <= m.pereks; j++) {
      const q = document.createElement("div");
      q.className = "perek";
      q.innerText = `${m.name} פרק ${toHebrewNumber(j)}`;
      q.dataset.mi = mi;
      q.dataset.pi = j;
      q.addEventListener("click", async () => {
        const mi2 = Number(q.dataset.mi);
        const pi2 = Number(q.dataset.pi);
        const idx = findIndex(mi2, pi2);

        if (phase === "start") {
          // record start
          startIdx = idx;
          phase = "end";
          instr.innerText = "Now select end masechet";
          // return to masechet list:
          pC.innerHTML = "";
          bbC.classList.remove("hidden");
          back.classList.add("hidden");
        } else {
          // record end and save
          endIdx = idx;
          const from = Math.min(startIdx, endIdx);
          const to = Math.max(startIdx, endIdx);
          const total = to - from + 1;
          await saveDailyProgressToDB(selectedDate, from, to, total);
          // reset & close
          resetMenu();
          phase = "start";
          overlay.classList.add("hidden");
          menu.classList.add("menu-hidden");
          renderCalendar();
        }
      });
      pC.appendChild(q);
    }
  });
  bbC.appendChild(btn);
});
function clearPhase() {
  phase = "start";
  startIdx = null;
  bbC.classList.remove("hidden");
  pC.innerHTML = "";
  back.classList.add("hidden");
  //   clear.classList.add('hidden');
}
// Cancel button always closes & resets
cancel.addEventListener("click", () => {
  phase = "start";
  overlay.classList.add("hidden");
  menu.classList.add("menu-hidden");
  bbC.classList.remove("hidden");
  pC.innerHTML = "";
  instr.innerText = "Select a date";
});

// Clicking outside closes & resets
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    phase = "start";
    overlay.classList.add("hidden");
    menu.classList.add("menu-hidden");
    bbC.classList.remove("hidden");
    pC.innerHTML = "";
    instr.innerText = "Select a date";
  }
});

// BACK arrow: go from perek level back to masechet list
back.addEventListener("click", () => {
  //   phase = 'start';
  pC.innerHTML = "";
  bbC.classList.remove("hidden");
  back.classList.add("hidden");
  clear.classList.remove("hidden");
  if (startIdx !== null) {
    instr.innerText = "Now select end mesechet";
  } else {
    instr.innerText = "Select start mesechet";
  }
});
// clear → delete that date’s record
clear.addEventListener("click", async () => {
  await deleteProgress(selectedDate);
  clearPhase();
  overlay.classList.add("hidden");
  menu.classList.add("menu-hidden");
  renderCalendar();
});

// Clear ALL dates after confirmation
clearAll.addEventListener('click', async () => {
  if (!confirm('Really erase ALL saved dates?')) return;
  await clearAllProgress();
  resetMenu();
  overlay.classList.add('hidden');
  menu.classList.add('menu-hidden');
  renderCalendar();
});

// Reset everything back to the initial state
function resetMenu() {
  phase = "start";
  startIdx = null;
  bbC.classList.remove("hidden");
  pC.innerHTML = "";
  back.classList.add("hidden");
  //   clear.classList.add('hidden');
  instr.innerText = "Select a date";
  // Prevent this date from reopening the menu
  // by removing its click listener:
  const dayEls = document.querySelectorAll(`.day[data-date="${selectedDate}"]`);
  dayEls.forEach((d) => d.replaceWith(d.cloneNode(true)));
}

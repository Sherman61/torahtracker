// js/mishnascript.js

// =========================
// Constants & global state
// =========================

const HEBREW_PEREK_DIGITS = [
  "א",
  "ב",
  "ג",
  "ד",
  "ה",
  "ו",
  "ז",
  "ח",
  "ט",
  "י",
  'י"א',
  'י"ב',
  'י"ג',
  'י"ד',
  'ט"ו',
  'ט"ז',
  'י"ז',
  'י"ח',
  'י"ט',
  "כ",
  'כ"א',
  'כ"ב',
  'כ"ג',
  'כ"ד',
  'כ"ה',
  'כ"ו',
  'כ"ז',
  'כ"ח',
  'כ"ט',
  "ל",
];

// Raw data from mesechot-data.js
let mesechotListData = []; // includes sections
let realMasechtot = []; // only items with {name, pereks}

// Progress / state
let totalPereks = 0;
let currentGlobalPerekIndex = 0; // zero-based
let pereksTodayStartIndex = 0;
let lastDate = "";
let isShowingPereks = false;

// =========================
// Initialization helpers
// =========================

/**
 * Ensure localStorage has sane defaults for first-time users.
 */
function initializeDefaults() {
  if (localStorage.getItem("mesechet") === null) {
    localStorage.setItem("mesechet", "ברכות");
    localStorage.setItem("perek", "perek 1");
    localStorage.setItem("globalPerekIndex", "1");
  }

  if (localStorage.getItem("selectedTheme") === null) {
    localStorage.setItem("selectedTheme", "light");
  }
  if (localStorage.getItem("perekGoal") === null) {
    localStorage.setItem("perekGoal", "18");
  }
  if (localStorage.getItem("displayPerekGoal") === null) {
    localStorage.setItem("displayPerekGoal", "true");
  }
}

initializeDefaults();

// =========================
// Index / mapping utilities
// =========================

/**
 * Compute the global perek index (0-based) given:
 * - mesechetIndex1Based: index into realMasechtot (1-based)
 * - perekIndexZeroBased: which perek within that masechet (0-based)
 */
function calculateGlobalPerekIndex(mesechetIndex1Based, perekIndexZeroBased) {
  let globalPerekIndex = 0;

  for (let i = 0; i < mesechetIndex1Based - 1; i++) {
    globalPerekIndex += realMasechtot[i].pereks;
  }

  globalPerekIndex += perekIndexZeroBased;
  return globalPerekIndex;
}

/**
 * Given a 0-based global index, return { mesechet, perek } (with Hebrew digit).
 */
function findMesechetAndPerekByIndex(idxZeroBased) {
  let cumulative = 0;

  for (let i = 0; i < realMasechtot.length; i++) {
    const count = realMasechtot[i].pereks;

    if (cumulative + count > idxZeroBased) {
      const localIndex = idxZeroBased - cumulative;
      return {
        mesechet: realMasechtot[i].name,
        perek: HEBREW_PEREK_DIGITS[localIndex] || "?",
      };
    }

    cumulative += count;
  }

  return { mesechet: "Unknown", perek: "?" };
}

// =========================
// UI update: header text
// =========================

function updateMesAndPerek() {
  const mesechet = localStorage.getItem("mesechet") || "";
  let perekNumber = (localStorage.getItem("perek") || "").split(" ")[1] || "";

  if (perekNumber) {
    perekNumber = HEBREW_PEREK_DIGITS[parseInt(perekNumber, 10) - 1];
  }

  const mesAndPerekElement = document.getElementById("mesandperek");
  if (mesAndPerekElement) {
    mesAndPerekElement.innerText = `${mesechet} פרק ${perekNumber}`;
  }
}

// =========================
// UI update: stats block
// =========================

function updateStats() {
  const finishedElement = document.getElementById("finished");
  if (finishedElement) {
    finishedElement.innerText = `Pereks done: ${currentGlobalPerekIndex}`;
  }

  const percentDoneElement = document.getElementById("percentdone");
  if (percentDoneElement) {
    const percentDone = Math.round(
      (currentGlobalPerekIndex / totalPereks) * 100
    );
    percentDoneElement.innerText = `Percent done: ${percentDone}%`;
  }

  const toGoElement = document.getElementById("to-go");
  if (toGoElement) {
    const toGo = totalPereks - currentGlobalPerekIndex;
    toGoElement.innerText = `Pereks left: ${toGo}`;
  }

  const pereksTodayElement = document.getElementById("today");
  if (pereksTodayElement) {
    const pereksToday = localStorage.getItem("pereksToday") || 0;
    pereksTodayElement.innerText = `Pereks today: ${Math.abs(pereksToday)}`;
  }
}

// =========================
// Goal display & persistence
// =========================

function updateGoalDisplayParagraph() {
  const goalElement = document.getElementById("goal");
  const displayPerekGoal = localStorage.getItem("displayPerekGoal") === "true";

  if (!goalElement) return;

  if (!displayPerekGoal) {
    goalElement.style.display = "none";
    return;
  }

  let perekGoal = parseInt(localStorage.getItem("perekGoal"), 10) || 18;
  const startIndex =
    parseInt(localStorage.getItem("pereksTodayStartIndex"), 10) || 0;

  if (isNaN(perekGoal) || perekGoal <= 0) perekGoal = 18;

  const goalIndex = startIndex + perekGoal;
  const currentIndex = currentGlobalPerekIndex;

  const { mesechet, perek } = findMesechetAndPerekByIndex(goalIndex);
  const isComplete = currentIndex >= goalIndex;
  const checkMark = isComplete ? " ✅" : "";

  goalElement.innerText = `Goal: ${mesechet} פרק ${perek}${checkMark}`;
  goalElement.style.display = "block";

  if (!isComplete) return;

  // If goal is complete, sync with IndexedDB
  const today = new Date().toISOString().split("T")[0];
  getProgress(today).then((record) => {
    const start = pereksTodayStartIndex;
    const end = currentGlobalPerekIndex;
    const doneToday = end - start;

    if (record && !record.goalReached) {
      saveDailyProgressToDB(today, start, end, doneToday, true);
    } else if (!record) {
      saveDailyProgressToDB(today, startIndex, currentIndex, perekGoal, true);
    }
  });
}

// =========================
// Daily progress updating
// =========================

/**
 * Update "pereksToday" and persist the daily progress to IndexedDB.
 */
function updatePereksToday(previousIndex, currentIndex) {
  let difference = currentIndex - pereksTodayStartIndex;

  // Handle wrap-around case
  if (currentIndex < pereksTodayStartIndex) {
    const remainingPereks = totalPereks - pereksTodayStartIndex;
    difference = remainingPereks + currentIndex;
  }

  const pereksToday = Math.max(difference, 0);

  localStorage.setItem("pereksToday", `${pereksToday}`);
  updateStats();

  const date = new Date().toISOString().split("T")[0];
  const start = pereksTodayStartIndex;
  const end = currentGlobalPerekIndex;
  const doneToday = end - start;

  saveDailyProgressToDB(date, start, end, doneToday);
}

/**
 * Handle click on a specific perek.
 */
function handlePerekClick(previousIndex, newIndex, mesechet, perekNumber) {
  const diff = newIndex - previousIndex;

  // If user jumps far back, ask whether to reset today’s start index
  if (diff < -100 || (diff < -50 && confirm("Reset to earlier perek?"))) {
    pereksTodayStartIndex = newIndex;
  }

  currentGlobalPerekIndex = newIndex;

  localStorage.setItem("globalPerekIndex", currentGlobalPerekIndex + 1);
  localStorage.setItem("mesechet", mesechet);
  localStorage.setItem("perek", `perek ${perekNumber}`);
  localStorage.setItem("pereksTodayStartIndex", pereksTodayStartIndex);

  updatePereksToday(previousIndex, currentGlobalPerekIndex);
  updateStats();
  updateMesAndPerek();
  updateGoalDisplayParagraph();
  checkAndLaunchGoalConfetti();
}

// =========================
// Scroll behavior toggles
// =========================

/**
 * Check whether scroll is allowed based on global & per-page settings.
 * pageKey: "scrollMishnayes", "scrollTehillim", etc.
 */
function isScrollEnabledFor(pageKey) {
  const globalRaw = localStorage.getItem("scrollGlobal");
  const globalOn = globalRaw === null || globalRaw === "true";
  if (!globalOn) return false;

  const pageRaw = localStorage.getItem(pageKey);
  const pageOn = pageRaw === null || pageRaw === "true";

  return pageOn;
}

/**
 * Scroll to current Masechet (if enabled).
 * Respects BOTH:
 *  - legacy "scrollToCurrentMesechet" flag
 *  - new "scrollGlobal" + "scrollMishnayes" flags
 */
function scrollToCurrentMesechet() {
  const legacySetting = localStorage.getItem("scrollToCurrentMesechet");
  if (legacySetting === "false") {
    // user explicitly turned off old setting
    return;
  }

  if (!isScrollEnabledFor("scrollMishnayes")) return;

  const mesechetName = (localStorage.getItem("mesechet") || "").trim();
  if (!mesechetName) return;

  const bbEls = document.querySelectorAll(".bb");
  let targetEl = null;

  bbEls.forEach((el) => {
    el.classList.remove("current-mesechet");
    if (!targetEl && el.textContent.trim() === mesechetName) {
      targetEl = el;
    }
  });

  // Fallback to first if nothing matched
  if (!targetEl && bbEls.length > 0) {
    targetEl = bbEls[0];
  }
  if (!targetEl) return;

  targetEl.classList.add("current-mesechet");

  targetEl.scrollIntoView({
    block: "center",
    behavior: "smooth",
  });
}

// =========================
// Masechet / Perek rendering
// =========================

/**
 * Render the main Masechet list (with section headers).
 */
function renderMesechetList() {
  isShowingPereks = false;

  const mesechetList = document.getElementById("mesechetList");
  if (!mesechetList) return;

  mesechetList.innerHTML = "";
  let realIndex = 0;

  mesechotListData.forEach((item) => {
    // Section header
    if (item.section) {
      const li = document.createElement("li");
      li.classList.add("section-title");

      const label = document.createElement("span");
      label.textContent = item.section;

      li.appendChild(label);
      mesechetList.appendChild(li);
      return;
    }

    // Actual Masechet row
    const li = document.createElement("li");
    const p = document.createElement("p");

    p.classList.add("bb", `bb${item.pereks}`);
    p.textContent = item.name;
    p.style.cursor = "pointer";

    const realIndex1Based = realIndex + 1;
    p.dataset.realIndex = String(realIndex1Based);

    p.addEventListener("click", (e) => {
      e.stopPropagation();
      renderPerekList(realIndex1Based);
    });

    li.appendChild(p);
    mesechetList.appendChild(li);

    realIndex++;
  });

  // After rendering, auto-scroll if needed
  setTimeout(scrollToCurrentMesechet, 0);
}

/**
 * Render the Perek list for a given realMasechetIndex1Based.
 */
function renderPerekList(realMasechetIndex1Based) {
  isShowingPereks = true;

  const mesechetList = document.getElementById("mesechetList");
  if (!mesechetList) return;

  const mesechet = realMasechtot[realMasechetIndex1Based - 1];
  if (!mesechet) return;

  mesechetList.innerHTML = "";

  // Header row with title + X button
  const headerLi = document.createElement("li");
  headerLi.classList.add("perek-header");

  const headerWrapper = document.createElement("div");
  headerWrapper.style.display = "flex";
  headerWrapper.style.justifyContent = "space-between";
  headerWrapper.style.alignItems = "center";

  const titleSpan = document.createElement("span");
  titleSpan.textContent = mesechet.name;
  titleSpan.className = "perek-header-title";

  const closeBtn = document.createElement("i");
  closeBtn.className = "fa-solid fa-x perek-close-button";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "1.2rem";
  closeBtn.style.padding = "4px";

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    renderMesechetList();
  });

  headerWrapper.appendChild(titleSpan);
  headerWrapper.appendChild(closeBtn);
  headerLi.appendChild(headerWrapper);
  mesechetList.appendChild(headerLi);

  // Perek list
  for (let i = 0; i < mesechet.pereks; i++) {
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.style.cursor = "pointer";

    const perekHebrewNumber = HEBREW_PEREK_DIGITS[i];
    p.textContent = `${mesechet.name} פרק ${perekHebrewNumber}`;

    p.addEventListener("click", (e) => {
      e.stopPropagation();

      const globalPerekIndex = calculateGlobalPerekIndex(
        realMasechetIndex1Based,
        i
      );

      handlePerekClick(
        currentGlobalPerekIndex,
        globalPerekIndex,
        mesechet.name,
        i + 1
      );

      renderMesechetList();
    });

    li.appendChild(p);
    mesechetList.appendChild(li);
  }
}

// Close perek view if clicking outside sidebar
document.addEventListener("click", function (event) {
  if (!isShowingPereks) return;

  const sidebar = document.querySelector(".sidebar");
  if (sidebar && !sidebar.contains(event.target)) {
    renderMesechetList();
  }
});

// =========================
// DOMContentLoaded bootstrap
// =========================

document.addEventListener("DOMContentLoaded", () => {
  // If you ever decide to re-use buildMesechetList(), it could go here.
  // For now we build from mesechotData manually.

  // Load raw data
  mesechotListData = Array.isArray(mesechotData) ? mesechotData : [];
  realMasechtot = mesechotListData.filter(
    (item) => item.name && typeof item.pereks === "number"
  );
  totalPereks = realMasechtot.reduce((sum, m) => sum + m.pereks, 0);

  // Restore indices from localStorage
  currentGlobalPerekIndex =
    parseInt(localStorage.getItem("globalPerekIndex") || "1", 10) - 1;
  if (isNaN(currentGlobalPerekIndex) || currentGlobalPerekIndex < 0) {
    currentGlobalPerekIndex = 0;
  }

  pereksTodayStartIndex = parseInt(
    localStorage.getItem("pereksTodayStartIndex") || "0",
    10
  );
  if (isNaN(pereksTodayStartIndex) || pereksTodayStartIndex < 0) {
    pereksTodayStartIndex = 0;
  }

  // Day boundary / reset logic
  lastDate = localStorage.getItem("lastDate") || "";
  const todayDate = new Date().toDateString();

  if (lastDate !== todayDate) {
    lastDate = todayDate;
    localStorage.setItem("lastDate", todayDate);
    pereksTodayStartIndex = currentGlobalPerekIndex;
    localStorage.setItem(
      "pereksTodayStartIndex",
      pereksTodayStartIndex.toString()
    );
  }

  // Initial renders
  renderMesechetList();
  updateGoalDisplayParagraph();
  checkAndLaunchGoalConfetti();
  updateStats();
  updateMesAndPerek();

  // Recalculate pereksToday from stored start index to now
  const prevIndex = parseInt(
    localStorage.getItem("pereksTodayStartIndex") || "0",
    10
  );
  updatePereksToday(prevIndex, currentGlobalPerekIndex);
});

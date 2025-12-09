// js/mishnascript.js

const hebrewDigits = [
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

let mesechotListData = [];
let realMasechtot = [];
let totalPereks = 0;
let currentGlobalPerekIndex = 0; // zero-based
let pereksTodayStartIndex = 0;
let lastDate = "";
let isShowingPereks = false;

function calculateGlobalPerekIndex(mesechetIndex1Based, perekIndexZeroBased) {
  let globalPerekIndex = 0;
  for (let i = 0; i < mesechetIndex1Based - 1; i++) {
    globalPerekIndex += realMasechtot[i].pereks;
  }
  globalPerekIndex += perekIndexZeroBased;
  return globalPerekIndex;
}

function findMesechetAndPerekByIndex(idxZeroBased) {
  let cumulative = 0;
  for (let i = 0; i < realMasechtot.length; i++) {
    const count = realMasechtot[i].pereks;
    if (cumulative + count > idxZeroBased) {
      const local = idxZeroBased - cumulative;
      return {
        mesechet: realMasechtot[i].name,
        perek: hebrewDigits[local] || "?",
      };
    }
    cumulative += count;
  }
  return { mesechet: "Unknown", perek: "?" };
}

function updateMesAndPerek() {
  const mesechet = localStorage.getItem("mesechet") || "";
  let perekNumber = (localStorage.getItem("perek") || "").split(" ")[1] || "";
  if (perekNumber) {
    perekNumber = hebrewDigits[parseInt(perekNumber, 10) - 1];
  }
  const mesAndPerekElement = document.getElementById("mesandperek");
  if (mesAndPerekElement) {
    mesAndPerekElement.innerText = `${mesechet} פרק ${perekNumber}`;
  }
}

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

  if (isComplete) {
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
}

function updatePereksToday(previousIndex, currentIndex) {
  let difference = currentIndex - pereksTodayStartIndex;

  if (currentIndex < pereksTodayStartIndex) {
    let remainingPereks = totalPereks - pereksTodayStartIndex;
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

function handlePerekClick(prevIndex, newIndex, mesechet, perekNumber) {
  const diff = newIndex - prevIndex;
  if (diff < -100 || (diff < -50 && confirm("Reset to earlier perek?"))) {
    pereksTodayStartIndex = newIndex;
  }
  currentGlobalPerekIndex = newIndex;

  localStorage.setItem("globalPerekIndex", currentGlobalPerekIndex + 1);
  localStorage.setItem("mesechet", mesechet);
  localStorage.setItem("perek", `perek ${perekNumber}`);
  localStorage.setItem("pereksTodayStartIndex", pereksTodayStartIndex);

  updatePereksToday(prevIndex, currentGlobalPerekIndex);
  updateStats();
  updateMesAndPerek();
  updateGoalDisplayParagraph();
  checkAndLaunchGoalConfetti();
}

function scrollToCurrentMesechet() {
  const scrollSetting = localStorage.getItem("scrollToCurrentMesechet");
  if (scrollSetting === "false") {
    return; // user turned it off
  }
  const mesechetName = (localStorage.getItem("mesechet") || "").trim();
  if (!mesechetName) return;

  // Find the matching .bb anywhere in the document
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

  // This is what worked in your test
  targetEl.scrollIntoView({
    block: "center",
    behavior: "smooth",
  });
}

function renderMesechetList() {
  isShowingPereks = false;
  const mesechetList = document.getElementById("mesechetList");
  if (!mesechetList) return;

  mesechetList.innerHTML = "";
  let realIndex = 0;

  mesechotListData.forEach((item) => {
    if (item.section) {
      const li = document.createElement("li");
      li.classList.add("section-title");
      const label = document.createElement("span");
      label.textContent = item.section;
      li.appendChild(label);
      mesechetList.appendChild(li);
      return;
    }

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

  setTimeout(scrollToCurrentMesechet, 0);
}

function renderPerekList(realMasechetIndex1Based) {
  isShowingPereks = true;
  const mesechetList = document.getElementById("mesechetList");
  if (!mesechetList) return;

  const mesechet = realMasechtot[realMasechetIndex1Based - 1];
  if (!mesechet) return;

  mesechetList.innerHTML = "";

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
  closeBtn.style.padding = "4px"; // optional for easier tapping

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    renderMesechetList();
  });

  headerWrapper.appendChild(titleSpan);
  headerWrapper.appendChild(closeBtn);
  headerLi.appendChild(headerWrapper);
  mesechetList.appendChild(headerLi);

  for (let i = 0; i < mesechet.pereks; i++) {
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.style.cursor = "pointer";

    const perekHebrewNumber = hebrewDigits[i];
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

document.addEventListener("click", function (event) {
  if (isShowingPereks) {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar && !sidebar.contains(event.target)) {
      renderMesechetList();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (typeof buildMesechetList === "function") {
    // we rebuild manually, but ensure data is ready
  }

  mesechotListData = Array.isArray(mesechotData) ? mesechotData : [];
  realMasechtot = mesechotListData.filter(
    (item) => item.name && typeof item.pereks === "number"
  );
  totalPereks = realMasechtot.reduce((sum, m) => sum + m.pereks, 0);

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

  renderMesechetList();
  updateGoalDisplayParagraph();
  checkAndLaunchGoalConfetti();
  updateStats();
  updateMesAndPerek();

  const prevIndex = parseInt(
    localStorage.getItem("pereksTodayStartIndex") || "0",
    10
  );
  updatePereksToday(prevIndex, currentGlobalPerekIndex);
});

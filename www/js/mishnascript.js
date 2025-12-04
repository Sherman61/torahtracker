// js/mishnascript.js

// 1) Build mesechet list from data (must be before we query .bb)
if (typeof buildMesechetList === "function") {
  buildMesechetList("mesechetList");
} else {
  console.warn(
    "buildMesechetList is not defined. Static .bb list must exist in HTML."
  );
}

// 2) Original logic, now using dynamically built .bb elements

// Calculate the total number of pereks in all masechtot
let totalPereks = Array.from(document.querySelectorAll(".bb")).reduce(
  (sum, bbElement) => {
    return sum + parseInt(bbElement.className.match(/\d+/)[0], 10);
  },
  0
);

// A mapping of English to Hebrew digits
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

const bbElements = document.querySelectorAll(".bb");

// global index is 1-based in storage, 0-based here
let currentGlobalPerekIndex =
  parseInt(localStorage.getItem("globalPerekIndex") || "1", 10) - 1;

let pereksTodayStartIndex = parseInt(
  localStorage.getItem("pereksTodayStartIndex") || "0",
  10
);
let lastDate = localStorage.getItem("lastDate") || "";
let todayDate = new Date().toDateString();

if (lastDate !== todayDate) {
  lastDate = todayDate;
  localStorage.setItem("lastDate", todayDate);
  pereksTodayStartIndex = currentGlobalPerekIndex;
  localStorage.setItem(
    "pereksTodayStartIndex",
    pereksTodayStartIndex.toString()
  );
}

// Attach click to each mesechet to open perek side list
bbElements.forEach((bbElement, index) => {
  bbElement.addEventListener("click", () => createSideNavs(index + 1));
});

function createSideNavs(mesechetIndex) {
  const oldSideNavContainer = document.querySelector(".side-nav-container");
  if (oldSideNavContainer) {
    oldSideNavContainer.remove();
    document.querySelector("ul").style.opacity = "0";
    document.querySelector(".menu").style.opacity = "0";
  }

  const sideNavContainer = document.createElement("ul");
  sideNavContainer.classList.add("side-nav-container");
  document.querySelector(".sidebar").appendChild(sideNavContainer);

  const bbElement = bbElements[mesechetIndex - 1];
  const num = parseInt(bbElement.className.match(/\d+/)[0], 10);
  const mesechet = bbElement.textContent;

  for (let i = 1; i <= num; i++) {
    const globalPerekIndex = calculateGlobalPerekIndex(mesechetIndex, i);
    const sideNav = document.createElement("li");
    sideNav.classList.add("side-nav");
    sideNav.style.top = `${i * 1}px`;
    sideNav.style.transform = `translateX(0px)`;

    const perekHebrewNumber = hebrewDigits[i - 1]; // translate to Hebrew number
    sideNav.innerHTML = `<p>${mesechet} פרק ${perekHebrewNumber}</p>`;

    sideNav.addEventListener("click", () => {
      const previousGlobalPerekIndex = currentGlobalPerekIndex;
      const newGlobalPerekIndex = calculateGlobalPerekIndex(mesechetIndex, i);

      handlePerekClick(
        previousGlobalPerekIndex,
        newGlobalPerekIndex,
        mesechet,
        i
      );

      currentGlobalPerekIndex = globalPerekIndex - 1;

      localStorage.setItem(
        "globalPerekIndex",
        `${currentGlobalPerekIndex + 1}`
      );
      localStorage.setItem("mesechet", mesechet);
      localStorage.setItem("perek", `perek ${i}`);

      updatePereksToday(previousGlobalPerekIndex, currentGlobalPerekIndex);
      updateStats();
      updateMesAndPerek();
    });

    sideNavContainer.appendChild(sideNav);
  }

  setTimeout(() => {
    document.addEventListener(
      "click",
      function (event) {
        if (
          !event.target.closest(".side-nav") &&
          !event.target.closest(".bb")
        ) {
          const sideNavs = document.querySelectorAll(".side-nav");
          sideNavs.forEach((sideNav) => sideNav.remove());
        }
      },
      { once: true }
    );
  }, 0);
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

  localStorage.setItem("globalPerekIndex", currentGlobalPerekIndex);
  localStorage.setItem("mesechet", mesechet);
  localStorage.setItem("perek", `perek ${perekNumber}`);
  localStorage.setItem("pereksTodayStartIndex", pereksTodayStartIndex);

  updatePereksToday(prevIndex, currentGlobalPerekIndex);
  updateStats();
  updateMesAndPerek();
  updateGoalDisplayParagraph();
  checkAndLaunchGoalConfetti();
}

document.addEventListener("click", function (event) {
  if (!event.target.closest(".sidebar")) {
    const oldSideNavContainer = document.querySelector(".side-nav-container");
    if (oldSideNavContainer) {
      oldSideNavContainer.remove();
      document.querySelector("ul").style.opacity = "1";
      document.querySelector(".menu").style.opacity = "1";
    }
  }
});

function calculateGlobalPerekIndex(mesechetIndex, perekIndex) {
  let globalPerekIndex = 0;
  for (let i = 0; i < mesechetIndex - 1; i++) {
    globalPerekIndex += parseInt(bbElements[i].className.match(/\d+/)[0], 10);
  }
  globalPerekIndex += perekIndex;
  return globalPerekIndex;
}

function updateMesAndPerek() {
  const mesechet = localStorage.getItem("mesechet") || "";
  let perekNumber = (localStorage.getItem("perek") || "").split(" ")[1] || "";
  if (perekNumber) {
    perekNumber = hebrewDigits[parseInt(perekNumber, 10) - 1];
  }
  const mesAndPerekElement = document.getElementById("mesandperek");
  mesAndPerekElement.innerText = `${mesechet} פרק ${perekNumber}`;
}

function updateStats() {
  const finishedElement = document.getElementById("finished");
  finishedElement.innerText = `Pereks done: ${currentGlobalPerekIndex}`;

  const percentDoneElement = document.getElementById("percentdone");
  const percentDone = Math.round((currentGlobalPerekIndex / totalPereks) * 100);
  percentDoneElement.innerText = `Percent done: ${percentDone}%`;

  const toGoElement = document.getElementById("to-go");
  const toGo = totalPereks - currentGlobalPerekIndex;
  toGoElement.innerText = `Pereks left: ${toGo}`;

  const pereksTodayElement = document.getElementById("today");
  const pereksToday = localStorage.getItem("pereksToday") || 0;
  pereksTodayElement.innerText = `Pereks today: ${Math.abs(pereksToday)}`;
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
  let startIndex =
    parseInt(localStorage.getItem("pereksTodayStartIndex"), 10) || 0;
  if (isNaN(perekGoal) || perekGoal <= 0) perekGoal = 18;

  const goalIndex = startIndex + perekGoal;
  const currentIndex =
    parseInt(localStorage.getItem("globalPerekIndex"), 10) - 1;

  function findMesechetAndPerekByIndex(idx) {
    let cumulative = 0;
    for (let i = 0; i < bbElements.length; i++) {
      const count = parseInt(bbElements[i].className.match(/\d+/)[0], 10);
      if (cumulative + count > idx) {
        const local = idx - cumulative + 1;
        return {
          mesechet: bbElements[i].textContent,
          perek: hebrewDigits[local - 1] || "?",
        };
      }
      cumulative += count;
    }
    return { mesechet: "Unknown", perek: "?" };
  }

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

// Scroll to current mesechet on load
function scrollToCurrentMesechet() {
  const mesechetName = localStorage.getItem("mesechet");
  const sidebar = document.querySelector(".sidebar");
  if (!mesechetName || !sidebar) return;

  const bbEls = sidebar.querySelectorAll(".bb");
  for (const el of bbEls) {
    if (el.textContent.trim() === mesechetName.trim()) {
      const offset =
        el.offsetTop - sidebar.clientHeight / 2 + el.offsetHeight / 2;
      sidebar.scrollTo({
        top: Math.max(offset, 0),
        behavior: "smooth",
      });
      break;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateGoalDisplayParagraph();
  checkAndLaunchGoalConfetti();
  scrollToCurrentMesechet();
});

// Update stats and mesechet and perek on page load
updateStats();
updateMesAndPerek();

// bottom function to update pereks today
const prevIndex = parseInt(
  localStorage.getItem("pereksTodayStartIndex") || "0",
  10
);
updatePereksToday(prevIndex, currentGlobalPerekIndex);
console.log(window.mesechotData);
Array.isArray(window.mesechotData);

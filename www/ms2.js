// ==== Constants & Globals ====

// Total number of all pereks (calculated later)
let totalPereks = 0;

// Hebrew digits map
const hebrewDigits = [
  "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י",
  'י"א','י"ב','י"ג','י"ד','ט"ו','ט"ז','י"ז','י"ח','י"ט',
  "כ",'כ"א','כ"ב','כ"ג','כ"ד','כ"ה','כ"ו','כ"ז','כ"ח','כ"ט',
  "ל",
];

// DOM Node collections
const bbElements     = document.querySelectorAll(".bb");
const sidebar        = document.querySelector(".sidebar");
const percentEl      = document.querySelector(".percent");
const finishedEl     = document.getElementById("finished");
const percentDoneEl  = document.getElementById("percentdone");
const toGoEl         = document.getElementById("to-go");
const pereksTodayEl  = document.getElementById("today");
const mesAndPerekEl  = document.getElementById("mesandperek");
const goalEl         = document.getElementById("goal");

// State (persisted in localStorage)
let currentGlobalPerekIndex = parseInt(localStorage.getItem("globalPerekIndex") || "1", 10) - 1;
let pereksTodayStartIndex   = parseInt(localStorage.getItem("pereksTodayStartIndex") || "0", 10);
let lastDate                = localStorage.getItem("lastDate") || "";
const todayDate             = new Date().toDateString();

// ==== Initialization on Load ==== 

// Compute totalPereks once we know how many .bb elements there are
totalPereks = Array.from(bbElements).reduce((sum, el) => {
  return sum + parseInt(el.className.match(/\d+/)[0], 10);
}, 0);

// If it's a new day, reset the start‐of‐day index
if (lastDate !== todayDate) {
  lastDate = todayDate;
  localStorage.setItem("lastDate", todayDate);

  pereksTodayStartIndex = currentGlobalPerekIndex;
  localStorage.setItem("pereksTodayStartIndex", String(pereksTodayStartIndex));
}

// Attach click handlers to each bb (Masechet button)
bbElements.forEach((el, idx) => {
  el.addEventListener("click", () => createSideNavs(idx + 1));
});

// On page load, update all displays
updateStats();
updateMesAndPerek();
updateGoalDisplayParagraph();
// checkAndLaunchGoalConfetti();

// ==== UI Creation ==== 

function createSideNavs(mesechetIndex) {
  // Remove existing menu if present
  const existing = document.querySelector(".side-nav-container");
  if (existing) existing.remove();

  // Dim the main menu
  document.querySelector("ul").style.opacity  = "0";
  document.querySelector(".menu").style.opacity = "0";

  // Container for the list of pereks
  const container = document.createElement("ul");
  container.classList.add("side-nav-container");
  sidebar.appendChild(container);

  const bbElement = bbElements[mesechetIndex - 1];
  const num       = parseInt(bbElement.className.match(/\d+/)[0], 10);
  const name      = bbElement.textContent;

  for (let i = 1; i <= num; i++) {
    const globalIndex = calculateGlobalPerekIndex(mesechetIndex, i);
    const li          = document.createElement("li");

    li.classList.add("side-nav");
    li.style.top       = `${i}px`;
    li.style.transform = "translateX(0)";

    // Hebrew number label
    const hebrewNum = hebrewDigits[i - 1] || i;
    li.innerHTML    = `<p>${name} פרק ${hebrewNum}</p>`;

    li.addEventListener("click", () => {
      const prev = currentGlobalPerekIndex;
      handlePerekClick(prev, globalIndex, name, i);
      currentGlobalPerekIndex = globalIndex - 1;
      persistCurrentPerek();
      updatePereksToday(prev, currentGlobalPerekIndex);
      updateStats();
      updateMesAndPerek();
    });

    container.appendChild(li);
  }

  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener("click", outsideClickHandler);
  }, 0);
}

// ==== Outside Click Handler ====
const outsideClickHandler = ()=> document.addEventListener("click", function (event) {
  if (!event.target.closest(".sidebar")) {
    const oldSideNavContainer = document.querySelector(".side-nav-container");
    if (oldSideNavContainer) {
      oldSideNavContainer.remove();
      document.querySelector("ul").style.opacity = "1";
      document.querySelector(".menu").style.opacity = "1";
     
    }
  }
});

// ==== State Persistence Helpers ==== 

function persistCurrentPerek() {
  localStorage.setItem("globalPerekIndex", String(currentGlobalPerekIndex + 1));
  localStorage.setItem("mesechet", sidebar.querySelector(".bb").textContent);
  localStorage.setItem("perek", `perek ${currentGlobalPerekIndex + 1}`);
}

function calculateGlobalPerekIndex(mesechetIndex, perekIndex) {
  let index = 0;
  for (let i = 0; i < mesechetIndex - 1; i++) {
    index += parseInt(bbElements[i].className.match(/\d+/)[0], 10);
  }
  return index + perekIndex;
}

// ==== Pereks‐Today Tracking ==== 

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
function updatePereksToday(prevIndex, currIndex) {
  let diff = currIndex - pereksTodayStartIndex;

  if (currIndex < pereksTodayStartIndex) {
    // wrapped around
    diff = (totalPereks - pereksTodayStartIndex) + currIndex;
  }

  const todayCount = Math.max(diff, 0);
  localStorage.setItem("pereksToday", String(todayCount));
  updateStats();

  // Save to IndexedDB
  const dateStr = new Date().toISOString().split("T")[0];
  saveDailyProgressToDB(dateStr, pereksTodayStartIndex, currIndex, todayCount);
}

// ==== UI Updates ==== 

function updateMesAndPerek() {
  const mes  = localStorage.getItem("mesechet") || "";
  const pStr = (localStorage.getItem("perek") || "perek 1").split(" ")[1];
  const pNum = parseInt(pStr, 10) - 1;
  const heb  = hebrewDigits[pNum] || pStr;

  mesAndPerekEl.innerText = `${mes} פרק ${heb}`;
}

function updateStats() {
  const done  = currentGlobalPerekIndex;
  const pct   = Math.round((done / totalPereks) * 100);
  const left  = totalPereks - done;

  finishedEl.innerText     = `Pereks done: ${done}`;
  percentDoneEl.innerText  = `Percent done: ${pct}%`;
  toGoEl.innerText         = `Pereks left: ${left}`;
  pereksTodayEl.innerText  = `Pereks today: ${Math.abs(localStorage.getItem("pereksToday"))}`;
}

// ==== Goal & Confetti ==== 

function updateGoalDisplayParagraph() {
  if (!goalEl) return;
  const showGoal = localStorage.getItem("displayPerekGoal") === "true";
  if (!showGoal) return goalEl.style.display = "none";

  let goalCount = parseInt(localStorage.getItem("perekGoal"), 10) || 18;
  const start   = parseInt(localStorage.getItem("pereksTodayStartIndex"), 10) || 0;
  const goalIdx = start + goalCount;
  const curr    = currentGlobalPerekIndex;
  
  // find the target mesechet & perek
  let cum = 0, targetMes = "Unknown", targetPer = "?";
  for (let i = 0; i < bbElements.length; i++) {
    const n = parseInt(bbElements[i].className.match(/\d+/)[0], 10);
    if (cum + n >= goalIdx) {
      targetMes = bbElements[i].textContent;
      targetPer = hebrewDigits[goalIdx - cum - 1] || (goalIdx - cum);
      break;
    }
    cum += n;
  }

  const check = curr >= goalIdx ? " ✅" : "";
  goalEl.innerText   = `Goal: ${targetMes} פרק ${targetPer}${check}`;
  goalEl.style.display = "block";
}

// This is assumed provided elsewhere
document.addEventListener("DOMContentLoaded", function () {
  updateGoalDisplayParagraph();
  checkAndLaunchGoalConfetti();
  updateMesAndPerek();
});
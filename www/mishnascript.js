// Calculate the total number of pereks in all masechtot
let totalPereks = Array.from(document.querySelectorAll(".bb")).reduce(
  (sum, bbElement) => {
    return sum + parseInt(bbElement.className.match(/\d+/)[0]);
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
let currentGlobalPerekIndex =
  parseInt(localStorage.getItem("globalPerekIndex") || "1") - 1;

let pereksTodayStartIndex = parseInt(
  localStorage.getItem("pereksTodayStartIndex") || "0"
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

bbElements.forEach((bbElement, index) => {
  bbElement.addEventListener("click", () => createSideNavs(index + 1));
});


function createSideNavs(mesechetIndex) {
  const oldSideNavContainer = document.querySelector(".side-nav-container");
  if (oldSideNavContainer) {
    oldSideNavContainer.remove();
    // Hide the sidebar
    //submenu.style.display = 'none';

    document.querySelector("ul").style.opacity = "0";
    document.querySelector(".menu").style.opacity = "0";
    //   document.querySelector('.menu').style.display = 'none';
  }

  const sideNavContainer = document.createElement("ul");
  sideNavContainer.classList.add("side-nav-container");
  document.querySelector(".sidebar").appendChild(sideNavContainer);

  const bbElement = bbElements[mesechetIndex - 1];
  const num = parseInt(bbElement.className.match(/\d+/)[0]);
  const mesechet = bbElement.textContent;

  for (let i = 1; i <= num; i++) {
    const globalPerekIndex = calculateGlobalPerekIndex(mesechetIndex, i);
    const sideNav = document.createElement("li");
    sideNav.classList.add("side-nav");
    sideNav.style.top = `${i * 1}px`;
    sideNav.style.transform = `translateX(0px)`;

    const perekHebrewNumber = hebrewDigits[i - 1]; // translate to Hebrew number
    sideNav.innerHTML = `<p>${mesechet} פרק ${perekHebrewNumber}</p>`; // use Hebrew number here

    sideNav.addEventListener("click", () => {
      // Update index first

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
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".side-nav") && !event.target.closest(".bb")) {
        const sideNavs = document.querySelectorAll(".side-nav");
        sideNavs.forEach((sideNav) => sideNav.remove());
      }
    });
  }, 0);
}

function updatePereksToday(previousIndex, currentIndex) {
  // Calculate the difference between the current index and the start index
  let difference = currentIndex - pereksTodayStartIndex;

  // Check if the current index has wrapped around to the start
  if (currentIndex < pereksTodayStartIndex) {
    // Calculate the remaining pereks from the previous cycle
    let remainingPereks = totalPereks - pereksTodayStartIndex;

    // Add the current index to the remaining pereks
    difference = remainingPereks + currentIndex;
  }

  // Ensure pereksToday is not negative
  const pereksToday = Math.max(difference, 0);

  // Update the pereksToday in localStorage and stats
  localStorage.setItem("pereksToday", `${pereksToday}`);
  updateStats();
  const date = new Date().toISOString().split("T")[0]; // e.g. "2025-07-16"
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
      // document.querySelector('.menu').style.display = 'block';
      // document.querySelector('ul.side-nav-container').style.display = 'none';
    }
  }
});

function calculateGlobalPerekIndex(mesechetIndex, perekIndex) {
  let globalPerekIndex = 0;
  for (let i = 0; i < mesechetIndex - 1; i++) {
    globalPerekIndex += parseInt(bbElements[i].className.match(/\d+/)[0]);
  }
  globalPerekIndex += perekIndex;
  return globalPerekIndex;
}

function updateMesAndPerek() {
  const mesechet = localStorage.getItem("mesechet") || "";
  let perekNumber = localStorage.getItem("perek").split(" ")[1] || "";
  // translate to Hebrew number
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
  const pereksToday = localStorage.getItem("pereksToday");
  pereksTodayElement.innerText = `Pereks today: ${Math.abs(pereksToday)}`;
}


// Function to check and launch confetti if the goal is reached
function updateGoalDisplayParagraph() {
  const goalElement = document.getElementById("goal");
  const displayPerekGoal = localStorage.getItem("displayPerekGoal") === "true";

  if (!goalElement) return;

  if (displayPerekGoal) {
    let perekGoal = parseInt(localStorage.getItem("perekGoal")) || 18;
    let pereksTodayStartIndex = parseInt(localStorage.getItem("pereksTodayStartIndex") || "0");
    if (isNaN(perekGoal) || perekGoal <= 0) {
      perekGoal = 18;
    }

    const goalIndex = pereksTodayStartIndex + perekGoal - 0;
    const currentGlobalPerekIndex = parseInt(localStorage.getItem("globalPerekIndex") || "1") - 1;

    function findMesechetAndPerekByIndex(index) {
      let cumulativePereks = 0;
      for (let i = 0; i < bbElements.length; i++) {
        const pereksInMesechet = parseInt(bbElements[i].className.match(/\d+/)[0]);
        if (cumulativePereks + pereksInMesechet > index) {
          const perekNumber = index - cumulativePereks;
          const perekHebrew = hebrewDigits[perekNumber] || "Unknown";
          return { mesechet: bbElements[i].textContent, perek: perekHebrew };
        }
        cumulativePereks += pereksInMesechet;
      }
      return { mesechet: "Unknown", perek: "Unknown" };
    }

    const { mesechet, perek } = findMesechetAndPerekByIndex(goalIndex);
    const isComplete = currentGlobalPerekIndex >= goalIndex;
    const checkMark = isComplete ? " ✅" : "";

    goalElement.innerText = `Goal: ${mesechet} פרק ${perek}${checkMark}`;
    goalElement.style.display = "block";
  } else {
    goalElement.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateGoalDisplayParagraph();
  checkAndLaunchGoalConfetti();
});

// Update stats and mesechet and perek on page load
updateStats();
updateMesAndPerek();

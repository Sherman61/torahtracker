// Initialize local storage variables if not present
if (!localStorage.getItem("currentPsalmIndex")) {
  localStorage.setItem("currentPsalmIndex", "0");
}

if (!localStorage.getItem("startOfDayPsalmIndex")) {
  localStorage.setItem("startOfDayPsalmIndex", "0");
}

// Function to update statistics
function updateStats(currentPsalmIndex) {
  const psalms = document.querySelectorAll(".tehellim");
  const totalPsalms = psalms.length;
  const completedPsalms = parseInt(currentPsalmIndex);

  const percentageDone = (((completedPsalms + 1) / totalPsalms) * 100).toFixed(
    2
  );
  const psalmsLeft = totalPsalms - (completedPsalms + 1);

  document.getElementById(
    "up-to"
  ).textContent = `up to: ${psalms[currentPsalmIndex].textContent}`;
  document.getElementById(
    "percentagedone"
  ).textContent = `percentage done: ${percentageDone}%`;
  document.getElementById(
    "psalms-to-go"
  ).textContent = ` קפיטלוך Left: ${psalmsLeft}`;
}

// Function to update today's psalms
function updateToday(currentPsalmIndex) {
  const startOfDayPsalmIndex = parseInt(
    localStorage.getItem("startOfDayPsalmIndex")
  );
  const psalmsToday = currentPsalmIndex - startOfDayPsalmIndex + 0;

  document.getElementById(
    "today"
  ).textContent = `Teheilem today: ${psalmsToday}`;
}

// Event listener for clicking on a psalm
const psalms = document.querySelectorAll(".tehellim");
psalms.forEach((psalm, index) => {
  psalm.addEventListener("click", () => {
    localStorage.setItem("currentPsalmIndex", index.toString());
    psalms.forEach((psalm) => (psalm.style.fontWeight = ""));
    psalm.style.fontWeight = "bold";
    psalm.classList.add("psalm-current");
    updateStats(index);
    updateToday(index);
  });
});

// On page load
document.addEventListener("DOMContentLoaded", () => {
  const currentPsalmIndex = localStorage.getItem("currentPsalmIndex");
  if (currentPsalmIndex) {
    psalms[currentPsalmIndex].style.fontWeight = "bold";
    updateStats(currentPsalmIndex);
    updateToday(currentPsalmIndex);
  }

  function isScrollEnabledFor(pageKey) {
    const globalRaw = localStorage.getItem("scrollGlobal");
    const globalOn = globalRaw === null || globalRaw === "true";
    if (!globalOn) return false;

    const pageRaw = localStorage.getItem(pageKey);
    const pageOn = pageRaw === null || pageRaw === "true";

    return pageOn;
  }

  function scrollToCurrentPsalm() {
    if (!isScrollEnabledFor("scrollTehillim")) return;

    const currentIndex = parseInt(
      localStorage.getItem("currentPsalmIndex") || "0",
      10
    );
    if (!currentIndex || isNaN(currentIndex)) return;

    const allPsalms = document.querySelectorAll(".tehellim");
    if (!allPsalms.length) return;

    // index stored as 1 based
    const targetIndex = currentIndex - 1;
    let targetEl = allPsalms[targetIndex] || allPsalms[0];

    // clear old highlight
    allPsalms.forEach((el) => el.classList.remove("psalm-current"));

    if (!targetEl) return;

    targetEl.classList.add("psalm-current");

    targetEl.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }

  scrollToCurrentPsalm();
  // At midnight, update the start of day Psalm index
  const now = new Date();
  const then = new Date(now);
  then.setHours(24, 0, 0, 0);
  const timeToMidnight = then.getTime() - now.getTime();

  setTimeout(() => {
    localStorage.setItem(
      "startOfDayPsalmIndex",
      localStorage.getItem("currentPsalmIndex")
    );
  }, timeToMidnight);
});

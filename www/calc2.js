/* instructions
  count the number of pereks there is globally

  track the start perek index 
  track the perek end index
  calcualte the start global index to the end global index, and not the index of the perokem in each perek indivvusaly

  */

// Attach click event listeners to each mesechet
document.querySelectorAll(".bb").forEach((mesechet) => {
  mesechet.addEventListener("click", function () {
    const numPereks = parseInt(this.className.match(/\d+/)[0]);
    const mesechetName = this.innerText;

    if (selectedStartGlobalIndex === null) {
      // No start perek selected, prompt to select start perek
      document.querySelector("#instruction").innerText =
        "Please select a start perek";
    } else {
      // Start perek already selected, prompt to select end perek
      document.querySelector("#instruction").innerText =
        "Select till what perek to calculate";
    }

    displayPereks(mesechetName, numPereks);
  });
});

function displayPereks(mesechetName, numPereks) {
  console.log("clicked on a mesechet");
  const sideNav = document.querySelector("#sideNav");
  // sideNav.innerHTML = ''; // Clear previous content
  sideNav.querySelector(".bb-container").style = "display:none";

  const pereksContainer = document.createElement("div");
  pereksContainer.className = "pereks-container";

  const mesechetTitle = document.createElement("h2");
  mesechetTitle.innerText = mesechetName;
  pereksContainer.appendChild(mesechetTitle);

  for (let i = 1; i <= numPereks; i++) {
    let perekDiv = document.createElement("div");
    perekDiv.setAttribute("class", "perek");
    perekDiv.setAttribute("data-perek-index", i);
    perekDiv.innerText = `${mesechetName} פרק ${toHebrewNumber(i)}`;
    pereksContainer.appendChild(perekDiv);
  }

  sideNav.appendChild(pereksContainer);
}

// Function to convert numbers to Hebrew numerals
function toHebrewNumber(num) {
  const hebrewNumbers = [
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
    "יא",
    "יב",
    "יג",
    "יד",
    "טו",
    "טז",
    "יז",
    "יח",
    "יט",
    "כ",
    "כא",
    "כב",
    "כג",
    "כד",
    "כה",
    "כו",
    "כז",
    "כח",
    "כט",
    "ל",
  ];
  return hebrewNumbers[num - 1] || num;
}

let selectedStartGlobalIndex = null;
let selectedEndGlobalIndex = null;

let totalGlobalPereks = 0;
let instructionElement = document.getElementById("instruction");

// Function to update the total global number of pereks
function updateTotalGlobalPereks() {
  totalGlobalPereks = 0;
  document.querySelectorAll(".bb").forEach((mesechet) => {
    totalGlobalPereks += parseInt(mesechet.className.match(/\d+/)[0]);
  });
}

// Call this function on page load or when the mesechtot list updates
updateTotalGlobalPereks();

// Function to find the global index of a perek
function findGlobalPerekIndex(mesechetName, perekIndex) {
  let globalIndex = 0;
  let found = false;

  document.querySelectorAll(".bb").forEach((mesechet) => {
    if (mesechet.innerText === mesechetName) {
      globalIndex += perekIndex;
      found = true;
      return;
    }
    if (!found) {
      globalIndex += parseInt(mesechet.className.match(/\d+/)[0]);
    }
  });

  return globalIndex;
}
// Event listener for selecting pereks
// Event listener for selecting pereks
document.querySelector("#sideNav").addEventListener("click", (event) => {
  const targetElement = event.target;

  if (targetElement.classList.contains("perek")) {
    const perekIndex = Number(targetElement.getAttribute("data-perek-index"));
    const mesechetName = targetElement
      .closest(".pereks-container")
      .querySelector("h2").innerText;
    const globalIndex = findGlobalPerekIndex(mesechetName, perekIndex);

    if (selectedStartGlobalIndex === null) {
      selectedStartGlobalIndex = globalIndex;
      instructionElement.innerText = "Select till what perek to calculate";
      targetElement.style.backgroundColor = "lightblue";
    } else if (selectedEndGlobalIndex === null) {
      selectedEndGlobalIndex = globalIndex;
      targetElement.style.backgroundColor = "lightblue";

      calculateTotalPereks();
    }
  }
});

// Function to calculate total pereks selected
function calculateTotalPereks() {
  let totalPereks = selectedEndGlobalIndex - selectedStartGlobalIndex + 0;
  instructionElement.innerText = `${totalPereks} perokem total`;

  // Reset selection for next calculation with a delay
  setTimeout(resetPerekSelection, 1500); // Delay of 1.5 seconds
}

/* // Function to reset perek selection
function resetPerekSelection() {
    const pereks = document.querySelectorAll('.perek');
    pereks.forEach(perek => perek.style.backgroundColor = 'transparent');
    selectedStartGlobalIndex = null;
    selectedEndGlobalIndex = null;

    setTimeout(function() {
       
        document.querySelector('#instruction').innerText='Select a Masechta';
    }, 1200);
    
} */

function resetPerekSelection() {
  const pereks = document.querySelectorAll(".perek");
  pereks.forEach((perek) => (perek.style.backgroundColor = "transparent"));
  selectedStartGlobalIndex = null;
  selectedEndGlobalIndex = null;

  // Close the pereks menu and make the bb-container visible again
  closePereksMenu();
  const sideNav = document.querySelector("#sideNav");
  if (sideNav) {
    const bbContainer = sideNav.querySelector(".bb-container");
    if (bbContainer) {
      bbContainer.style.display = "block"; // Match the style change in the event listener
    }
  }

  // Update instruction after closing the pereks menu
  checkAndUpdateInstruction();
}

// Function to check the state of .bb-container and update instruction text
function checkAndUpdateInstruction() {
  const bbContainer = document.querySelector(".bb-container");
  const instructionElement = document.querySelector("#instruction");
  if (bbContainer && bbContainer.style.display !== "none") {
    // .bb-container is open
    instructionElement.innerText = "Select a Masechta";
  } else {
    // .bb-container is closed
    instructionElement.innerText = "Please select a start perek";
  }
}
// Function to close the pereks menu
function closePereksMenu() {
  const pereksContainer = document.querySelector(".pereks-container");
  if (pereksContainer) {
    pereksContainer.remove(); // Removes only the pereks container
  }
}

// Event listener for clicking outside the pereks menu
document.addEventListener("click", function (event) {
  const clickedInsideMenu = event.target.closest("#sideNav");
  const clickedOnMesechet = event.target.classList.contains("bb");

  if (!clickedInsideMenu && !clickedOnMesechet) {
    closePereksMenu();
    sideNav.querySelector(".bb-container").style = "display:block";
    document.querySelector("#instruction").innerText = "Select a Masechta";
  }
});

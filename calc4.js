// Global variables for tracking perek indices and the pereks menu
let selectedStartPerekIndex = null;
let selectedEndPerekIndex = null;
let pereksContainer = null; // The pereks menu

// Function to initialize the application
function initialize() {
    attachMesechetListeners();
    attachSideNavListener();
    attachDocumentClickListener();
    loadStartingPerekFromLocalStorage();
    checkAndUpdateInstructions();
}

// Attach event listeners to each mesechet
function attachMesechetListeners() {
    document.querySelectorAll('.bb').forEach(mesechet => {
        mesechet.addEventListener('click', handleMesechetClick);
    });
}

// Handle mesechet click event
function handleMesechetClick() {
    const numPereks = parseInt(this.className.match(/\d+/)[0]);
    const mesechetName = this.innerText;
    displayPereks(mesechetName, numPereks);
}

// Display pereks for a given mesechet
function displayPereks(mesechetName, numPereks) {
    const sideNav = document.querySelector('#sideNav');
    hideBBContainer(sideNav);
    pereksContainer = createPereksContainer(mesechetName, numPereks);
    sideNav.appendChild(pereksContainer);
    checkAndUpdateInstructions();
}

// Hide .bb-container element
function hideBBContainer(sideNav) {
    sideNav.querySelector('.bb-container').style = "display:none";
}

// Create a container for pereks
function createPereksContainer(mesechetName, numPereks) {
    const container = document.createElement('div');
    container.className = 'pereks-container';
    const mesechetTitle = createMesechetTitle(mesechetName);
    container.appendChild(mesechetTitle);
    addPereksToContainer(container, mesechetName, numPereks);
    return container;
}

// Create a title for the mesechet
function createMesechetTitle(mesechetName) {
    const mesechetTitle = document.createElement('h2');
    mesechetTitle.innerText = mesechetName;
    return mesechetTitle;
}

// Add pereks to the container
function addPereksToContainer(container, mesechetName, numPereks) {
    for (let i = 1; i <= numPereks; i++) {
        const perekDiv = createPerekDiv(mesechetName, i);
        container.appendChild(perekDiv);
    }
}

// Create a div for a single perek
function createPerekDiv(mesechetName, index) {
    const perekDiv = document.createElement('div');
    perekDiv.className = 'perek';
    perekDiv.dataset.perekIndex = index;
    perekDiv.innerText = `${mesechetName} פרק ${toHebrewNumber(index)}`;
    return perekDiv;
}

// Function to convert numbers to Hebrew numerals
function toHebrewNumber(num) {
    const hebrewNumbers = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט', 'כ', 'כא', 'כב', 'כג', 'כד', 'כה', 'כו', 'כז', 'כח', 'כט', 'ל'];
    return hebrewNumbers[num - 1] || num;
}

// Update instruction text
function updateInstruction(text) {
    const instructionElement = document.getElementById('instruction');
    instructionElement.innerText = text;
}

// Event listener for selecting pereks
function attachSideNavListener() {
    document.querySelector('#sideNav').addEventListener('click', handlePerekSelection);
}

// Handle perek selection
function handlePerekSelection(event) {
    const targetElement = event.target;
    if (targetElement.classList.contains('perek')) {
        const perekIndex = Number(targetElement.getAttribute('data-perek-index'));
        const mesechetName = targetElement.closest('.pereks-container').querySelector('h2').innerText;

        if (selectedStartPerekIndex === null) {
            selectedStartPerekIndex = perekIndex;
            document.getElementById('fromPerek').innerText = `${mesechetName} פרק ${toHebrewNumber(perekIndex)}`;
            targetElement.style.backgroundColor = 'lightgreen';
        } else if (selectedEndPerekIndex === null) {
            selectedEndPerekIndex = perekIndex;
            document.getElementById('toPerek').innerText = `${mesechetName} פרק ${toHebrewNumber(perekIndex)}`;
            targetElement.style.backgroundColor = 'lightgreen';
            calculateTotalPereks();
        }
        checkAndUpdateInstructions();
    }
}

// Function to calculate total pereks selected
function calculateTotalPereks() {
    let totalPereks = selectedEndPerekIndex - selectedStartPerekIndex + 1;
    document.getElementById('totalperokem').innerText = `Total Pereks: ${totalPereks}`;
    resetPerekSelection();
}

// Function to reset perek selection
function resetPerekSelection() {
    const pereks = document.querySelectorAll('.perek');
    pereks.forEach(perek => perek.style.backgroundColor = 'transparent');
    selectedStartPerekIndex = null;
    selectedEndPerekIndex = null;
}

// Load starting perek from localStorage and update display
function loadStartingPerekFromLocalStorage() {
    if ('globalPerekIndex' in localStorage) {
        const storedIndex = localStorage.getItem('globalPerekIndex');
        if (storedIndex) {
            const globalIndex = parseInt(storedIndex);
            const { mesechetName, perekNumber } = findMesechetAndPerekByGlobalIndex(globalIndex);
            selectedStartPerekIndex = perekNumber;
            document.getElementById('fromPerek').innerText = `${mesechetName} פרק ${toHebrewNumber(perekNumber)}`;
        }
    }
}

// Find Mesechet and Perek by global index
function findMesechetAndPerekByGlobalIndex(globalIndex) {
    let currentIndex = 0;
    const mesechtot = document.querySelectorAll('.bb');
    
    for (let i = 0; i < mesechtot.length; i++) {
        const mesechet = mesechtot[i];
        const numPereks = parseInt(mesechet.className.match(/\d+/)[0]);
        if (currentIndex + numPereks > globalIndex) { // Changed >= to >
            const perekNumber = globalIndex - currentIndex + 1; // Adjusted index calculation
            const mesechetName = mesechet.innerText;
            return { mesechetName, perekNumber };
        }
        currentIndex += numPereks;
    }

    // Return a default value if no match is found
    return { mesechetName: 'Unknown', perekNumber: 1 };
}

// Function to close the pereks menu
function closePereksMenu() {
    if (pereksContainer) {
        pereksContainer.remove();
        pereksContainer = null;
        checkAndUpdateInstructions();
    }
}

// Event listener for clicking outside the pereks menu
function attachDocumentClickListener() {
    document.addEventListener('click', handleCloseClick);
}

// Handle document click for closing the pereks menu
function handleCloseClick(event) {
    const clickedInsideMenu = event.target.closest('#sideNav');
    const clickedOnMesechet = event.target.classList.contains('bb');
    if (!clickedInsideMenu && !clickedOnMesechet) {
        closePereksMenu();
        document.querySelector('#sideNav .bb-container').style = "display:block";
    }
}

// Function to check conditions and update instructions
function checkAndUpdateInstructions() {
    if (selectedStartPerekIndex !== null && pereksContainer !== null) {
        updateInstruction('Select a end perek');
        console.log('A start perek was selected and the pereks container is open');
    }
    else if (selectedStartPerekIndex !== null && pereksContainer == null) {
        updateInstruction('Select a Masechta');
        console.log('A start perek was selected and the pereks container is closed');
    }
    else if (selectedStartPerekIndex == null && pereksContainer !== null) {
        updateInstruction('Select a start perek');
        console.log('No start perek has been selected and the pereks container is open');
    }
    else if (selectedStartPerekIndex == null && pereksContainer == null) {
        updateInstruction('Select a Masechta');
        console.log('No start perek has been selected and the pereks container is closed');
    }
}

// Initialize the application
initialize();

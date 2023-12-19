// Function to initialize the application
function initialize() {
    attachMesechetListeners();
    attachSideNavListener();
    attachDocumentClickListener();
}

// Attach event listeners to each mesechet
function attachMesechetListeners() {
    document.querySelectorAll('.bb').forEach(mesechet => {
        mesechet.addEventListener('click', handleMesechetClick);
    });
}

// Handle mesechet click event
function handleMesechetClick() {
    console.log(`Attaching listener Masechet: ${this.innerText}`);
    const numPereks = parseInt(this.className.match(/\d+/)[0]);
    const mesechetName = this.innerText;
    displayPereks(mesechetName, numPereks);

    // Check if a start perek has already been selected
    if (selectedStartPerekIndex !== null && selectedEndPerekIndex === null) {
        updateInstruction('Select an end perek');
    } else {
        updateInstruction('Select a start perek');
    }
}


// Display pereks for a given mesechet
function displayPereks(mesechetName, numPereks) {
    console.log('clicked on a mesachta \n running displayPereks');
    const sideNav = document.querySelector('#sideNav');
    hideBBContainer(sideNav);
    const pereksContainer = createPereksContainer(mesechetName, numPereks);
    sideNav.appendChild(pereksContainer);
}

// Hide .bb-container element
function hideBBContainer(sideNav) {
    sideNav.querySelector('.bb-container').style = "display:none";
}

// Create a container for pereks
function createPereksContainer(mesechetName, numPereks) {
    const pereksContainer = document.createElement('div');
    pereksContainer.className = 'pereks-container';
    const mesechetTitle = createMesechetTitle(mesechetName);
    pereksContainer.appendChild(mesechetTitle);
    addPereksToContainer(pereksContainer, mesechetName, numPereks);
    return pereksContainer;
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
        if (selectedStartPerekIndex === null) {
            selectedStartPerekIndex = perekIndex;
            console.log(`Start perek selected: ${perekIndex}`);  // Log start perek selection
            updateInstruction('Select a end perek');
            targetElement.style.backgroundColor = 'lightgreen';
        } else if (selectedEndPerekIndex === null) {
            selectedEndPerekIndex = perekIndex;
            console.log(`End perek selected: ${perekIndex}`);    // Log end perek selection
            targetElement.style.backgroundColor = 'lightgreen';
            calculateTotalPereks();
        }
    }
}

// Function to calculate total pereks selected
function calculateTotalPereks() {
    let totalPereks = selectedEndPerekIndex - selectedStartPerekIndex + 1;
    updateInstruction(`Total pereks: ${totalPereks}`);
    console.log('Total pereks selected:', totalPereks);
    
    setTimeout(function() {
       
        document.querySelector('#instruction').innerText='Select a start perek';
    }, 1200);

    resetPerekSelection();
}

// Function to reset perek selection
function resetPerekSelection() {
    const pereks = document.querySelectorAll('.perek');
    pereks.forEach(perek => perek.style.backgroundColor = 'transparent');
    selectedStartPerekIndex = null;
    selectedEndPerekIndex = null;
}

// Function to close the pereks menu
function closePereksMenu() {
    const pereksContainer = document.querySelector('.pereks-container');
    if (pereksContainer) {

        pereksContainer.remove();
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
        document.querySelector('#instruction').innerText='Select a Masechta';
        closePereksMenu();
        document.querySelector('#sideNav .bb-container').style = "display:block";
    }
}

// Initialize the application
initialize();

// Global variables for tracking perek indices
let selectedStartPerekIndex = null;
let selectedEndPerekIndex = null;

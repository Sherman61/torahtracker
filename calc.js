 // Attach click event listeners to each mesechet
document.querySelectorAll('.bb').forEach(mesechet => {
    mesechet.addEventListener('click', function() {
        const numPereks = parseInt(this.className.match(/\d+/)[0]);
        const mesechetName = this.innerText;
        displayPereks(mesechetName, numPereks);
    });
});

// Function to display pereks for a selected mesechet
function displayPereks(mesechetName, numPereks) {
    const sideNav = document.querySelector('#sideNav');
    sideNav.innerHTML = ''; // Clear previous content

    const mesechetTitle = document.createElement('h2');
    mesechetTitle.innerText = mesechetName;
    sideNav.appendChild(mesechetTitle);

    for (let i = 1; i <= numPereks; i++) {
        let perekDiv = document.createElement('div');
        perekDiv.setAttribute('class', 'perek');
        perekDiv.setAttribute('data-perek-index', i);
        perekDiv.innerText = 'Perek ' + i;
        sideNav.appendChild(perekDiv);
    }
}

let selectedStartMesechetIndex = null;
let selectedStartPerekIndex = null;
let selectedEndMesechetIndex = null;
let selectedEndPerekIndex = null;
let instructionElement = document.getElementById('instruction');

// Event listener for selecting pereks
document.querySelector('#sideNav').addEventListener('click', (event) => {
    const targetElement = event.target;

    if (targetElement.classList.contains('perek')) {
        const perekIndex = Number(targetElement.getAttribute('data-perek-index'));

        if (selectedStartPerekIndex === null) {
            selectedStartPerekIndex = perekIndex;
            instructionElement.innerText = 'Select till what perek to calculate';
            targetElement.style.backgroundColor = 'lightgreen';
        } else if (selectedEndPerekIndex === null) {
            selectedEndPerekIndex = perekIndex;
            targetElement.style.backgroundColor = 'lightgreen';

            calculateTotalPereks();
        }
    }
});

// Function to calculate total pereks selected
function calculateTotalPereks() {
    let totalPereks = selectedEndPerekIndex - selectedStartPerekIndex + 1;
    instructionElement.innerText = `Total pereks selected: ${totalPereks}`;
    console.log('Total pereks selected:', totalPereks);

    // Reset selection for next calculation
    resetPerekSelection();
}

// Function to reset perek selection
function resetPerekSelection() {
    const pereks = document.querySelectorAll('.perek');
    pereks.forEach(perek => perek.style.backgroundColor = 'transparent');
    selectedStartPerekIndex = null;
    selectedEndPerekIndex = null;
}

  /* instructions
  count the number of pereks there is globally

  track the start perek index 
  track the perek end index
  calcualte the start global index to the end global index, and not the index of the perokem in each perek indivvusaly

  */
  
  
  // Attach click event listeners to each mesechet
  document.querySelectorAll('.bb').forEach(mesechet => {
    mesechet.addEventListener('click', function() {
        
        const numPereks = parseInt(this.className.match(/\d+/)[0]);
        const mesechetName = this.innerText;
        document.querySelector('#instruction').innerText='please select a start perek';
        displayPereks(mesechetName, numPereks);
    });
});

function displayPereks(mesechetName, numPereks) {
    console.log('clicked on a mesechet')
    const sideNav = document.querySelector('#sideNav');
    // sideNav.innerHTML = ''; // Clear previous content
    sideNav.querySelector('.bb-container').style = "display:none";

    const pereksContainer = document.createElement('div');
    pereksContainer.className = 'pereks-container';

    const mesechetTitle = document.createElement('h2');
    mesechetTitle.innerText = mesechetName;
    pereksContainer.appendChild(mesechetTitle);

    for (let i = 1; i <= numPereks; i++) {
        let perekDiv = document.createElement('div');
        perekDiv.setAttribute('class', 'perek');
        perekDiv.setAttribute('data-perek-index', i);
        perekDiv.innerText = `${mesechetName} פרק ${toHebrewNumber(i)}`;
        pereksContainer.appendChild(perekDiv);
    }

    sideNav.appendChild(pereksContainer);
}

// Function to convert numbers to Hebrew numerals
function toHebrewNumber(num) {
    const hebrewNumbers = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב', 'יג', 'יד', 'טו', 'טז', 'יז', 'יח', 'יט', 'כ', 'כא', 'כב', 'כג', 'כד', 'כה', 'כו', 'כז', 'כח', 'כט', 'ל'];
    return hebrewNumbers[num - 1] || num;
}

let selectedStartGlobalIndex = null;
let selectedEndGlobalIndex = null;


 
let totalGlobalPereks = 0;
let instructionElement = document.getElementById('instruction');

// Function to update the total global number of pereks
function updateTotalGlobalPereks() {
    totalGlobalPereks = 0;
    document.querySelectorAll('.bb').forEach(mesechet => {
        totalGlobalPereks += parseInt(mesechet.className.match(/\d+/)[0]);
    });
}

// Call this function on page load or when the mesechtot list updates
updateTotalGlobalPereks();

// Function to find the global index of a perek
function findGlobalPerekIndex(mesechetName, perekIndex) {
    let globalIndex = 0;
    let found = false;

    document.querySelectorAll('.bb').forEach(mesechet => {
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

document.querySelector('#sideNav').addEventListener('click', (event) => {
    const targetElement = event.target;

    if (targetElement.classList.contains('perek')) {
        
        const perekIndex = Number(targetElement.getAttribute('data-perek-index'));
const mesechetName = targetElement.closest('.pereks-container').querySelector('h2').innerText;
        const globalIndex = findGlobalPerekIndex(mesechetName, perekIndex);
        console.log('clicked on a perek')
        if (selectedStartGlobalIndex === null) {
            selectedStartGlobalIndex = globalIndex;
            instructionElement.innerText = 'Select till what perek to calculate';
            targetElement.style.backgroundColor = 'lightgreen';
        } else if (selectedEndGlobalIndex === null) {
            selectedEndGlobalIndex = globalIndex;
            targetElement.style.backgroundColor = 'lightgreen';
            
            calculateTotalPereks();
        }
    }
});

// Function to calculate total pereks selected
// this is what happens when you click on a end perek
function calculateTotalPereks() {
    let totalPereks = selectedEndGlobalIndex - selectedStartGlobalIndex + 0;
    instructionElement.innerText = `${totalPereks} perokem total`;
    //console.log('Total pereks selected:', totalPereks);
    console.log('clicked on end perek')
    // Reset selection for next calculation
    resetPerekSelection();
}

// Function to reset perek selection
function resetPerekSelection() {
    const pereks = document.querySelectorAll('.perek');
    pereks.forEach(perek => perek.style.backgroundColor = 'transparent');
    selectedStartGlobalIndex = null;
    selectedEndGlobalIndex = null;

    setTimeout(function() {
       
        document.querySelector('#instruction').innerText='Select a Masechta';
    }, 1200);
    
}


   // Function to close the pereks menu
   function closePereksMenu() {
      const pereksContainer = document.querySelector('.pereks-container');
      if (pereksContainer) {
        pereksContainer.remove(); // Removes only the pereks container
      }
    }

     // Event listener for clicking outside the pereks menu
    document.addEventListener('click', function(event) {
      const clickedInsideMenu = event.target.closest('#sideNav');
      const clickedOnMesechet = event.target.classList.contains('bb');

      if (!clickedInsideMenu && !clickedOnMesechet) {
        closePereksMenu();
        sideNav.querySelector('.bb-container').style = "display:block";
document.querySelector('#instruction').innerText = "Select a Masechta";
      }
    });  

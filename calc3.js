 // Global variables for tracking perek indices 
 let selectedStartPerekIndex = null; 
 let selectedEndPerekIndex = null; 
 let pereksContainer = null; // the pereks menu
 
 // Function to initialize the application 
 function initialize() { 
     attachMesechetListeners(); 
     attachSideNavListener(); 
     attachDocumentClickListener(); 
     loadStartingPerekFromLocalStorage(); 

 } 

 // Attach event listeners to each mesechet 
 function attachMesechetListeners() { 
     document.querySelectorAll('.bb').forEach(mesechet => { 
         mesechet.addEventListener('click', handleMesechetClick); 
     }); 
 } 

 // Handle mesechet click event 
 function handleMesechetClick() { 
     //console.log(`Attaching listener Masechet: ${this.innerText}`); 
     const numPereks = parseInt(this.className.match(/\d+/)[0]); 
     const mesechetName = this.innerText; 
     displayPereks(mesechetName, numPereks); 


 // Display pereks for a given mesechet 
 function displayPereks(mesechetName, numPereks) { 
     //console.log('clicked on a mesachta \n running displayPereks'); 
     const sideNav = document.querySelector('#sideNav'); 
     hideBBContainer(sideNav); 
     const pereksContainer = createPereksContainer(mesechetName, numPereks); 
     sideNav.appendChild(pereksContainer); 
 } 
}
                  /* if conditions */
   

                         
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
         const mesechetName = targetElement.closest('.pereks-container').querySelector('h2').innerText; 
         if (selectedStartPerekIndex === null) { 
             selectedStartPerekIndex = perekIndex; 
             console.log(`Start perek selected: ${perekIndex}`);  // Log start perek selection 
           // updateInstruction('Select dfdfan end perek'); 
             document.getElementById('fromPerek').innerText = `${mesechetName} פרק ${toHebrewNumber(perekIndex)}`; 
             targetElement.style.backgroundColor = 'lightgreen'; 
         } else if (selectedEndPerekIndex === null) { 
             selectedEndPerekIndex = perekIndex; 
             console.log(`End perek selected: ${perekIndex}`);    // Log end perek selection 
             document.getElementById('toPerek').innerText = `${mesechetName} פרק ${toHebrewNumber(perekIndex)}`; 
             targetElement.style.backgroundColor = 'lightgreen'; 
             calculateTotalPereks(); 
         } 
     } 
 } 


 // Function to calculate total pereks selected 
 function calculateTotalPereks() { 
     let totalPereks = selectedEndPerekIndex - selectedStartPerekIndex + 0; 
     //Total pereks selected: ${totalPereks} 
    // updateInstruction(`select a perek`); 
     console.log('Total pereks selected:', totalPereks); 
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
         console.log('globalPerekIndex key found in localStorage'); 
         const storedIndex = localStorage.getItem('globalPerekIndex'); 
         if (storedIndex) { 
             console.log('Value found for globalPerekIndex:', storedIndex); 
             const globalIndex = parseInt(storedIndex); 
             const { mesechetName, perekNumber } = findMesechetAndPerekByGlobalIndex(globalIndex); 
             selectedStartPerekIndex = perekNumber; 
             document.getElementById('fromPerek').innerText = `${mesechetName} פרק ${toHebrewNumber(perekNumber)}`; 
             //updateInstruction('Select an end perek'); 
         } else { 
             console.log('No value found for globalPerekIndex in localStorage'); 
         } 
     } else { 
         console.log('globalPerekIndex key not found in localStorage'); 
     } 
 } 
 // Find Mesechet and Perek by global index 
 function findMesechetAndPerekByGlobalIndex(globalIndex) { 
     let currentIndex = 0; 
     const mesechtot = document.querySelectorAll('.bb'); 
     for (let i = 0; i < mesechtot.length; i++) { 
         const mesechet = mesechtot[i]; 
         const numPereks = parseInt(mesechet.className.match(/\d+/)[0]); 
         if (currentIndex + numPereks >= globalIndex) { 
             const perekNumber = globalIndex - currentIndex; 
             const mesechetName = mesechet.innerText; 
             return { mesechetName, perekNumber }; 
         } 
         currentIndex += numPereks; 
     } 
     return { mesechetName: 'Unknown', perekNumber: 0 }; 
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
         // updateInstruction('Select a Masechta'); 
         closePereksMenu(); 
         document.querySelector('#sideNav .bb-container').style = "display:block"; 
     } 
 } 


                   /* if conditions (latest) */
   

// A start perek was selected and the pereks container is currently open
if (selectedStartPerekIndex !== null && pereksContainer !== null) {
    updateInstruction('Select an sdpo perek');
    console.log('A start perek was selected and the pereks container is open');
}


  // A start perek was selected and the pereks container is currently closed
if (selectedStartPerekIndex !== null && pereksContainer == null) {
    updateInstruction('Select an sdpc mesechet');
    console.log('A start perek was selected and the pereks container is closed');
}



// No start perek has been selected and the pereks container is currently open
if (selectedStartPerekIndex == null && pereksContainer !== null) {
    updateInstruction('Select an sndpo perek');
    console.log('No start perek has been selected and the pereks container is open');
}


// No start perek has been selected and the pereks container is currently closed
if (selectedStartPerekIndex == null && pereksContainer == null) {
    updateInstruction('Select an sndpc mesechet');
    console.log('No start perek has been selected and the pereks container is closed');
}

 
                         /* end if conditions */
 // Initialize the application 
 initialize();
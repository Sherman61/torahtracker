
  // Calculate the total number of daffim in all masechtot
  let totaldaffim = Array.from(document.querySelectorAll('.bb')).reduce((sum, bbElement) => {
    return sum + parseInt(bbElement.className.match(/\d+/)[0]);
}, 0);

const bbElements = document.querySelectorAll('.bb');
let currentGlobaldaffIndex = parseInt(localStorage.getItem('globaldaffIndex') || '1') - 1;

let daffTodayStartIndex = parseInt(localStorage.getItem('daffTodayStartIndex') || '0');
let lastDate = localStorage.getItem('lastDate') || '';
let todayDate = new Date().toDateString();

if (lastDate !== todayDate) {
    lastDate = todayDate;
    localStorage.setItem('lastDate', todayDate);
    daffTodayStartIndex = currentGlobaldaffIndex;
    localStorage.setItem('daffTodayStartIndex', daffTodayStartIndex.toString());
}

bbElements.forEach((bbElement, index) => {
    bbElement.addEventListener('click', () => createSideNavs(index + 1));
});

// A mapping of English to Hebrew digits
const hebrewDigits = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'י"א', 'י"ב', 'י"ג', 'י"ד', 'ט"ו', 'ט"ז', 'י"ז', 'י"ח', 'י"ט',
 'כ', 'כ"א', 'כ"ב', 'כ"ג', 'כ"ד', 'כ"ה', 'כ"ו', 'כ"ז', 'כ"ח', 'כ"ט', 'ל'
,'ל"א', 'ל"ב', 'ל"ג', 'ל"ד', 'ל"ה', 'ל"ו', 'ל"ז', 'ל"ח', 'ל"ט',
    'מ', 'מ"א', 'מ"ב', 'מ"ג', 'מ"ד', 'מ"ה', 'מ"ו', 'מ"ז', 'מ"ח', 'מ"ט',  
    'נ', 'נ"א', 'נ"ב', 'נ"ג', 'נ"ד', 'נ"ה', 'נ"ו', 'נ"ז', 'נ"ח', 'נ"ט',
    'ס', 'ס"א', 'ס"ב', 'ס"ג', 'ס"ד', 'ס"ה', 'ס"ו', 'ס"ז', 'ס"ח', 'ס"ט',
    'ע', 'ע"א', 'ע"ב', 'ע"ג', 'ע"ד', 'ע"ה', 'ע"ו', 'ע"ז', 'ע"ח', 'ע"ט',
    'פ', 'פ"א', 'פ"ב', 'פ"ג', 'פ"ד', 'פ"ה', 'פ"ו', 'פ"ז', 'פ"ח', 'פ"ט',
    'צ', 'צ"א', 'צ"ב', 'צ"ג', 'צ"ד', 'צ"ה', 'צ"ו', 'צ"ז', 'צ"ח', 'צ"ט',
    
];

function createSideNavs(mesechetIndex) {
    const oldSideNavContainer = document.querySelector('.side-nav-container');
    if (oldSideNavContainer) {
        oldSideNavContainer.remove();
        // Hide the sidebar
        //submenu.style.display = 'none'; 
       
      document.querySelector('ul').style.opacity = '0';
      document.querySelector('.menu').style.opacity = '0';
    //   document.querySelector('.menu').style.display = 'none';
    }

    
    const sideNavContainer = document.createElement('ul');
    sideNavContainer.classList.add('side-nav-container');
    document.querySelector('.sidebar').appendChild(sideNavContainer);

    const bbElement = bbElements[mesechetIndex - 1];
    const num = parseInt(bbElement.className.match(/\d+/)[0]);
    const gMesechet = bbElement.textContent;

    for (let i = 1; i <= num; i++) {
        const globaldaffIndex = calculateGlobaldaffIndex(mesechetIndex, i);
        const sideNav = document.createElement('li');
        sideNav.classList.add('side-nav');
        sideNav.style.top = `${i * 1}px`;
        sideNav.style.transform = `translateX(0px)`;

        const daffHebrewNumber = hebrewDigits[i-1]; // translate to Hebrew number
        sideNav.innerHTML = `<p>${gMesechet} דף ${daffHebrewNumber}</p>`; // use Hebrew number here

        sideNav.addEventListener('click', () => {
            const previousGlobaldaffIndex = currentGlobaldaffIndex;
            const newGlobaldaffIndex = calculateGlobaldaffIndex(mesechetIndex, i);
            handledaffClick(previousGlobaldaffIndex, newGlobaldaffIndex, gMesechet, i);
      
            currentGlobaldaffIndex = globaldaffIndex - 1;
            localStorage.setItem('globaldaffIndex', `${currentGlobaldaffIndex + 1}`);
            localStorage.setItem('gMesechet', gMesechet);
            localStorage.setItem('daff', `daff ${i}`);

            updatedaffimToday(previousGlobaldaffIndex, currentGlobaldaffIndex);
            updateStats();
            updateMesAnddaff();
        });

        sideNavContainer.appendChild(sideNav);
    }

    setTimeout(() => {
        document.addEventListener('click', function (event) {
            if (!event.target.closest('.side-nav') && !event.target.closest('.bb')) {
                const sideNavs = document.querySelectorAll('.side-nav');
                sideNavs.forEach(sideNav => sideNav.remove());
            }
        });
    }, 0);
}

function updatedaffimToday(previousIndex, currentIndex) {
    // Calculate the difference between the current index and the start index
    let difference = currentIndex - daffTodayStartIndex;

    // Check if the current index has wrapped around to the start
    if (currentIndex < daffTodayStartIndex) {
        // Calculate the remaining daffim from the previous cycle
        let remainingdaffim = totaldaffim - daffTodayStartIndex;

        // Add the current index to the remaining daffim
        difference = remainingdaffim + currentIndex;
    }

    // Ensure daffimToday is not negative
    const daffimToday = Math.max(difference, 0);

    // Update the daffimToday in localStorage and stats
    localStorage.setItem('daffimToday', `${daffimToday}`);
    updateStats();
}
function handledaffClick(previousIndex, newIndex, gMesechet, daffNumber) {
    const difference = newIndex - previousIndex;

    if (difference < -100) {
        // Automatically reset if the difference is more than -100
        daffTodayStartIndex = newIndex -1;
        currentGlobaldaffIndex = newIndex ;
        // Perform the reset and update
    } else if (difference < -50) {
        // Ask user to reset the start daff and current daff
        const userChoice = confirm("You have selected a daff that is significantly earlier than your current position. Do you want to reset your progress to this new daff?");
        if (userChoice) {
          //  daffTodayStartIndex = newIndex;
            daffTodayStartIndex = newIndex - 0; // Set to one less than the new index
            currentGlobaldaffIndex = newIndex;
            // Perform the reset and update
        }
    } else {
        // Normal progression, just update currentGlobaldaffIndex
        currentGlobaldaffIndex = newIndex;
    }

    // Save new values and update display
    localStorage.setItem('globaldaffIndex', `${currentGlobaldaffIndex + 1}`);
    localStorage.setItem('gMesechet', gMesechet);
    localStorage.setItem('daff', `daff ${daffNumber}`);
    localStorage.setItem('daffTodayStartIndex', `${daffTodayStartIndex}`);
    updateStats();
    updateMesAnddaff();
}


document.addEventListener('click', function (event) {
    if (!event.target.closest('.sidebar')) {
        const oldSideNavContainer = document.querySelector('.side-nav-container');
        if (oldSideNavContainer) {
            oldSideNavContainer.remove();
            document.querySelector('ul').style.opacity = '1';
            document.querySelector('.menu').style.opacity = '1';
            // document.querySelector('.menu').style.display = 'block';
            // document.querySelector('ul.side-nav-container').style.display = 'none';
        }
    }
});

function calculateGlobaldaffIndex(mesechetIndex, daffIndex) {
    let globaldaffIndex = 0;
    for (let i = 0; i < mesechetIndex - 1; i++) {
        globaldaffIndex += parseInt(bbElements[i].className.match(/\d+/)[0]);
    }
    globaldaffIndex += daffIndex;
    return globaldaffIndex;
}

function updateMesAnddaff() {
    const gMesechet = localStorage.getItem('gMesechet') || '';
    let daffNumber = localStorage.getItem('daff').split(' ')[1] || ''; 
    // translate to Hebrew number
    if (daffNumber) {
        daffNumber = hebrewDigits[parseInt(daffNumber, 10) - 1];
    }
    const mesAnddaffElement = document.getElementById('mesanddaff');
    mesAnddaffElement.innerText = `${gMesechet} דף ${daffNumber}`;
}

function updateStats() {
    const finishedElement = document.getElementById('finished');
    finishedElement.innerText = `daffim done: ${currentGlobaldaffIndex}`;

    const percentDoneElement = document.getElementById('percentdone');
    const percentDone = Math.round((currentGlobaldaffIndex / totaldaffim) * 100);
    percentDoneElement.innerText = `Percent done: ${percentDone}%`;

    const toGoElement = document.getElementById('to-go');
    const toGo = totaldaffim - currentGlobaldaffIndex;
    toGoElement.innerText = `daffim left: ${toGo}`;

    const daffimTodayElement = document.getElementById('today');
    const daffimToday = localStorage.getItem('daffimToday');
    daffimTodayElement.innerText = `daffim today: ${Math.abs(daffimToday)}`;
}


// Update stats and gMesechet and daff on page load
updateStats();
updateMesAnddaff();

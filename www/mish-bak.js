
  // Calculate the total number of pereks in all masechtot
  let totalPereks = Array.from(document.querySelectorAll('.bb')).reduce((sum, bbElement) => {
    return sum + parseInt(bbElement.className.match(/\d+/)[0]);
}, 0);

const bbElements = document.querySelectorAll('.bb');
let currentGlobalPerekIndex = parseInt(localStorage.getItem('globalPerekIndex') || '1') - 1;

let pereksTodayStartIndex = parseInt(localStorage.getItem('pereksTodayStartIndex') || '0');
let lastDate = localStorage.getItem('lastDate') || '';
let todayDate = new Date().toDateString();

if (lastDate !== todayDate) {
    lastDate = todayDate;
    localStorage.setItem('lastDate', todayDate);
    pereksTodayStartIndex = currentGlobalPerekIndex;
    localStorage.setItem('pereksTodayStartIndex', pereksTodayStartIndex.toString());
}

bbElements.forEach((bbElement, index) => {
    bbElement.addEventListener('click', () => createSideNavs(index + 1));
});

// A mapping of English to Hebrew digits
const hebrewDigits = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'י"א', 'י"ב', 'י"ג', 'י"ד', 'ט"ו', 'ט"ז', 'י"ז', 'י"ח', 'י"ט', 'כ', 'כ"א', 'כ"ב', 'כ"ג', 'כ"ד', 'כ"ה', 'כ"ו', 'כ"ז', 'כ"ח', 'כ"ט', 'ל'];

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
    const mesechet = bbElement.textContent;

    for (let i = 1; i <= num; i++) {
        const globalPerekIndex = calculateGlobalPerekIndex(mesechetIndex, i);
        const sideNav = document.createElement('li');
        sideNav.classList.add('side-nav');
        sideNav.style.top = `${i * 1}px`;
        sideNav.style.transform = `translateX(0px)`;

        const perekHebrewNumber = hebrewDigits[i-1]; // translate to Hebrew number
        sideNav.innerHTML = `<p>${mesechet} פרק ${perekHebrewNumber}</p>`; // use Hebrew number here

        sideNav.addEventListener('click', () => {
            currentGlobalPerekIndex = globalPerekIndex - 1;
            localStorage.setItem('globalPerekIndex', `${currentGlobalPerekIndex + 1}`);
            localStorage.setItem('mesechet', mesechet);
            localStorage.setItem('perek', `perek ${i}`);
            updateStats();
            updateMesAndPerek();
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

function calculateGlobalPerekIndex(mesechetIndex, perekIndex) {
    let globalPerekIndex = 0;
    for (let i = 0; i < mesechetIndex - 1; i++) {
        globalPerekIndex += parseInt(bbElements[i].className.match(/\d+/)[0]);
    }
    globalPerekIndex += perekIndex;
    return globalPerekIndex;
}

function updateMesAndPerek() {
    const mesechet = localStorage.getItem('mesechet') || '';
    let perekNumber = localStorage.getItem('perek').split(' ')[1] || ''; 
    // translate to Hebrew number
    if (perekNumber) {
        perekNumber = hebrewDigits[parseInt(perekNumber, 10) - 1];
    }
    const mesAndPerekElement = document.getElementById('mesandperek');
    mesAndPerekElement.innerText = `${mesechet} פרק ${perekNumber}`;
}

function updateStats() {
    const finishedElement = document.getElementById('finished');
    finishedElement.innerText = `Pereks done: ${currentGlobalPerekIndex}`;

    const percentDoneElement = document.getElementById('percentdone');
    const percentDone = Math.round((currentGlobalPerekIndex / totalPereks) * 100);
    percentDoneElement.innerText = `Percent done: ${percentDone}%`;

    const toGoElement = document.getElementById('to-go');
    const toGo = totalPereks - currentGlobalPerekIndex;
    toGoElement.innerText = `Pereks left: ${toGo}`;

    const pereksTodayElement = document.getElementById('today');
    const pereksToday = currentGlobalPerekIndex - pereksTodayStartIndex;
    pereksTodayElement.innerText = `Pereks today: ${pereksToday}`;
}

// Update stats and mesechet and perek on page load
updateStats();
updateMesAndPerek();

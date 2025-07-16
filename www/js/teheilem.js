// Initialize local storage variables if not present
   if (!localStorage.getItem('currentPsalmIndex')) {
    localStorage.setItem('currentPsalmIndex', '0');
  }

  if (!localStorage.getItem('startOfDayPsalmIndex')) {
    localStorage.setItem('startOfDayPsalmIndex', '0');
  }

  // Function to update statistics
  function updateStats(currentPsalmIndex) {
    const psalms = document.querySelectorAll('.tehellim');
    const totalPsalms = psalms.length;
    const completedPsalms = parseInt(currentPsalmIndex);

    const percentageDone = (((completedPsalms + 1) / totalPsalms) * 100).toFixed(2);
    const psalmsLeft = totalPsalms - (completedPsalms + 1);

    document.getElementById('up-to').textContent = `up to: ${psalms[currentPsalmIndex].textContent}`;
    document.getElementById('percentagedone').textContent = `percentage done: ${percentageDone}%`;
    document.getElementById('psalms-to-go').textContent = ` קפיטלוך Left: ${psalmsLeft}`;
  }

  // Function to update today's psalms
  function updateToday(currentPsalmIndex) {
    const startOfDayPsalmIndex = parseInt(localStorage.getItem('startOfDayPsalmIndex'));
    const psalmsToday = currentPsalmIndex - startOfDayPsalmIndex + 1;

    document.getElementById('today').textContent = `Teheilem today: ${psalmsToday}`;
  }

  // Event listener for clicking on a psalm
  const psalms = document.querySelectorAll('.tehellim');
  psalms.forEach((psalm, index) => {
    psalm.addEventListener('click', () => {
      localStorage.setItem('currentPsalmIndex', index.toString());
      psalms.forEach((psalm) => psalm.style.fontWeight = '');
      psalm.style.fontWeight = 'bold';
      updateStats(index);
      updateToday(index);
    });
  });

  // On page load
  document.addEventListener('DOMContentLoaded', () => {
    const currentPsalmIndex = localStorage.getItem('currentPsalmIndex');
    if (currentPsalmIndex) {
      psalms[currentPsalmIndex].style.fontWeight = 'bold';
      updateStats(currentPsalmIndex);
      updateToday(currentPsalmIndex);
    }

    // At midnight, update the start of day Psalm index
    const now = new Date();
    const then = new Date(now);
    then.setHours(24, 0, 0, 0);
    const timeToMidnight = then.getTime() - now.getTime();

    setTimeout(() => {
      localStorage.setItem('startOfDayPsalmIndex', localStorage.getItem('currentPsalmIndex'));
    }, timeToMidnight);
  });
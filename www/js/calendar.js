function formatDate(date) {
  return date.toISOString().split('T')[0]; // yyyy-mm-dd
}

function createDayCell(date, entry) {
  const div = document.createElement('div');
  div.className = 'day';
  const todayStr = formatDate(new Date());
  if (formatDate(date) === todayStr) div.classList.add('today');

  const dateP = document.createElement('div');
  dateP.className = 'date';
  dateP.innerText = date.getDate();
  div.appendChild(dateP);

  if (entry) {
    const summary = document.createElement('div');
    summary.className = 'summary';
    summary.innerText = `Today: ${entry.pereksToday}`;
    div.appendChild(summary);
  }

  div.addEventListener('click', async () => {
    const from = prompt('Start index?', entry?.pereksTodayStartIndex || '');
    const global = prompt('Global index?', entry?.globalPerekIndex || '');
    const today = prompt('Pereks today?', entry?.pereksToday || '');

    if (from && global && today) {
      await saveProgress(formatDate(date), {
        pereksTodayStartIndex: parseInt(from),
        globalPerekIndex: parseInt(global),
        pereksToday: parseInt(today)
      });
      renderCalendar(); // refresh
    }
  });

  return div;
}

async function renderCalendar() {
  const container = document.getElementById('calendar');
  container.innerHTML = '';
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();

  const firstWeekday = firstDay.getDay(); // Sunday=0
  const allProgress = await getAllProgress();
  const progressMap = {};
  allProgress.forEach(entry => progressMap[entry.date] = entry);

  // Fill blanks before 1st
  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement('div');
    empty.className = 'day';
    container.appendChild(empty);
  }

  for (let d = 1; d <= totalDays; d++) {
    const day = new Date(year, month, d);
    const entry = progressMap[formatDate(day)];
    container.appendChild(createDayCell(day, entry));
  }
}

renderCalendar();

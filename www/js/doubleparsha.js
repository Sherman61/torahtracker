// doubleparsha.js - Clickable table cells version

// grab your slider elements
const slider   = document.getElementById('parshaSlider');
const inner    = slider.querySelector('.slider-inner');
const prevBtn  = document.getElementById('prevParsha');
const nextBtn  = document.getElementById('nextParsha');
const headerEl = document.getElementById('torahPortion');

let parshaNames = [], panelsCount = 0, panelIndex = 0;

// 1) Fetch & detect new week → clear old week's keys
async function initParsha() {
  const full = await fetchTorahPortion();           // e.g. "חקת-בלק" or "ניצבים"
  const last = localStorage.getItem('lastFullParsha');
  if (last !== full) {
    if (last) {
      last.split('-').map(s => s.trim())
          .forEach(name => {
            localStorage.removeItem(`checkboxes_${name}`);
            localStorage.removeItem(`percent_${name}`);
          });
    }
    localStorage.setItem('lastFullParsha', full);
  }
  headerEl.innerText = full;  // always show full string in header
  parshaNames = full.includes('-')
    ? full.split('-').map(s => s.trim())
    : [ full.trim() ];
}

// 2) Build one panel (with row-major idx) - Now with clickable cells
function buildParshaPanel(name) {
  const stored = JSON.parse(localStorage.getItem(`checkboxes_${name}`) || '[]');
  const pct    = localStorage.getItem(`percent_${name}`) || '0.00';
  const showTitle = parshaNames.length > 1;
  const titleHtml = showTitle
    ? `<h2 class="dbparsha">${name}</h2>`
    : '';

  const weekdays = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שביעי'];
  const columns = ['תרגום', 'שנים', 'אחד'];
  
  let html = `${titleHtml}<table>
    <thead>
      <tr><th>תרגום</th><th>שנים</th><th>אחד</th><th>יום</th></tr>
    </thead><tbody>`;

  for (let d = 0; d < 7; d++) {
    html += '<tr>';
    for (let c = 0; c < 3; c++) {
      // row-major mapping:
      const idx = d * 3 + c;
      const checked = stored[idx] ? 'checked' : '';
      html += `<td class="clickable-cell ${checked}" 
                   data-parsha="${name}" 
                   data-idx="${idx}"
                   title="${columns[c]}">
                <span class="cell-icon">${checked ? '✓' : ''}</span>
              </td>`;
    }
    html += `<td class="day-cell">${weekdays[d]}</td></tr>`;
  }

  html += `</tbody>
    <tfoot>
      <tr><td colspan="4">
        <button class="clear-btn" data-parsha="${name}">
          נקה הכל • <span class="percent">${pct}%</span>
        </button>
      </td></tr>
    </tfoot>
  </table>`;

  const wrap = document.createElement('div');
  wrap.className = 'parsha-panel';
  wrap.dataset.parsha = name;
  wrap.innerHTML = html;
  return wrap;
}

// 3) Render the slider in natural order ([first,…second])
function renderParshaSlider() {
  inner.innerHTML = '';
  panelsCount = parshaNames.length;

  parshaNames.forEach(name => {
    inner.appendChild(buildParshaPanel(name));
  });

  // start on the FIRST panel (the first Hebrew name)
  panelIndex = 0;
  slider.classList.remove('hidden');
  updateSlider();
  bindPanelEvents();
}

// 4) Update the transform & arrow visibility
function updateSlider() {
  inner.style.transform = `translateX(-${panelIndex * 100}%)`;

  // show ← when you can go "next" (panelIndex=0 → second)
  prevBtn.classList.toggle('hidden', panelIndex === panelsCount - 1);
  // show → when you can go "previous" (panelIndex=1 → first)
  nextBtn.classList.toggle('hidden', panelIndex === 0);
}

// flip the meaning: ← moves you forward, → moves you back
prevBtn.onclick = () => {
  panelIndex = Math.min(panelsCount - 1, panelIndex + 1);
  updateSlider();
};
nextBtn.onclick = () => {
  panelIndex = Math.max(0, panelIndex - 1);
  updateSlider();
};

// 5) Hook up clickable cells and clear button
function bindPanelEvents() {
  inner.querySelectorAll('.parsha-panel').forEach(panel => {
    const name  = panel.dataset.parsha;
    const cells = Array.from(panel.querySelectorAll('.clickable-cell'));
    const pctEl = panel.querySelector('.percent');
    const clr   = panel.querySelector('.clear-btn');

    // Make cells clickable
    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        // Toggle checked state
        cell.classList.toggle('checked');
        const icon = cell.querySelector('.cell-icon');
        icon.textContent = cell.classList.contains('checked') ? '✓' : '';
        
        // Save to localStorage
        const states = cells.map(c => c.classList.contains('checked'));
        localStorage.setItem(`checkboxes_${name}`, JSON.stringify(states));
        
        // Update percentage
        const done = states.filter(b => b).length;
        const percent = ((done / states.length) * 100).toFixed(2);
        pctEl.textContent = percent + '%';
        localStorage.setItem(`percent_${name}`, percent);
      });
    });

    // Clear all button
    clr.addEventListener('click', () => {
      cells.forEach(cell => {
        cell.classList.remove('checked');
        cell.querySelector('.cell-icon').textContent = '';
      });
      localStorage.removeItem(`checkboxes_${name}`);
      localStorage.removeItem(`percent_${name}`);
      pctEl.textContent = '0.00%';
    });
  });
}

// 6) Boot it all up
;(async function(){
  await initParsha();
  renderParshaSlider();
})();

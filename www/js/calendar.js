//calendar.js
let selectedDate = null;

function formatDate(d) { return d.toISOString().split('T')[0]; }
function toHebrewNumber(n) {
  const h=['א','ב','ג','ד','ה','ו','ז','ח','ט','י','יא','יב','יג','יד','טו','טז','יז','יח','יט','כ','כא','כב','כג','כד','כה','כו','כז','כח','כט','ל'];
  return h[n-1]||n;
}

async function renderCalendar() {
  const cal = document.getElementById('calendar');
  cal.innerHTML = '';
  const now=new Date(), y=now.getFullYear(), m=now.getMonth();
  const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate();
  const all = await getAllProgress(), map={};
  all.forEach(e=>map[e.date]=e);

  for(let i=0;i<first;i++) cal.appendChild(document.createElement('div')).className='day';
  for(let d=1;d<=days;d++){
    const dt=new Date(y,m,d), key=formatDate(dt), entry=map[key];
    const div=document.createElement('div'); div.className='day';
    if(key===formatDate(new Date())) div.classList.add('today');
    const p=document.createElement('div'); p.className='date'; p.innerText=d; div.appendChild(p);
    if(entry){ let s=document.createElement('div'); s.className='summary'; s.innerText=`Today: ${entry.pereksToday}`; div.appendChild(s); }
    div.addEventListener('click',()=>{
      selectedDate=key;
      document.getElementById('instruction').innerText='Select a Masechta';
      document.getElementById('menuOverlay').classList.remove('hidden');
      document.getElementById('menu').classList.remove('menu-hidden');
    //   document.getElementById('backBtn').classList.add('hidden');
    });
    cal.appendChild(div);
  }
}

renderCalendar();

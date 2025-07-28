// indexedDB.deleteDatabase('TorahTrackerDB');


const DB_NAME = 'TorahTrackerDB';
const STORE_NAME = 'dailyProgress';



function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'date' });
      }
    };
  });
}

async function saveProgress(date, data) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.put({ date, ...data });
  return tx.complete;
}

async function getProgress(date) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.get(date);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}


async function getAllProgress() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function saveDailyProgressToDB(date, startIndex, endIndex, pereksToday, goalReached = false) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  // now include goalReached in every record
  store.put({ date, startIndex, endIndex, pereksToday, goalReached });
  return tx.complete;
}


 async function deleteProgress(date) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(date);
  return tx.complete;
}


async function clearAllProgress() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
  return tx.complete;
}
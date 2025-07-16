const dbName = 'TorahTrackerDB';
const storeName = 'dailyStats';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'date' });
      }
    };
  });
}

async function saveDayStat({ date, startIndex, globalIndex, pereksToday }) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.put({ date, startIndex, globalIndex, pereksToday });
  return tx.complete;
}

async function getAllStats() {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return store.getAll();
}

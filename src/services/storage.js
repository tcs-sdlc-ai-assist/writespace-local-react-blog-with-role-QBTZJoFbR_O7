const read = (key) => {
  try {
    const data = localStorage.getItem(key);
    if (data === null) return null;
    return JSON.parse(data);
  } catch (err) {
    console.error(`[StorageHelper] Failed to read key "${key}":`, err);
    return null;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[StorageHelper] Failed to write key "${key}":`, err);
    return false;
  }
};

export { read, write };
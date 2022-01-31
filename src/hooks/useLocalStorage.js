let available = false;
const testKey = "__localstorage_test";
try {
  window.localStorage.setItem(testKey, "{}");
  window.localStorage.removeItem(testKey);
  available = true;
} catch (e) {
  console.error(e);
}

export default function useLocalStorage(key) {
  function isAvailable() {
    return available;
  }
  function get() {
    return JSON.parse(window.localStorage.getItem(key));
  }
  function set(o) {
    window.localStorage.setItem(key, JSON.stringify(o));
  }
  return { isAvailable, get, set };
}

import { useEffect, useRef } from "react";
import useLocalStorage from "./useLocalStorage";

// character history:
// [
//   {
//     code: String
//     keys: [[key: String, t: Number]]
//     hasError: Boolean
//   }
// ]
const CODE_PROPERTY = "c";
const KEYS_PROPERTY = "k";
const HAS_ERROR_PROPERTY = "e";
function newHistory() {
  return {
    [CODE_PROPERTY]: "",
    [KEYS_PROPERTY]: [],
    [HAS_ERROR_PROPERTY]: false
  };
}
export default function useCharacterHistory() {
  const { isAvailable, get: getHistory, set: setHistory } = useLocalStorage("history");
  const historyRef = useRef({});
  const currentCharacterHistoryRef = useRef(newHistory());
  const lastKeyTimeRef = useRef(Date.now());

  useEffect(() => {
    if (isAvailable()) {
      const localHistory = getHistory();
      if (localHistory) {
        historyRef.current = localHistory;
      }
    }
  }, []);

  /**
   *
   * @param {string} key [a-z|"Backspace"|"Space"]
   */
  function onKey(key) {
    const now = Date.now();
    const dt = now - lastKeyTimeRef.current;
    currentCharacterHistoryRef.current[KEYS_PROPERTY].push([key, dt]);
    lastKeyTimeRef.current = now;
  }
  function onComposition(success, code, character) {
    if (success) {
      currentCharacterHistoryRef.current[CODE_PROPERTY] = code;

      if (!historyRef.current[character]) {
        historyRef.current[character] = [];
      }
      const characterHistories = historyRef.current[character];
      characterHistories.push(currentCharacterHistoryRef.current);
      if (characterHistories.length > 10) {
        characterHistories.shift();
      }
      currentCharacterHistoryRef.current = newHistory();

      if (isAvailable()) {
        setHistory(historyRef.current);
      }
    } else {
      currentCharacterHistoryRef.current[HAS_ERROR_PROPERTY] = true;
    }
  }
  function clearCurrentComposition() {
    currentCharacterHistoryRef.current = newHistory();
  }
  return { onKey, onComposition, clearCurrentComposition };
}

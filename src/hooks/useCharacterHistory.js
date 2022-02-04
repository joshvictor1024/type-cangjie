import { useEffect, useRef } from "react";
import useLocalStorage from "./useLocalStorage";
import { getIsoDate } from "../util/isoDate";

// character history:
// {
//   isoDate: String: {
//     character: String: {
//       code: String
//       keys: [key: String, time: Number]
//       hasError: Boolean
//     }
//   }
// }
const CODE_PROPERTY = "c";
const KEYS_PROPERTY = "k";
const HAS_ERROR_PROPERTY = "e";
function newCharacterHistory() {
  return {
    [CODE_PROPERTY]: "",
    [KEYS_PROPERTY]: [],
    [HAS_ERROR_PROPERTY]: false
  };
}
const MAX_HISTORY_PER_CHARACTER_PER_DAY = 10;
const MAX_KEY_TIME = 2000;
export default function useCharacterHistory() {
  const { isAvailable, get: getHistory, set: setHistory } = useLocalStorage("history");
  const historyRef = useRef({});
  const currentCharacterHistoryRef = useRef(newCharacterHistory());
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
      if (currentCharacterHistoryRef.current[KEYS_PROPERTY].find(([key, time]) => time > MAX_KEY_TIME)) {
        console.log("idle");
        return;
      }
      currentCharacterHistoryRef.current[CODE_PROPERTY] = code;

      const isoDate = getIsoDate();
      if (!historyRef.current[isoDate]) {
        historyRef.current[isoDate] = {};
      }
      const todayHistory = historyRef.current[isoDate];
      if (!todayHistory[character]) {
        todayHistory[character] = [];
      }
      const characterHistories = todayHistory[character];
      characterHistories.push(currentCharacterHistoryRef.current);
      if (characterHistories.length > MAX_HISTORY_PER_CHARACTER_PER_DAY) {
        characterHistories.shift();
      }
      currentCharacterHistoryRef.current = newCharacterHistory();

      if (isAvailable()) {
        setHistory(historyRef.current);
      }
    } else {
      currentCharacterHistoryRef.current[HAS_ERROR_PROPERTY] = true;
    }
  }
  function clearCurrentComposition() {
    currentCharacterHistoryRef.current = newCharacterHistory();
  }
  return { onKey, onComposition, clearCurrentComposition };
}

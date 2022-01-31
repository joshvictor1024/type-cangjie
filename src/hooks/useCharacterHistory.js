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
  const currentWordRef = useRef("");
  const currentHistoryRef = useRef(null);

  useEffect(() => {
    if (isAvailable()) {
      const localWordKeyHistory = getHistory();
      if (localWordKeyHistory) {
        historyRef.current = localWordKeyHistory;
      }
    }
  }, []);

  function beginCharacter(word) {
    currentWordRef.current = word;
    currentHistoryRef.current = newHistory();
    //console.log("begin", currentWordRef.current);
  }
  function addKey(key, t) {
    currentHistoryRef.current[KEYS_PROPERTY].push([key, t]);
  }
  function setError() {
    currentHistoryRef.current[HAS_ERROR_PROPERTY] = true;
  }
  function setCode(code) {
    currentHistoryRef.current[CODE_PROPERTY] = code;
  }
  function endCharacter() {
    //console.log("end", currentWordRef.current);
    if (!historyRef.current[currentWordRef.current]) {
      historyRef.current[currentWordRef.current] = [];
    }
    const ch = historyRef.current[currentWordRef.current];

    ch.push(currentHistoryRef.current);
    if (ch.length > 10) {
      ch.shift();
    }
    currentWordRef.current = "";
    currentHistoryRef.current = newHistory();

    if (isAvailable()) {
      setHistory(historyRef.current);
    }
  }

  return { addKey, setError, setCode, beginCharacter, endCharacter };
}

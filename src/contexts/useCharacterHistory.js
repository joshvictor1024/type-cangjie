import { createContext, useContext, useEffect, useRef } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { getIsoDate, validateIsoDate } from "../util/isoDate";
import * as ch from "../lib/typing/compositionHistory";

// character history:
// {
//   isoDate: String: {
//     character: String: [{
//       code: String
//       keys: [[key: String, time: Number]]
//       hasError: Boolean
//     }]
//   }
// }

const MAX_HISTORY_PER_CHARACTER_PER_DAY = 10;
const MAX_KEY_TIME = 1500;
function validateChs(obj) {
  try {
    let flag = false;
    // obj.forEach((v) => (flag |= !validateCharacterHistory(v)));
    obj.forEach((v) => (flag |= ch.validate(v, MAX_KEY_TIME) !== null));
    return !flag;
  } catch (e) {
    console.error(e);
    return false;
  }
}
function validateCharactersChs(obj) {
  try {
    let flag = false;

    Object.keys(obj).forEach((v) => {
      flag |= typeof v !== "string";
      flag |= v.length !== 1;
    });
    if (flag) {
      console.log("invalid character");
      return false;
    }

    Object.values(obj).forEach((v) => (flag |= !validateChs(v)));
    if (flag) return false;

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
function validateDatesHistory(obj) {
  try {
    let flag = false;

    Object.keys(obj).forEach((v) => (flag |= !validateIsoDate(v)));
    if (flag) return false;

    Object.values(obj).forEach((v) => (flag |= !validateCharactersChs(v)));
    if (flag) return false;

    return true;
  } catch (e) {
    return false;
  }
}

const CompositionHistoryContext = createContext({
  history: {},
  setHistory: () => false,
  onKey: () => {},
  onComposition: () => {},
  clearCurrentComposition: () => {}
});

function CompositionHistoryProvider(props) {
  const { isAvailable, get: getHistory, set: setHistory } = useLocalStorage("history");
  const historyRef = useRef({});
  const currentCHRef = useRef(ch.createCompositionHistory());
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
    lastKeyTimeRef.current = now;
    currentCHRef.current = ch.addKey(currentCHRef.current, key, dt);
  }
  function onComposition(success, code, character) {
    if (success) {
      if (ch.hasIdle(currentCHRef.current, MAX_KEY_TIME)) {
        console.log("idle");
        currentCHRef.current = ch.createCompositionHistory();
        return;
      }
      currentCHRef.current = ch.setCode(currentCHRef.current, code);

      const isoDate = getIsoDate();
      if (!historyRef.current[isoDate]) {
        historyRef.current[isoDate] = {};
      }
      const todayHistory = historyRef.current[isoDate];
      if (!todayHistory[character]) {
        todayHistory[character] = [];
      }
      const characterHistories = todayHistory[character];
      characterHistories.push(currentCHRef.current);
      if (characterHistories.length > MAX_HISTORY_PER_CHARACTER_PER_DAY) {
        characterHistories.shift();
      }
      currentCHRef.current = ch.createCompositionHistory();

      if (isAvailable()) {
        setHistory(historyRef.current);
      }
    } else {
      currentCHRef.current = ch.setHasError(currentCHRef.current);
    }
  }
  function clearCurrentComposition() {
    currentCHRef.current = ch.createCompositionHistory();
  }
  function setHistoryExternal(obj) {
    const isValid = validateDatesHistory(obj);
    console.log(obj, isValid);
    if (isValid) {
      historyRef.current = obj;
      if (isAvailable()) {
        setHistory(obj);
      }
      return true;
    }
    return false;
  }
  return (
    <CompositionHistoryContext.Provider
      value={{
        historyRef,
        setHistory: setHistoryExternal,
        onKey,
        onComposition,
        clearCurrentComposition
      }}
      {...props}
    />
  );
}

function useCompositionHistory() {
  return useContext(CompositionHistoryContext);
}

export { CompositionHistoryProvider, useCompositionHistory };

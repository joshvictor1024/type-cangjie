import { createContext, useContext, useEffect, useRef } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { getIsoDate, validateIsoDate } from "../util/isoDate";

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
const MAX_KEY_TIME = 1500;
function validateCharacterHistory(obj) {
  try {
    let flag = false;

    const c = obj[CODE_PROPERTY];
    flag |= typeof c !== "string";
    flag |= c.length === 0 || c.length > 5;
    if (flag) {
      console.log("invalid code");
      return false;
    }

    const k = obj[KEYS_PROPERTY];
    flag |= !Array.isArray(k);
    k.forEach((v) => {
      const [key, time] = v;
      flag |= typeof key !== "string";
      if (key.length > 1) {
        flag |= key !== "Space" && key !== "Backspace";
      }
      flag |= key.length === 0;
      flag |= typeof time !== "number";
      flag |= time > MAX_KEY_TIME;
      if (time > MAX_KEY_TIME) console.log(time);
    });
    if (flag) {
      console.log("invalid keys");
      return false;
    }

    const e = obj[HAS_ERROR_PROPERTY];
    flag |= typeof e !== "boolean";
    if (flag) {
      console.log("invalid has error");
      return false;
    }

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
function validateCharacterHistories(obj) {
  try {
    let flag = false;
    obj.forEach((v) => (flag |= !validateCharacterHistory(v)));
    return !flag;
  } catch (e) {
    console.error(e);
    return false;
  }
}
function validateCharactersHistories(obj) {
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

    Object.values(obj).forEach((v) => (flag |= !validateCharacterHistories(v)));
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

    Object.values(obj).forEach((v) => (flag |= !validateCharactersHistories(v)));
    if (flag) return false;

    return true;
  } catch (e) {
    return false;
  }
}

const CharacterHistoryContext = createContext({
  history: {},
  setHistory: () => false,
  onKey: () => {},
  onComposition: () => {},
  clearCurrentComposition: () => {}
});

function CharacterHistoryProvider(props) {
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
      if (
        currentCharacterHistoryRef.current[KEYS_PROPERTY].find(([key, time]) => time > MAX_KEY_TIME)
      ) {
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
    <CharacterHistoryContext.Provider
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

function useCharacterHistory() {
  return useContext(CharacterHistoryContext);
}

export { CharacterHistoryProvider, useCharacterHistory };

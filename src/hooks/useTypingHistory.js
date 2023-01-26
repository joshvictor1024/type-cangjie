import { useEffect, useRef } from "react";
import useLocalStorage from "./useLocalStorage";
import { getIsoDate, validateIsoDate } from "../util/isoDate";
import * as typingHistory from "../lib/typing/history";

/** @typedef {import('../lib/typing/ime.js').Ime} Ime */
/** @typedef {import('../lib/typing/history.js').HistoryEntry} HistoryEntry */

/**
 * `HistoryEntry` composing the character.
 * @typedef {HistoryEntry[]} CharacterHistory
 */

/**
 * `CharacterHistory` added in that date. Indexed by character.
 * @typedef {Object.<string, CharacterHistory>} DateHistory
 */

/**
 * Collection of `DateHistory`. Indexed by ISO date.
 *  @typedef {Object.<string, DateHistory>} AllHistory
 */

const MAX_HISTORY_PER_CHARACTER_PER_DAY = 10;
const MAX_KEY_TIME = 1500;

/**
 * @param {CharacterHistory} characterHistory
 */
function validateCharacterHistory(characterHistory) {
  try {
    let flag = false;
    characterHistory.forEach((v) => (flag |= typingHistory.validate(v, MAX_KEY_TIME) !== null));
    return !flag;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * @param {DateHistory} dateHistory
 */
function validateDateHistory(dateHistory) {
  try {
    let flag = false;

    Object.keys(dateHistory).forEach((v) => {
      flag |= typeof v !== "string";
      flag |= v.length !== 1;
    });
    if (flag) {
      console.log("invalid character");
      return false;
    }

    Object.values(dateHistory).forEach((v) => (flag |= !validateCharacterHistory(v)));
    if (flag) return false;

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * @param {AllHistory} allHistory
 */
function validateAllHistory(allHistory) {
  try {
    let flag = false;

    Object.keys(allHistory).forEach((v) => (flag |= !validateIsoDate(v)));
    if (flag) return false;

    Object.values(allHistory).forEach((v) => (flag |= !validateDateHistory(v)));
    if (flag) return false;

    return true;
  } catch (e) {
    return false;
  }
}

export default function useTypingHistory() {
  const { isAvailable, get: getHistory, set: setHistory } = useLocalStorage("history");
  const historyRef = useRef({});
  const currentHistoryEntryRef = useRef(typingHistory.createHistoryEntry());
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
   * @param {string} key [a-z|"Backspace"|"Space"]
   */
  function onKey(key) {
    const now = Date.now();
    const dt = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;
    currentHistoryEntryRef.current = typingHistory.addKey(currentHistoryEntryRef.current, key, dt);
  }

  /**
   * @param {Ime} ime
   * @param {string} targetCharacter
   */
  function onComposition(ime, targetCharacter) {
    if (ime.hasComposerFailure === false) {
      if (typingHistory.hasIdle(currentHistoryEntryRef.current, MAX_KEY_TIME)) {
        console.log("idle");
        currentHistoryEntryRef.current = typingHistory.createHistoryEntry();
        return;
      }
      currentHistoryEntryRef.current = typingHistory.setCode(currentHistoryEntryRef.current, ime.lastSubmission[1]);

      const isoDate = getIsoDate();
      if (!historyRef.current[isoDate]) {
        historyRef.current[isoDate] = {};
      }
      const todayHistory = historyRef.current[isoDate];
      if (!todayHistory[targetCharacter]) {
        todayHistory[targetCharacter] = [];
      }
      const characterHistories = todayHistory[targetCharacter];
      characterHistories.push(currentHistoryEntryRef.current);
      if (characterHistories.length > MAX_HISTORY_PER_CHARACTER_PER_DAY) {
        characterHistories.shift();
      }
      currentHistoryEntryRef.current = typingHistory.createHistoryEntry();

      if (isAvailable()) {
        setHistory(historyRef.current);
      }
    } else {
      currentHistoryEntryRef.current = typingHistory.setHasError(currentHistoryEntryRef.current);
    }
  }

  // function onClearComposerKeys() {
  //   currentCHRef.current = ch.createHistoryEntry();
  // }

  /**
   * @param {AllHistory} allHistory
   */
  function setHistoryExternal(allHistory) {
    const isValid = validateAllHistory(allHistory);
    console.log(allHistory, isValid);
    if (isValid) {
      historyRef.current = allHistory;
      if (isAvailable()) {
        setHistory(allHistory);
      }
      return true;
    }
    return false;
  }
  return {
    historyRef,
    setHistory: setHistoryExternal,
    onKey,
    onComposition
    // onClearComposerKeys
  };
}

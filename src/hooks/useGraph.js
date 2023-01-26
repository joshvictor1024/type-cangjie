import { useRef } from "react";
import * as typingHistory from "../lib/typing/history";
import * as stats from "../lib/typing/stats.js";

/** @typedef {import('../lib/typing/ime.js').Ime} Ime */

const KEY_IDLE_TIME_THRESHOLD = 1500; // ms

export default function useGraph() {
  const currentCHRef = useRef(typingHistory.createHistoryEntry());
  const recentCHRef = useRef([]);
  const lastKeyTimeRef = useRef(Date.now());

  /**
   *
   * @param {string} key [a-z|"Backspace"|"Space"]
   */
  function onKey(key) {
    const now = Date.now();
    const dt = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;
    currentCHRef.current = typingHistory.addKey(currentCHRef.current, key, dt);
  }

  /**
   * @param {Ime} ime
   */
  function onComposition(ime, _) {
    if (ime.hasComposerFailure === false) {
      if (typingHistory.hasIdle(currentCHRef.current, KEY_IDLE_TIME_THRESHOLD)) {
        console.log("idle");
        currentCHRef.current = typingHistory.createHistoryEntry();
        return;
      }
      currentCHRef.current = typingHistory.setCode(currentCHRef.current, ime.lastSubmission[1]);
      currentCHRef.current.compositionTimestamp = Date.now();

      recentCHRef.current.push(currentCHRef.current);
      currentCHRef.current = typingHistory.createHistoryEntry();
    } else {
      currentCHRef.current = typingHistory.setHasError(currentCHRef.current);
    }
  }

  /**
   * Deletes stats `maxAge` milliseconds older than `Date.now()` and accumulate the rest.
   * @param {number} maxAge
   * @returns 
   */
  function getRecentStats(maxAge) {
    recentCHRef.current = recentCHRef.current.filter((v) => Date.now() - v.compositionTimestamp < maxAge);
    if (recentCHRef.current.length === 0) {
      return stats.createStats();
    }
    return stats.accumulateStats(recentCHRef.current.map((v) => stats.getStats(v)));
  }

  // function onClearComposerKeys() {
  //   currentCHRef.current = ch.createHistoryEntry();
  // }
  return {
    onKey,
    onComposition,
    // onClearComposerKeys
    getRecentStats
  };
}

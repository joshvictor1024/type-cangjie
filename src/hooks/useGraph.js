import { useRef } from "react";
import * as ch from "../lib/typing/compositionHistory";
import * as stats from "../lib/typing/stats.js";

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

const RECENT_CH_MAX_PERIOD = 60000; // ms

export default function useGraph() {
  const currentCHRef = useRef(ch.createCompositionHistory());
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
    currentCHRef.current = ch.addKey(currentCHRef.current, key, dt);
  }

  /**
   * @param {Ime} ime
   */
  function onComposition(ime, _) {
    if (ime.hasComposerFailure === false) {
      currentCHRef.current = ch.setCode(currentCHRef.current, ime.lastSubmission[1]);
      currentCHRef.current.compositionTimestamp = Date.now();

      recentCHRef.current.push(currentCHRef.current);
      currentCHRef.current = ch.createCompositionHistory();
    } else {
      currentCHRef.current = ch.setHasError(currentCHRef.current);
    }
  }

  function getRecentStats() {
    recentCHRef.current = recentCHRef.current.filter((v) => Date.now() - v.compositionTimestamp < RECENT_CH_MAX_PERIOD);
    return stats.accumulateStats(recentCHRef.current.map((v) => stats.getStats(v)));
  }

  // function onClearComposerKeys() {
  //   currentCHRef.current = ch.createCompositionHistory();
  // }
  return {
    onKey,
    onComposition,
    // onClearComposerKeys
    getRecentStats
  };
}

/**
 * Functions in this module that return type `CompositionHistory` does not return a new object.
 * Beware when you use the `CompositionHistory` object with `useState()`.
 * @module typing
 */

import { isKey } from "./key.js";

/**
 * Records the composition process of a character.
 * Property names are shortened to save space when storing as JSON.
 * @typedef {Object} CompositionHistory
 * @property {string} c the code used to compose the character
 * @property {[string, number][]} k the key typed and milliseconds elapsed since last key, in the order of typing
 * @property {boolean} e whether any composition error happened
 */

/**
 * Create a default-valued CompositionHistory
 * @returns {CompositionHistory}
 */
export function createCompositionHistory() {
  return {
    c: "",
    k: [],
    e: false
  };
}

/**
 * Append `key` to the `composerKeys`. Has no effect if already full.
 * @param {CompositionHistory} ch
 * @param {number} maxKeyTime if non-zero, key time longer than this emits an error
 * @returns {string|null} returns `null` on validation success
 */
export function validate(ch, maxKeyTime) {
  const errorInvalidC = "invalid c";
  const errorInvalidK = "invalid k";
  const errorInvalidE = "invalid e";
  // TODO: ch.c ch.k mismatch

  if (typeof ch.c !== "string" || ch.c.length > 5) {
    return errorInvalidC;
  }

  if (Array.isArray(ch.k) === false) {
    return errorInvalidK;
  }
  for (let i = 0; i < ch.k.length; i++) {
    const [key, time] = ch.k[i];
    if (typeof key !== "string" || isKey(key) === false) {
      return errorInvalidK;
    }
    if (typeof time !== "number" || (maxKeyTime > 0 && time > maxKeyTime)) {
      console.log(time);
      return errorInvalidK;
    }
  }

  if (typeof ch.e !== "boolean") {
    return errorInvalidE;
  }

  return null;
}

/**
 * Append `key` to the `composerKeys`. Has no effect if already full.
 * @param {CompositionHistory} ch
 * @param {string} key
 * @param {number} sinceLastKey in milliseconds
 * @returns {CompositionHistory|null} returns `null` on error
 */
export function addKey(ch, key, sinceLastKey) {
  if (isKey(key) === false) {
    console.error(`invalid key for addKey ${key}`);
    return null;
  }
  ch.k.push([key, sinceLastKey]);
  return ch;
}

/**
 * Check `k` to see if any key took longer than `idleThreshold`
 * @param {CompositionHistory} ch
 * @param {number} idleThreshold in milliseconds
 * @returns {bool}
 */
export function hasIdle(ch, idleThreshold) {
  return ch.k.find((item) => item[1] > idleThreshold);
}

/**
 * Set `c` to `code`.
 * @param {CompositionHistory} ch
 * @param {string} code
 * @returns {CompositionHistory}
 */
export function setCode(ch, code) {
  ch.c = code;
  return ch;
}

/**
 * Set `k` to `true`.
 * @param {CompositionHistory} ch
 * @returns {CompositionHistory}
 */
export function setHasError(ch) {
  ch.e = true;
  return ch;
}

/**
 * Information extracted from a `CompositionHistory` object.
 * @typedef {Object} CompositionHistoryStats
 * @property {boolean} compositionError whether any composition error happened
 * @property {number} totalTime time used for all key presses
 * @property {number} effectiveTime time used for effective key presses
 * @property {Object.<string, number[]>} keysTimes time used to type each key
 */

/**
 * Extract information from `ch`.
 * @param {CompositionHistory} ch
 * @returns {CompositionHistoryStats}
 */
export function getStats(ch) {
  // Make copies so as not to modify `ch`.
  const codeArray = Array.from(ch.c);
  const keys = [...ch.k];

  const stats = {
    compositionError: ch.e,
    totalTime: 0,
    effectiveTime: 0,
    keysTimes: {}
  };

  // Process from the end of `keys`.
  while (keys.length) {
    const [key, time] = keys.pop();

    // Always accumulate total time.
    stats.totalTime += time;

    // Calculate effective time by comparing with `codeArray`.
    if (key === "Backspace") {
      continue;
    } else if (key === "Space") {
      // Only count the last "Space", which contributes to the successful composition, as effective.
      if (stats.keysTimes["Space"] == null) {
        stats.keysTimes["Space"] = [time];
        stats.effectiveTime += time;
      }
    } else {
      // Only count `key` as effective if it contributes to the successful composition.
      if (codeArray.length === 0) {
        continue;
      } else if (key === codeArray[codeArray.length - 1]) {
        codeArray.pop();
        if (stats.keysTimes[key] == null) {
          stats.keysTimes[key] = [];
        }
        stats.keysTimes[key].push(time);
        stats.effectiveTime += time;
      }
    }
  }

  return stats;
}

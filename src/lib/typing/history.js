/**
 * Functions in this module that return type `HistoryEntry` does not return a new object.
 * Beware when you use the `HistoryEntry` object with `useState()`.
 * @module typing
 */

import { isKey } from "./key.js";

/**
 * Records a single composition process of a character.
 * Property names are shortened to save space when storing as JSON.
 * @typedef {Object} HistoryEntry
 * @property {string} c the code used to compose the character
 * @property {[string, number][]} k the key typed and milliseconds elapsed since last key, in the order of typing
 * @property {boolean} e whether any composition error happened
 */

/**
 * Creates a default-valued `HistoryEntry`.
 * @returns {HistoryEntry}
 */
export function createHistoryEntry() {
  return {
    c: "",
    k: [],
    e: false
  };
}

/**
 * Appends `key` to the `composerKeys`. Has no effect if already full.
 * @param {HistoryEntry} he
 * @param {number} maxKeyTime If non-zero, key time longer than this emits an error.
 * @returns {string|null} Returns `null` on validation success.
 */
export function validate(he, maxKeyTime) {
  const errorInvalidC = "invalid c";
  const errorInvalidK = "invalid k";
  const errorInvalidE = "invalid e";
  // TODO: h.c h.k mismatch

  if (typeof he.c !== "string" || he.c.length > 5) {
    return errorInvalidC;
  }

  if (Array.isArray(he.k) === false) {
    return errorInvalidK;
  }
  for (let i = 0; i < he.k.length; i++) {
    const [key, time] = he.k[i];
    if (typeof key !== "string" || isKey(key) === false) {
      return errorInvalidK;
    }
    if (typeof time !== "number" || (maxKeyTime > 0 && time > maxKeyTime)) {
      console.log(time);
      return errorInvalidK;
    }
  }

  if (typeof he.e !== "boolean") {
    return errorInvalidE;
  }

  return null;
}

/**
 * Appends `key` to the `composerKeys`. Has no effect if already full.
 * @param {HistoryEntry} he
 * @param {string} key
 * @param {number} sinceLastKey in milliseconds
 * @returns {HistoryEntry|null} Returns `null` on error.
 */
export function addKey(he, key, sinceLastKey) {
  if (isKey(key) === false) {
    console.error(`invalid key for addKey ${key}`);
    return null;
  }
  he.k.push([key, sinceLastKey]);
  return he;
}

/**
 * Checks `k` to see if any key took longer than `idleThreshold`.
 * @param {HistoryEntry} he
 * @param {number} idleThreshold in milliseconds
 * @returns {bool}
 */
export function hasIdle(he, idleThreshold) {
  return he.k.find((item) => item[1] > idleThreshold);
}

/**
 * Sets `c` to `code`.
 * @param {HistoryEntry} he
 * @param {string} code
 * @returns {HistoryEntry}
 */
export function setCode(he, code) {
  he.c = code;
  return he;
}

/**
 * Sets `e` to `true`.
 * @param {HistoryEntry} he
 * @returns {HistoryEntry}
 */
export function setHasError(he) {
  he.e = true;
  return he;
}

/**
 * @module typing
 */

import radical from "./radical.json";

/**
 * Maps radical keys to radicals.
 * @param {string[]} radicalKeys
 * @returns string
 */
export function radicalKeysToRadicals(radicalKeys) {
  return radicalKeys.map((radicalKey) => radical[radicalKey]).join("");
}

/**
 * Supported keys include `a-z`.
 * @param {string} key
 * @returns {boolean}
 */
export function isRadicalKey(key) {
  return Object.keys(radical).includes(key);
}

/**
 * Supported keys include `a-z`|`Backspace`|`Space`.
 * @param {string} key
 * @returns {boolean}
 */
export function isKey(key) {
  return isRadicalKey(key) || key === "Backspace" || key === "Space";
}

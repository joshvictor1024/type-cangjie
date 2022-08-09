/**
 * @module typing
 */

import radicalKeys from "./radicalKeys.json";

/**
 *
 * @param {string[]} keys
 * @returns string
 */
export function keysToRadicals(keys) {
  return keys.map((letter) => radicalKeys[letter]).join("");
}

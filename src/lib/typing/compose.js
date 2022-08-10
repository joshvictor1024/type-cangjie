/**
 * Functions in this module that return type `Ime` does not return a new object.
 * Beware when you use the `Ime` object with `useState()`.
 * @module typing
 */

import { isRadicalKey } from "./key.js";

/**
 * @typedef {Object} CangjieDicts Entries should be set to null if dictionary is not available.
 * @property {Object.<string, string[]>|null} dict3 dictionary for Cangjie version 3
 * @property {Object.<string, string[]>|null} dict5 dictionary for Cangjie version 5
 * @property {Object.<string, string[]>|null} dict5x subset of `dict5` that only includes collision codes using key "x"
 * @property {Object.<string, string[]>|null} dictMs dictionary for Microsoft Cangjie
 */

/**
 * `"3"`: version 3 |`"5"`: version 5 |`"5x"`: version 5 collision codes only |`"ms"`: Microsoft Cangjie
 * @typedef {string} CangjieVersion
 */

function isCangjieVersion(cangjieVersion) {
  switch (cangjieVersion) {
    case "3":
    case "5":
    case "5x":
    case "ms":
      return true;
    default:
      return false;
  }
}

const COMPOSER_MAX_LENGTH = 5;

/**
 * Append `key` to the `composerKeys`. Has no effect if already full.
 * @param {Ime} ime
 * @param {string} key
 * @returns {Ime|null} returns `null` on error
 */
export function addComposerKey(ime, key) {
  if (isRadicalKey(key) === false) {
    console.error(`invalid key for addComposerKey ${key}`);
    return null;
  }

  ime = clearSubmission(ime);
  if (ime.hasComposerFailure === true) {
    ime = clearComposerKeys(ime);
  }

  ime.composerKeys.push(key);
  ime.composerKeys = ime.composerKeys.slice(0, COMPOSER_MAX_LENGTH);
  return ime;
}

/**
 * Delete the last key from `composerKeys`. Has no effect if already empty.
 * @param {Ime} ime
 * @returns {Ime}
 */
export function deleteComposerKey(ime) {
  ime = clearSubmission(ime);
  ime.composerKeys = ime.composerKeys.slice(0, ime.composerKeys.length - 1);
  return ime;
}

/**
 * Clears `composerKeys`.
 * Also calls `clearSubmission` and clears `selectorCandidates`.
 * @param {Ime} ime
 * @returns {Ime}
 */
export function clearComposerKeys(ime) {
  ime = clearSubmission(ime);
  ime.composerKeys.length = 0;
  ime.hasComposerFailure = false;
  return ime;
}

/**
 * Attempt to compose `composerKeys` into a `character`.
 * May `submit`.
 * @param {Ime} ime
 * @param {string} character the character that you attempt to compose
 * @param {CangjieDicts|null} cangjieDicts if `null`, `attemptComposition` always fails
 * @param {CangjieVersion} cangjieVersion
 * @returns {Ime|null} returns `null` on error
 */
export function attemptComposition(ime, character, cangjieDicts, cangjieVersion) {
  if (isCangjieVersion(cangjieVersion) === false) {
    return null;
  }

  ime = clearSubmission(ime);
  if (ime.composerKeys.length === 0) {
    return ime;
  }
  if (ime.hasComposerFailure) {
    return ime;
  }

  const matchingCodes = reverseLookup(character, cangjieDicts, cangjieVersion);

  if (matchingCodes === null || matchingCodes.includes(ime.composerKeys.join("")) === false) {
    ime.hasComposerFailure = true;
    return ime;
  }
  ime = submit(ime, character);
  return ime;
}

/**
 * Indicate that a submission happened.
 * @param {Ime} ime
 * @param {string} character the character which is composed
 * @returns {Ime}
 */
function submit(ime, character) {
  ime = clearComposerKeys(ime);
  ime.lastSubmission = character;
  return ime;
}

/**
 * Indicate that a submission did not happen.
 * @param {Ime} ime
 * @returns {Ime}
 */
function clearSubmission(ime) {
  ime.lastSubmission = null;
  return ime;
}

/**
 * Looking up possible codes for a given character.
 * Do not use this function to check for invalid `cangjieVersion`.
 * @param {string} character the character whose code you want to look up
 * @param {CangjieDicts|null} cangjieDicts if `null`, `reverseLookup` always return `null`, as if no matches are found
 * @param {CangjieVersion} cangjieVersion
 * @returns {Array<string>|null} array of codes if match(es) exist; `null` if not
 */
export function reverseLookup(character, cangjieDicts, cangjieVersion) {
  const codes3 = cangjieDicts?.dict3[character] ?? [];
  const codes5 = cangjieDicts?.dict5[character] ?? [];
  const codes5x = cangjieDicts?.dict5x[character] ?? [];
  const codesMs = cangjieDicts?.dictMs[character] ?? [];

  const result = [];
  switch (cangjieVersion) {
    case "3":
      result.push(...codes3);
      break;
    case "5":
      result.push(...codes5);
      break;
    case "5x":
      result.push(...codes5x);
      break;
    case "ms":
      result.push(...codesMs);
      break;
    default:
      return null;
  }
  if (result.length === 0) {
    return null;
  }
  return result;
}

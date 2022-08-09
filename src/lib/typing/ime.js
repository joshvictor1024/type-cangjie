/**
 * @module typing
 */

/**
 * @typedef {Object} Ime
 * @property {bool} hasComposerFailure whether the composer is indicating a composition failure
 * @property {Array<string>} composerKeys keys used for character composition
 * @property {string|null} lastSubmission Holds a non-null value if and only if an action results in a submission
 */

/**
 * Create a default-valued Ime
 * @returns {Ime}
 */
export function createIme() {
  return {
    hasComposerFailure: false,
    composerKeys: [],
    lastSubmission: null
  };
}

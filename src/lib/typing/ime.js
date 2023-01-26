/**
 * @module typing
 */

/**
 * @typedef {Object} Ime
 * @property {bool} hasComposerFailure whether the composer is indicating a composition failure
 * @property {Array<string>} composerKeys keys used for character composition
 * @property {[string, string]|null} lastSubmission Holds [character, code] if and only if an action results in a submission.
 */

/**
 * Creates a default-valued `Ime`.
 * @returns {Ime}
 */
export function createIme() {
  return {
    hasComposerFailure: false,
    composerKeys: [],
    lastSubmission: null
  };
}

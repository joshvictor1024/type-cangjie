/**
 * Functions in this module that return type `CompositionHistory` does not return a new object.
 * Beware when you use the `CompositionHistory` object with `useState()`.
 * @module typing
 */

/**
 * One or more characters.
 * @typedef {string} Word
 */

/**
 * Generates words from wordbanks, and
 * manages the progress of the first word.
 * @typedef {Object} WordQueue
 * @property {Word[]} queue
 * @property {bool[]} firstWordCharactersCorrect
 * Whether the first N characters of the first word are composed correctly.
 * Length should not exceed first word.
 */

/**
 * Creates a default-valued `WordQueue`.
 * @returns {WordQueue}
 */
export function createWordQueue() {
  return { queue: [], firstWordCharactersCorrect: [] };
}

/**
 * @param {WordQueue} wq
 * @returns {string|null} Returns `null` on error.
 */
export function getCompositionTarget(wq) {
  if (wq.queue.length === 0) {
    return null;
  }
  const firstWord = wq.queue[0];
  if (firstWord.length === 0) {
    console.log(firstWord);
    return null;
  }
  if (wq.firstWordCharactersCorrect.length === 0) {
    return firstWord[0];
  }
  // If the last recorded character is correct, target is the next character.
  if (wq.firstWordCharactersCorrect[wq.firstWordCharactersCorrect.length - 1]) {
    // All characters are correct. There is no next character in this word.
    if (wq.firstWordCharactersCorrect.length >= wq.queue.length) {
      return null;
    }
    return firstWord[wq.firstWordCharactersCorrect.length];
  }
  // If the last recorded character is wrong, target is this character.
  return firstWord[wq.firstWordCharactersCorrect.length - 1];
}

/**
 * @param {WordQueue} wq
 * @returns {WordQueue}
 */
export function onCompositionSuccess(wq) {
  if (wq.firstWordCharactersCorrect[wq.firstWordCharactersCorrect.length - 1] === false) {
    wq.firstWordCharactersCorrect.pop();
  }
  wq.firstWordCharactersCorrect.push(true);
  if (isFirstWordFinished(wq)) {
    wq.queue.shift();
    wq.firstWordCharactersCorrect.length = 0;
  }
  return wq;
}

/**
 * @param {WordQueue} wq
 * @returns {WordQueue}
 */
export function onCompositionFailure(wq) {
  if (wq.firstWordCharactersCorrect[wq.firstWordCharactersCorrect.length - 1] !== false) {
    wq.firstWordCharactersCorrect.push(false);
  }
  return wq;
}

/**
 * @param {WordQueue} wq
 * @returns {bool}
 */
function isFirstWordFinished(wq) {
  return wq.queue[0].length === wq.firstWordCharactersCorrect.length;
}

/**
 * Pushes `words` to `wq.queue`.
 * @param {WordQueue} wq
 * @param {Word[]} words
 * @returns {WordQueue}
 */
export function pushWords(wq, words) {
  wq.queue.push(...words);
  return wq;
}

/**
 * Sets `wq.queue` to `words` and resets `wq.firstWordCharactersCorrect`.
 * @param {WordQueue} wq
 * @param {Word[]} words
 * @returns {WordQueue}
 */
export function setWords(wq, words) {
  wq.queue = words;
  wq.firstWordCharactersCorrect.length = 0;
  return wq;
}

/**
 * `wq.queue.length`
 * @param {WordQueue} wq
 * @returns {number}
 */
export function getLength(wq) {
  return wq.queue.length;
}

import { useState, useEffect } from "react";
import * as wq from "../lib/typing/wordQueue";

const WORD_QUEUE_MIN_WORDS = 10;
const WORD_QUEUE_MAX_WORDS = 15;

/**
 * @param {Section[]} sections
 * @returns {Wordbank[]}
 */
function toWordbanks(sections) {
  return sections.reduce((acc, section) => {
    acc.push(...section.wordbanks);
    return acc;
  }, []);
}

/**
 * @param {Object.<string, boolean>} wordbankActive
 * @returns {string[]}
 */
function getActiveWordbankList(wordbankActive) {
  return Object.keys(wordbankActive).filter((wordbankName) => wordbankActive[wordbankName]);
}

/**
 * @param {string[]} activeWordbankNames
 * @param {Wordbank[]} wordbanks
 * @returns {string|null} Return `null` if no wordbanks are active.
 */
function getActiveWords(activeWordbankNames, wordbanks) {
  const activeWordbanks = activeWordbankNames
    .map((wordbankName) => wordbanks.find((wb) => wb.name === wordbankName))
    .filter((wb) => wb && wb.words);
  if (activeWordbanks.length === 0) return null;
  return activeWordbanks.reduce((acc, cur) => {
    return acc.concat(cur.words);
  }, []);
}

/**
 * @param {number} count Draws this number of words, or until `words` runs out.
 * @param {string[]|null} words This array is modified within the function. Pass in a copy if necessary.
 * @returns {string[]|null} If `words` is `null` then this returns `null`.
 */
function drawRandom(count, words) {
  if (words === null) {
    return null;
  }
  const result = [];
  while (result.length < count && words.length > 0) {
    const r = Math.floor(Math.random() * words.length);
    result.push(words[r]);
  }
  return result;
}

/**
 * @param {Object} props
 * @param {Section[]} props.sections
 * @param {Object.<string, boolean>} props.wordbankActive
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setLookupCharacter
 */
export default function usePractice({ sections, wordbankActive, setLookupCharacter }) {
  const [wordQueue, setWordQueue] = useState(wq.createWordQueue());

  /**
   * @param {Ime} ime
   * @param {string} targetCharacter
   */
  function onComposition(ime, targetCharacter) {
    if (ime.hasComposerFailure === false) {
      const newWordQueue = wq.onCompositionSuccess(wordQueue);
      setWordQueue({ ...newWordQueue });
    } else {
      const newWordQueue = wq.onCompositionFailure(wordQueue);
      setWordQueue({ ...newWordQueue });
      setLookupCharacter(targetCharacter);
    }
  }

  // Make sure `wordQueue` is refilled when `activeWordbanks` changes.
  useEffect(() => {
    if (getActiveWordbankList(wordbankActive).length === 0) return;
    // TODO: add this back in
    // clearComposerKeys();
    setWordQueue((c) => {
      const words = drawRandom(
        WORD_QUEUE_MAX_WORDS,
        getActiveWords(getActiveWordbankList(wordbankActive), toWordbanks(sections))
      );
      if (words === null) return c;

      const newWordQueue = wq.setWords(c, words);
      return { ...newWordQueue };
    });
  }, [sections, wordbankActive]);

  // Make sure `wordQueue` is filled above length `WORD_QUEUE_MIN_WORDS`.
  useEffect(() => {
    if (getActiveWordbankList(wordbankActive).length === 0) return;
    setWordQueue((c) => {
      if (wq.getLength(c) < WORD_QUEUE_MIN_WORDS) {
        const words = drawRandom(
          WORD_QUEUE_MAX_WORDS - wq.getLength(c),
          getActiveWords(getActiveWordbankList(wordbankActive), toWordbanks(sections))
        );
        if (words === null) return c;
        const newWordQueue = wq.pushWords(wordQueue, words);
        return { ...newWordQueue };
      }
      return c;
    });
  }, [wordQueue, sections, wordbankActive]);

  return {
    wordQueue,
    currentWordProgress: wordQueue.firstWordCharactersCorrect,
    getCompositionTarget: () => wq.getCompositionTarget(wordQueue),
    onComposition
  };
}

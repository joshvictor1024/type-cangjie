import { useState, useEffect } from "react";
import { useActiveWordbanks } from "../contexts/useActiveWordbanks";
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
 * @param {Object.<string, boolean>} activeWordbanks
 * @returns {string[]}
 */
function getActiveWordbankList(activeWordbanks) {
  return Object.keys(activeWordbanks).filter((wordbankName) => activeWordbanks[wordbankName]);
}

/**
 * @param {string[]} activeWordbankNames
 * @param {Wordbank[]} wordbanks
 * @returns {string|null} return `null` if no wordbanks are active
 */
function getActiveWords(activeWordbankNames, wordbanks) {
  const activeWordbanks = activeWordbankNames
    .map((wordbankName) => wordbanks.find((wb) => wb.name === wordbankName))
    .filter((wb) => wb && wb.words);
  //console.log(awb);
  if (activeWordbanks.length === 0) return null;
  return activeWordbanks.reduce((acc, cur) => {
    return acc.concat(cur.words);
  }, []);
}

/**
 * @param {number} count draw this number of words, or until `words` run out
 * @param {string[]|null} words this array is modified within the function. pass in a copy if necessary.
 * @returns {string[]|null} if `words` is `null` then `null` is returned
 */
function drawRandom(count, words) {
  console.log("draw");
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
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setLookupCharacter
 */
export default function usePractice({ sections, setLookupCharacter }) {
  const { activeWordbanks } = useActiveWordbanks();
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

  // Make sure wordQueue is re-filled when `activeWordbanks` change.
  useEffect(() => {
    if (getActiveWordbankList(activeWordbanks).length === 0) return;
    // TODO: add this back in
    // clearComposerKeys();
    setWordQueue((c) => {
      const words = drawRandom(
        WORD_QUEUE_MAX_WORDS,
        getActiveWords(getActiveWordbankList(activeWordbanks), toWordbanks(sections))
      );
      if (words === null) return c;

      const newWordQueue = wq.setWords(c, words);
      return { ...newWordQueue };
    });
  }, [sections, activeWordbanks]);

  // Make sure wordQueue is filled above `WORD_QUEUE_MIN_WORDS`.
  useEffect(() => {
    if (getActiveWordbankList(activeWordbanks).length === 0) return;
    setWordQueue((c) => {
      if (wq.getLength(c) < WORD_QUEUE_MIN_WORDS) {
        const words = drawRandom(
          WORD_QUEUE_MAX_WORDS - wq.getLength(c),
          getActiveWords(getActiveWordbankList(activeWordbanks), toWordbanks(sections))
        );
        if (words === null) return c;
        const newWordQueue = wq.pushWords(wordQueue, words);
        return { ...newWordQueue };
      }
      return c;
    });
  }, [wordQueue, sections, activeWordbanks]);

  return {
    wordQueue,
    currentWordProgress: wordQueue.firstWordCharactersCorrect,
    getCompositionTarget: () => wq.getCompositionTarget(wordQueue),
    onComposition
  };
}

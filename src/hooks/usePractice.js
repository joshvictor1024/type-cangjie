import { useState, useEffect } from "react";
import { useWordbanks } from "../contexts/useWordbanks";
import { useActiveWordbanks } from "../contexts/useActiveWordbanks";
import * as wq from "../lib/typing/wordQueue";

const WORD_QUEUE_MIN_WORDS = 10;
const WORD_QUEUE_MAX_WORDS = 15;

function getActiveWordbankList(activeWordbanks) {
  return Object.keys(activeWordbanks).filter((wordbankName) => activeWordbanks[wordbankName]);
}

/**
 * @param {Object} props
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setLookupCharacter
 */
export default function usePractice({ setLookupCharacter }) {
  const { wordbanks } = useWordbanks();
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

  function drawRandom(count) {
    console.log("draw");
    const awbl = getActiveWordbankList(activeWordbanks);
    const awb = awbl
      .map((wordbankName) => wordbanks.find((wb) => wb.name === wordbankName))
      .filter((wb) => wb && wb.words);
    //console.log(awb);
    if (awb.length === 0) return null;

    const cumulativeLengths = [0]; // from [0]:0 to [aws.length]:sum
    for (let i = 0; i < awb.length; i++) {
      cumulativeLengths[i + 1] = cumulativeLengths[i] + awb[i].words.length;
    }

    const result = [];
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * cumulativeLengths[cumulativeLengths.length - 1]);
      for (let j = 0; j < awbl.length; j++) {
        if (r < cumulativeLengths[j + 1]) {
          result.push(awb[j].words[r - cumulativeLengths[j]]);
          break;
        }
      }
    }
    //console.log(result);
    return result;
  }
  useEffect(() => {
    if (getActiveWordbankList(activeWordbanks).length === 0) return;
    const words = drawRandom(WORD_QUEUE_MAX_WORDS);
    if (words === null) return;
    // TODO: add this back in
    // clearComposerKeys();
    const newWordQueue = wq.setWords(wordQueue, words);
    setWordQueue({ ...newWordQueue });
  }, [wordbanks, activeWordbanks]);
  useEffect(() => {
    if (getActiveWordbankList(activeWordbanks).length === 0) return;
    setWordQueue((c) => {
      if (wq.getLength(c) < WORD_QUEUE_MIN_WORDS) {
        const words = drawRandom(WORD_QUEUE_MAX_WORDS - wq.getLength(c));
        if (words === null) return c;
        const newWordQueue = wq.pushWords(wordQueue, words);
        return { ...newWordQueue };
      }
      return c;
    });
  }, [wordQueue]);

  return {
    wordQueue,
    currentWordProgress: wordQueue.firstWordCharactersCorrect,
    getCompositionTarget: () => wq.getCompositionTarget(wordQueue),
    onComposition
  };
}

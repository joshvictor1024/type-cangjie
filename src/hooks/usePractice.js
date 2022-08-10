import { useState, useEffect } from "react";
import { useWordbanks } from "../contexts/useWordbanks";
import { useActiveWordbanks } from "../contexts/useActiveWordbanks";

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
  const [wordQueue, setWordQueue] = useState([]);
  const [currentWordProgress, setCurrentWordProgress] = useState(null);
  function newCurrentWordProgress() {
    return {
      hasWrongCharacter: false,
      correctCharacterCount: 0
    };
  }

  /**
   * @return {string} character
   */
  function getCompositionTarget() {
    return wordQueue[0][currentWordProgress.correctCharacterCount];
  }

  /**
   * @param {Ime} ime
   * @param {string} targetCharacter
   */
  function onComposition(ime, targetCharacter) {
    if (ime.hasComposerFailure === false) {
      if (checkWordDone()) {
        setWordQueue(wordQueue.slice(1));
        setCurrentWordProgress(newCurrentWordProgress());
      } else {
        setCurrentWordProgress((c) => {
          return {
            hasWrongCharacter: false,
            correctCharacterCount: c.correctCharacterCount + 1
          };
        });
      }
    } else {
      setCurrentWordProgress((c) => {
        return {
          hasWrongCharacter: true,
          correctCharacterCount: c.correctCharacterCount
        };
      });
      setLookupCharacter(targetCharacter);
    }
  }

  function checkWordDone() {
    const w = wordQueue[0];
    return currentWordProgress.correctCharacterCount + 1 === w.length;
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
    setWordQueue(words);
    setCurrentWordProgress(newCurrentWordProgress());
  }, [wordbanks, activeWordbanks]);
  useEffect(() => {
    if (getActiveWordbankList(activeWordbanks).length === 0) return;
    setWordQueue((c) => {
      if (c.length < WORD_QUEUE_MIN_WORDS) {
        const words = drawRandom(WORD_QUEUE_MAX_WORDS - c.length);
        if (words === null) return c;
        //console.log(c, words);
        return [...c, ...words];
      }
      return c;
    });
  }, [wordQueue]);

  return { wordQueue, currentWordProgress, getCompositionTarget, onComposition };
}

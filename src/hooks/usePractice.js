import { useState, useEffect, useRef } from "react";
import useKeyboardEvent from "./useKeyboardEvent";
import useCharacterHistory from "./useCharacterHistory";

const WORD_QUEUE_MIN_WORDS = 10;
const WORD_QUEUE_MAX_WORDS = 15;

function getActiveWordbankList(activeWordbanks) {
  return Object.keys(activeWordbanks).filter((wordbankName) => activeWordbanks[wordbankName]);
}

export default function usePractice({ wordbanks, activeWordbanks, toCode, setLookupCharacter }) {
  const [wordQueue, setWordQueue] = useState([]);
  const [currentWordProgress, setCurrentWordProgress] = useState(null);
  function newCurrentWordProgress() {
    return {
      hasWrongCharacter: false,
      correctCharacterCount: 0
    };
  }
  const [codeInput, setCodeInput] = useState("");
  const shouldClearInputFirstRef = useRef(false);

  const { addKey, setError, setCode, beginCharacter, endCharacter } = useCharacterHistory();

  function onKeyDown(key, t) {
    addKey(key, t);
    if (key === "Backspace") {
      shouldClearInputFirstRef.current = false;
      setCodeInput((c) => c.slice(0, -1));
    } else if (key === "Space") {
      const characterCorrect = checkCharacterCorrect();
      if (characterCorrect === null) {
        return;
      }
      if (characterCorrect) {
        console.log("correct");
        setCode(codeInput);
        endCharacter();
        if (checkWordDone()) {
          if (wordQueue.length >= 2) {
            beginCharacter(wordQueue[1][0]);
          }
          setWordQueue(wordQueue.slice(1));
          setCurrentWordProgress(newCurrentWordProgress());
          setCodeInput("");
        } else {
          beginCharacter(wordQueue[0][currentWordProgress.correctCharacterCount + 1]);
          setCurrentWordProgress((c) => {
            return {
              hasWrongCharacter: false,
              correctCharacterCount: c.correctCharacterCount + 1
            };
          });
          setCodeInput("");
        }
      } else {
        console.log("wrong");
        setError();
        shouldClearInputFirstRef.current = true;
        setCurrentWordProgress((c) => {
          return {
            hasWrongCharacter: true,
            correctCharacterCount: c.correctCharacterCount
          };
        });
        setLookupCharacter(wordQueue[0][currentWordProgress.correctCharacterCount]);
      }
    } else {
      // letter keys
      if (shouldClearInputFirstRef.current) {
        shouldClearInputFirstRef.current = false;
        setCodeInput(key);
        return;
      }
      setCodeInput((c) => {
        if (c.length < 5) {
          return c + key;
        }
        return c;
      });
    }
  }

  function checkCharacterCorrect() {
    if (wordQueue.length === 0) return null;

    const ch = wordQueue[0][currentWordProgress.correctCharacterCount];
    const codes = toCode(ch);
    return codes.includes(codeInput);
  }
  function checkWordDone() {
    const w = wordQueue[0];
    return currentWordProgress.correctCharacterCount + 1 === w.length;
  }

  const { handleKeydown } = useKeyboardEvent(onKeyDown);

  function drawRandom(count) {
    console.log("draw");
    const awbl = getActiveWordbankList(activeWordbanks);
    const awb = awbl.map((wordbankName) => wordbanks[wordbankName]).filter((wb) => wb);
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
    beginCharacter(words[0]);
    //console.log(words);
    setWordQueue(words);
    setCurrentWordProgress(newCurrentWordProgress());
    setCodeInput("");
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

  return { handleKeydown, wordQueue, currentWordProgress, codeInput };
}

import { useState, useEffect, useRef } from "react";
import useCangjieCode from "./useCangjieCode";
import useKeyboardEvent from "./useKeyboardEvent";
import useCharacterHistory from "./useCharacterHistory";

const WORD_QUEUE_MIN_WORDS = 5;
const WORD_QUEUE_MAX_WORDS = 10;

export default function usePractice({ wordbanks, currentWordbankName }) {
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

  const { toCode } = useCangjieCode();
  const { addKey, setError, setCode, beginCharacter, endCharacter } = useCharacterHistory();

  function onKeyDown(key, t) {
    addKey(key, t);
    if (key === "Backspace") {
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
        setCodeInput("");
        if (checkWordDone()) {
          beginCharacter(wordQueue[1][0]);
          setWordQueue(wordQueue.slice(1));
          setCurrentWordProgress(newCurrentWordProgress());
        } else {
          beginCharacter(wordQueue[0][currentWordProgress.correctCharacterCount + 1]);
          setCurrentWordProgress((c) => {
            return {
              hasWrongCharacter: false,
              correctCharacterCount: c.correctCharacterCount + 1
            };
          });
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
    const cwb = wordbanks[currentWordbankName];
    if (!cwb) return null;
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(cwb.words[Math.floor(Math.random() * cwb.words.length)]);
    }
    return result;
  }
  useEffect(() => {
    if (!wordbanks[currentWordbankName]) return;
    if (wordQueue.length === 0) {
      const words = drawRandom(WORD_QUEUE_MAX_WORDS);
      beginCharacter(words[0]);
      setWordQueue(words);
      setCurrentWordProgress(newCurrentWordProgress());
    } else if (wordQueue.length < WORD_QUEUE_MIN_WORDS) {
      const words = drawRandom(WORD_QUEUE_MAX_WORDS - wordQueue.length);
      setWordQueue((c) => {
        return [...c, ...words];
      });
    }
  }, [wordQueue, wordbanks, currentWordbankName]);

  function refreshLivewords() {
    setWordQueue([]);
  }
  return { handleKeydown, wordQueue, currentWordProgress, refreshLivewords, codeInput };
}

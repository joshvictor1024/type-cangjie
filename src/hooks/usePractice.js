import { useState, useEffect, useRef } from "react";
import useCangjieCode from "./useCangjieCode";
import useKeyboardEvent from "./useKeyboardEvent";

export default function usePractice({ wordbanks, currentWordbankName }) {
  const [livewordQueue, setLivewordQueue] = useState([]);
  const [inputCode, setInputCode] = useState("");
  const isLastInputWrongRef = useRef(false);

  const { toCode } = useCangjieCode();

  function onKeyDown(key, t) {
    if (key === "Backspace") {
      setInputCode((c) => c.slice(0, -1));
    } else if (key === "Space") {
      checkCharacter();
    } else {
      if (isLastInputWrongRef.current) {
        isLastInputWrongRef.current = false;
        setInputCode(key);
        return;
      }
      setInputCode((c) => {
        if (c.length < 5) {
          return c + key;
        }
        return c;
      });
    }
  }
  function checkCharacter() {
    if (livewordQueue.length === 0) return;
    const lw = livewordQueue[0];
    const ch = lw.characters[lw.correctCharacterCount];
    const codes = toCode(ch);

    const nextLivewordQueue = [...livewordQueue];
    if (codes.includes(inputCode)) {
      console.log("correct");
      nextLivewordQueue[0].hasWrongCharacter = false;
      nextLivewordQueue[0].correctCharacterCount++;
      setLivewordQueue(nextLivewordQueue);
      checkLiveword(nextLivewordQueue);
    } else {
      console.log("wrong");
      isLastInputWrongRef.current = true;
      nextLivewordQueue[0].hasWrongCharacter = true;
      setLivewordQueue(nextLivewordQueue);
    }
  }
  function checkLiveword(nextLivewordQueue) {
    const lw = nextLivewordQueue[0];
    if (lw.correctCharacterCount === lw.characters.length && lw.hasWrongCharacter === false) {
      setLivewordQueue(nextLivewordQueue.slice(1));
      setInputCode("");
    }
  }
  const { handleKeydown } = useKeyboardEvent(onKeyDown);

  useEffect(() => {
    const cwb = wordbanks[currentWordbankName];
    if (livewordQueue.length < 5 && cwb) {
      const livewords = [];
      for (let i = 0; i < 5; i++) {
        livewords.push({
          characters: cwb.words[Math.floor(Math.random() * cwb.words.length)],
          correctCharacterCount: 0,
          hasWrongCharacter: false
        });
      }
      setLivewordQueue((c) => [...c, ...livewords]);
    }
  }, [livewordQueue, wordbanks, currentWordbankName]);

  function refreshLivewords() {
    setLivewordQueue([]);
  }
  return { handleKeydown, livewordQueue, refreshLivewords, inputCode };
}

import { useState } from "react";
import { useCangjie } from "../contexts/useCangjieDicts";
import { useCompositionHistory } from "../contexts/useCharacterHistory";
import { createIme } from "../lib/typing/ime";
import * as compose from "../lib/typing/compose";

/**
 *
 * @param {Function} getCompositionTarget Return character as a string. Return `null` if no target exists
 * @param {Function} onComposition (success, character)
 */
export default function useIme({ getCompositionTarget, onComposition }) {
  const [ime, setIme] = useState(createIme());
  const {
    onKey: chOnKey,
    onComposition: chOnComposition,
    clearCurrentComposition: statsClearCurrent
  } = useCompositionHistory();

  const { dicts } = useCangjie();
  /**
   *
   * @param {string} key [a-z|"Backspace"|"Space"]
   */
  function enterKey(key) {
    chOnKey(key);
    if (key === "Backspace") {
      const newIme = compose.deleteComposerKey(ime);
      setIme({ ...newIme });
    } else if (key === "Space") {
      if (dicts === null) {
        console.log("dicts is not ready, aborting composition");
        return;
      }

      const char = getCompositionTarget();
      const newIme = compose.attemptComposition(ime, char, dicts, "ms");
      if (newIme !== null) {
        if (newIme.hasComposerFailure) {
          console.log("composer failure");
          onComposition(false, char);
          chOnComposition(false, null, char);
        } else {
          console.log("composer success");
          onComposition(true, char);
          chOnComposition(true, newIme.lastSubmission[1], char);
        }
        setIme({ ...newIme });
      }
    } else {
      const newIme = compose.addComposerKey(ime, key);
      if (newIme !== null) {
        setIme({ ...newIme });
      }
    }
  }

  function clearBuffer() {
    const newIme = compose.clearComposerKeys(ime);
    setIme({ ...newIme });
    statsClearCurrent();
  }

  return { ime, enterKey, clearBuffer };
}

import { useState } from "react";
import { useCangjie } from "../contexts/useCangjieDicts";
import { useCharacterHistory } from "../contexts/useCharacterHistory";
import { createIme } from "../lib/typing/ime";
import * as compose from "../lib/typing/compose";

/**
 *
 * @param {Function} getCompositionTarget Return character as a string. Return `null` if no target exists
 * @param {Function} onComposition (success, code, character)
 */
export default function useIme({ getCompositionTarget, onComposition }) {
  const [ime, setIme] = useState(createIme());
  const {
    onKey: statsOnKey,
    onComposition: statsOnComposition,
    clearCurrentComposition: statsClearCurrent
  } = useCharacterHistory();

  const { dicts } = useCangjie();
  /**
   *
   * @param {string} key [a-z|"Backspace"|"Space"]
   */
  function enterKey(key) {
    statsOnKey(key);
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
        setIme({ ...newIme });
      }
      if (newIme.hasComposerFailure) {
        console.log("composer failure");
        onComposition(false, ime.composerKeys, char);
        statsOnComposition(false, ime.composerKeys, char);
      } else {
        console.log("composer success");
        onComposition(true, ime.composerKeys, char);
        statsOnComposition(true, ime.composerKeys, char);
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

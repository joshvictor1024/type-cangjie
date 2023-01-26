import { useState } from "react";
import { createIme } from "../lib/typing/ime";
import * as compose from "../lib/typing/compose";

/** @typedef {import('../lib/typing/ime.js').Ime} Ime */

/**
 *
 * @param {Object} props
 * @param {() => string|null} props.getCompositionTarget Returns `null` if no target exists.
 * @param {((ime: Ime, targetCharacter: string) => {})[]} props.onComposition Runs after a `attemptComposition` run without error.
 */
export default function useIme({ dicts, getCompositionTarget, onComposition }) {
  const [ime, setIme] = useState(createIme());

  /**
   *
   * @param {string} key [a-z|"Backspace"|"Space"]
   */
  function enterKey(key) {
    if (key === "Backspace") {
      const newIme = compose.deleteComposerKey(ime);
      setIme({ ...newIme });
    } else if (key === "Space") {
      if (dicts === null) {
        console.log("dicts is not ready, aborting composition");
        return;
      }

      const targetCharacter = getCompositionTarget();
      if (targetCharacter === null) {
        console.log("getCompositionTarget is not ready, aborting composition");
        return;
      }

      const newIme = compose.attemptComposition(ime, targetCharacter, dicts, "ms");
      if (newIme !== null) {
        onComposition.forEach((v) => v(newIme, targetCharacter));
        setIme({ ...newIme });
      }
    } else {
      const newIme = compose.addComposerKey(ime, key);
      if (newIme !== null) {
        setIme({ ...newIme });
      }
    }
  }

  // TODO: add this back in
  // function clearComposerKeys() {
  //   const newIme = compose.clearComposerKeys(ime);
  //   setIme({ ...newIme });
  //   statsClearCurrent();
  // }

  return { ime, enterKey /*, clearComposerKeys*/ };
}

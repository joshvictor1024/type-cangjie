import { useState } from "react";
import { useCangjie } from "../contexts/useCangjieDicts";
import { createIme } from "../lib/typing/ime";
import * as compose from "../lib/typing/compose";

/**
 *
 * @param {Object} props
 * @param {() => string|null} props.getCompositionTarget return `null` if no target exists
 * @param {((ime: Ime, targetCharacter: string) => {})[]} props.onComposition runs after a `attemptComposition` run without error
 */
export default function useIme({ getCompositionTarget, onComposition }) {
  const [ime, setIme] = useState(createIme());

  const { dicts } = useCangjie();
  /**
   *
   * @param {string} key [a-z|"Backspace"|"Space"]
   */
  function enterKey(key) {
    // chOnKey(key);
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
        console.log(
          "useIme attemptComposition" + (newIme.hasComposerFailure ? "failure" : "success")
        );
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

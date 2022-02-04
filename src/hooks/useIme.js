import { useState, useRef } from "react";
import useCharacterHistory from "./useCharacterHistory";
import { useCangjie } from "../contexts/useCangjie";

/**
 *
 * @param {Function} getCompositionTarget Return character as a string. Return `null` if no target exists
 * @param {Function} onComposition (success, code, character)
 */
export default function useIme({ getCompositionTarget, onComposition }) {
  const [buffer, setBuffer] = useState("");
  const shouldClearDueToErrorRef = useRef(false);
  const {
    onKey: statsOnKey,
    onComposition: statsOnComposition,
    clearCurrentComposition: statsClearCurrent
  } = useCharacterHistory();
  const { toCode } = useCangjie();
  /**
   *
   * @param {string} code KeyboardEvent.code
   */
  function enterCode(code) {
    // TODO: confirm this
    // cangjie radicals correspond to key positions, not letters,
    // thus KeyboardEvent.code rather than KeyboardEvent.key
    if (code.slice(0, 3) === "Key") {
      // Letter keys all start with "Key"
      // and end with an uppercase letter
      // e.g. "KeyA"
      const lowerCase = code.slice(3).toLowerCase();
      onKey(lowerCase);
    } else if (code === "Backspace") {
      onKey("Backspace");
    } else if (code === "Space") {
      onKey("Space");
    }
  }
  /**
   *
   * @param {string} key [a-z|"Backspace"|"Space"]
   */
  function onKey(key) {
    statsOnKey(key);
    if (key === "Backspace") {
      shouldClearDueToErrorRef.current = false;
      setBuffer((c) => c.slice(0, -1));
    } else if (key === "Space") {
      const char = getCompositionTarget();
      if (char === null) {
        return;
      }
      const composeSuccess = toCode(char).includes(buffer);
      if (composeSuccess) {
        console.log("compose success");
        onComposition(true, buffer, char);
        statsOnComposition(true, buffer, char);
        clearBuffer();
      } else {
        console.log("compose failure");
        onComposition(false, buffer, char);
        statsOnComposition(false, buffer, char);
        shouldClearDueToErrorRef.current = true;
      }
    } else {
      // letter keys
      if (shouldClearDueToErrorRef.current) {
        shouldClearDueToErrorRef.current = false;
        setBuffer(key);
      } else {
        setBuffer((c) => (c + key).slice(0, 5));
      }
    }
  }

  function clearBuffer() {
    setBuffer("");
    statsClearCurrent();
  }

  return { buffer, enterCode, clearBuffer };
}

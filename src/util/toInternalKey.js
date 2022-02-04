/**
 * Convert KeyboardEvent.code to internal key
 * 
 * TODO: confirm this
 * 
 * cangjie radicals correspond to key positions, not letters.
 * Thus, use KeyboardEvent.code rather than KeyboardEvent.key
 * @param {string} code KeyboardEvent.code
 * @returns {string} Internal key
 */
export function toKey(code) {
  if (code.slice(0, 3) === "Key") {
    // Letter keys all start with "Key"
    // and end with an uppercase letter
    // e.g. "KeyA"
    return code.slice(3).toLowerCase();
  } else if (code === "Backspace") {
    return "Backspace";
  } else if (code === "Space") {
    return "Space";
  }
  return null;
}

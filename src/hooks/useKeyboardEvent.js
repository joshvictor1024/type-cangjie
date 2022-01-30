import { useRef } from "react";

// onKeydown(key: [a-z|"Backspace"|"Space"], t)
export default function useKeyboardEvent(onKeydown) {
  const lastEventTime = useRef(Date.now());
  function getSinceLastEvent() {
    const now = Date.now();
    const t = now - lastEventTime.current;
    lastEventTime.current = now;
    return t;
  }
  function handleKeydown(e) {
    // TODO: confirm this
    // cangjie radicals correspond to key positions, not letters,
    // thus KeyboardEvent.code rather than KeyboardEvent.key
    if (e.code.slice(0, 3) === "Key") {
      // Letter keys all start with "Key"
      // and end with an uppercase letter
      // e.g. "KeyA"
      const lowerCase = e.code.slice(3).toLowerCase();
      onKeydown(lowerCase, getSinceLastEvent());
    } else if (e.code === "Backspace") {
      onKeydown("Backspace", getSinceLastEvent());
    } else if (e.code === "Space") {
      onKeydown("Space", getSinceLastEvent());
    }
  }
  return { handleKeydown };
}

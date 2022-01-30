import React from "react";
import "./Typing.css";

export default function Liveword({ liveword, input }) {
  function getClass(i) {
    if (i < liveword.correctCharacterCount) return "correct";
    if (i === liveword.correctCharacterCount && liveword.hasWrongCharacter) return "wrong";
    return "ready";
  }
  return (
    <div style={{ position: "relative" }}>
      {input ? input : null}
      {Array.from(liveword.characters).map((character, i) => (
        <span key={i} className={getClass(i)}>
          {character}
        </span>
      ))}
    </div>
  );
}

import React from "react";
import "./Typing.css";

export default function Word({ word, progress }) {
  function getClass(i) {
    if (progress == null) return "Word--ready";
    if (i < progress.correctCharacterCount) return "Word--correct";
    if (i === progress.correctCharacterCount && progress.hasWrongCharacter) return "Word--wrong";
    return "Word--ready";
  }
  return (
    <div className="Word">
      {Array.from(word).map((character, i) => (
        <span key={i} className={getClass(i)}>
          {character}
        </span>
      ))}
    </div>
  );
}

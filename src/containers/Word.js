import React from "react";
import "./Typing.css";

export default function Word({ word, progress, setLookupCharacter }) {
  function getClassBehavioral(i) {
    if (progress == null) return " Character--ready";
    if (i < progress.correctCharacterCount) return " Character--correct";
    if (i === progress.correctCharacterCount && progress.hasWrongCharacter)
      return " Character--wrong";
    return " Character--ready";
  }
  return (
    <div className="Word">
      {Array.from(word).map((character, i) => (
        <span
          key={i}
          className={"Character" + getClassBehavioral(i)}
          onClick={() => setLookupCharacter(character)}
          title="點擊查詢查頡編碼"
        >
          {character}
        </span>
      ))}
    </div>
  );
}

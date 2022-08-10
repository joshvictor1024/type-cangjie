import React from "react";
import "./Typing.css";

export default function Word({ word, progress, setLookupCharacter }) {
  function getClassBehavioral(i) {
    if (i >= progress.length) return " Character--ready";
    return progress[i] ? " Character--correct" : " Character--wrong";
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

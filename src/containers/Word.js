import React from "react";
import "./Typing.css";
import Input from "./Input";

export default function Word({ word, progress, code }) {
  function getClass(i) {
    if (progress == null) return "ready";
    if (i < progress.correctCharacterCount) return "correct";
    if (i === progress.correctCharacterCount && progress.hasWrongCharacter) return "wrong";
    return "ready";
  }
  return (
    <div style={{ position: "relative" }}>
      {code == null ? null : <Input code={code} />}
      {Array.from(word).map((character, i) => (
        <span key={i} className={getClass(i)}>
          {character}
        </span>
      ))}
    </div>
  );
}

import React from "react";
import "./Typing.css";
import Word from "./Word";

export default function Typing({ wordQueue, currentWordProgress, codeInput }) {
  return (
    <div>
      Typing
      <div className="WordQueue">
        {wordQueue.map((word, i) => (
          <Word
            key={i}
            word={word}
            progress={i === 0 ? currentWordProgress : null}
            code={i === 0 ? codeInput : null}
          />
        ))}
      </div>
    </div>
  );
}

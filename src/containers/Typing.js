import React from "react";
import "./Typing.css";
import Word from "./Word";
import Composer from "./Composer";

export default function Typing({
  wordQueue,
  currentWordProgress,
  composerKeys,
  handleKeyDown,
  handleKeyUp,
  setLookupCharacter
}) {
  return (
    <div
      className="Typing"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      title="點擊開始打字練習..."
    >
      <div className="WordQueue">
        {wordQueue.queue.length > 0
          ? wordQueue.queue.map((word, i) => (
              <Word
                key={i}
                word={word}
                progress={i === 0 ? currentWordProgress : []}
                setLookupCharacter={setLookupCharacter}
              />
            ))
          : "選擇任一字庫以繼續..."}
      </div>
      <Composer radicalKeys={composerKeys} />
    </div>
  );
}

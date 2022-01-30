import React, { useState } from "react";
import "./Typing.css";
import Liveword from "./Liveword";
import Input from "./Input";

export default function Typing({ livewordQueue, inputCode }) {
  //const [currentLiveword, setCurrentLiveword] = useState(null);
  //const [currentLiveword, setCurrentLiveword] = useState(0);
  function attachInput(i) {
    if (i === 0) {
      return <Input code={inputCode} />;
    }
    return null;
  }
  return (
    <div>
      Typing
      <div className="LivewordQueue">
        {livewordQueue.map((liveword, i) => (
          <Liveword key={i} id={i} liveword={liveword} input={attachInput(i)} />
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import "./App.css";
import Typing from "./Typing";
import Dashboard from "./Dashboard";
import useWordbank from "../hooks/useWordbank";
import usePractice from "../hooks/usePractice";

const DEFAULT_WORDBANK = "common-character-l1";

function App() {
  const [currentWordbankName, setCurrentWordbankName] = useState(null);
  const { wordbanks } = useWordbank();
  const { handleKeydown, livewordQueue, refreshLivewords, inputCode } = usePractice({
    wordbanks: wordbanks,
    currentWordbankName: currentWordbankName
  });

  useEffect(() => {
    if (currentWordbankName === null && wordbanks[DEFAULT_WORDBANK]) {
      setCurrentWordbankName(DEFAULT_WORDBANK);
      refreshLivewords();
    }
  }, [currentWordbankName, wordbanks]);

  return (
    <div className="App">
      <div className="Header">header</div>
      <div className="Typing" tabIndex={0} onKeyDown={handleKeydown}>
        <Typing livewordQueue={livewordQueue} inputCode={inputCode} />
      </div>
      <div className="Dashboard">
        <Dashboard wordbanks={wordbanks} />
      </div>
      <div className="Footer">footer</div>
    </div>
  );
}

export default App;

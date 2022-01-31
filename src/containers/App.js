import React from "react";
import "./App.css";
import Typing from "./Typing";
import Dashboard from "./Dashboard";
import useWordbank from "../hooks/useWordbank";
import usePractice from "../hooks/usePractice";
import useSettings from "../hooks/useSettings";

function App() {
  const { wordbanks } = useWordbank();
  const { settings, setSetting } = useSettings();
  const { handleKeydown, wordQueue, currentWordProgress, codeInput } = usePractice({
    wordbanks: wordbanks,
    activeWordbanks: settings.activeWordbanks
  });

  return (
    <div className="App">
      <div className="Header">header</div>
      <div className="Typing" tabIndex={0} onKeyDown={handleKeydown}>
        <Typing
          wordQueue={wordQueue}
          currentWordProgress={currentWordProgress}
          codeInput={codeInput}
        />
      </div>
      <div className="Dashboard">
        <Dashboard wordbanks={wordbanks} settings={settings} setSetting={setSetting} />
      </div>
      <div className="Footer">footer</div>
    </div>
  );
}

export default App;

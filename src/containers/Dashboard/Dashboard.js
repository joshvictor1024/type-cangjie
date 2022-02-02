import React, { useState } from "react";
import "./Dashboard.css";
import Wordbanks from "./Wordbanks";

function Tab({ tab, activeTab, setActiveTab, title }) {
  return (
    <div
      className={"Dashboard__tab" + (tab === activeTab ? " Dashboard__tab--active" : "")}
      onClick={() => setActiveTab(tab)}
    >
      {title}
    </div>
  );
}

export default function Dashboard({ wordbanks, settings, setSetting }) {
  const [activeTab, setActiveTab] = useState("wordbanks");
  const panel = (() => {
    switch (activeTab) {
      case "keyboard":
        return null;
      case "wordbanks":
        return <Wordbanks wordbanks={wordbanks} settings={settings} setSetting={setSetting} />;
      case "stats":
        return null;
      default:
        throw new Error("unknown activeTab");
    }
  })();
  return (
    <div className="Dashboard">
      <div className="Dashboard__tabs">
        <div className="row">
          {/* mock items */}
          <Tab tab="keyboard" activeTab={activeTab} setActiveTab={setActiveTab} title="虛擬鍵盤" />
          <Tab tab="wordbanks" activeTab={activeTab} setActiveTab={setActiveTab} title="選擇詞庫" />
          <Tab tab="stats" activeTab={activeTab} setActiveTab={setActiveTab} title="統計資料" />
        </div>
      </div>
      <div className="Dashboard__panel">
        {panel}
      </div>
    </div>
  );
}

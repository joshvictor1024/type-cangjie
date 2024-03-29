import React, { useState } from "react";
import "./Dashboard.css";

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

export default function Dashboard({ wordbanks, graph, keyboard, stats, dateAndSettings}) {
  const [activeTab, setActiveTab] = useState("wordbanks");
  const panel = (() => {
    switch (activeTab) {
      case "wordbanks":
        return wordbanks;
      case "graph":
        return graph;
      case "keyboard":
        return keyboard;
      case "stats":
        return stats;
      case "dataAndSettings":
        return dateAndSettings;
      default:
        throw new Error("unknown activeTab");
    }
  })();
  return (
    <div className="Dashboard">
      <div className="Dashboard__tabs">
        <div className="row">
          <Tab tab="wordbanks" activeTab={activeTab} setActiveTab={setActiveTab} title="選擇詞庫" />
          <Tab tab="graph" activeTab={activeTab} setActiveTab={setActiveTab} title="即時圖表" />
          <Tab tab="keyboard" activeTab={activeTab} setActiveTab={setActiveTab} title="虛擬鍵盤" />
          <Tab tab="stats" activeTab={activeTab} setActiveTab={setActiveTab} title="統計數據" />
          <Tab tab="dataAndSettings" activeTab={activeTab} setActiveTab={setActiveTab} title="資料與設定" />
        </div>
      </div>
      <div className="Dashboard__panel">{panel}</div>
    </div>
  );
}

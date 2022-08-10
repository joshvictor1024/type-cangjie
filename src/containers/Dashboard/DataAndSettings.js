import React, { useRef } from "react";
import "./DataAndSettings.css";
import useDownloadJson from "../../hooks/useDownloadJson";
import useUploadJson from "../../hooks/useUploadJson";
import { useCompositionHistory } from "../../contexts/useCharacterHistory";

export default function DataAndSettings() {
  const { historyRef, setHistory } = useCompositionHistory();
  const { DownloadAnchor, downloadJson } = useDownloadJson();
  const getFromFile = useUploadJson(
    (json) => {
      alert("上傳歷史資料成功");
      setHistory(json);
    },
    () => {
      alert("上傳歷史資料失敗");
    }
  );
  const fileInputRef = useRef();
  return (
    <div className="DataAndSettings">
      <h3>資料</h3>
      <section className="column">
        <DownloadAnchor />
        <button onClick={() => downloadJson(historyRef.current, "type-cangjie-history.json")}>
          下載歷史資料
        </button>
        <span>
          <button onClick={() => getFromFile(fileInputRef.current.files[0])}>上傳歷史資料</button>
          <input
            ref={fileInputRef}
            className="DataAndSettings__fileInput"
            type="file"
            accept="application/json"
          />
        </span>
      </section>
      <h3>設定</h3>
      <section className="column">(無)</section>
    </div>
  );
}

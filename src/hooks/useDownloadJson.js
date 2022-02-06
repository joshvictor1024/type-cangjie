import React, { useRef } from "react";

export default function useDownloadJson() {
  const downloadAnchorRef = useRef();
  function DownloadAnchor() {
    return <a ref={downloadAnchorRef} style={{ display: "none" }} />;
  }
  function downloadJson(obj, filename) {
    const dataString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
    downloadAnchorRef.current.setAttribute("href", dataString);
    downloadAnchorRef.current.setAttribute("download", filename);
    downloadAnchorRef.current.click();
  }
  return { DownloadAnchor, downloadJson };
}

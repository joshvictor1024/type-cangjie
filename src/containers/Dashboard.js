import React, { useEffect } from "react";

export default function Dashboard({ wordbanks }) {
  useEffect(() => {
    console.log(wordbanks);
  }, [wordbanks]);
  return (
    <div>
      {Object.keys(wordbanks).map((wordbankName) => (
        <div key={wordbankName}>{wordbanks[wordbankName].display}</div>
      ))}
    </div>
  );
}

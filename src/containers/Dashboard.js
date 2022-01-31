import React, { useState, useEffect } from "react";

function doPropertiesMatch(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  if (Object.keys(obj2).length !== keys1.length) {
    return false;
  }
  for (let i = 0; i < keys1.length; i++) {
    if (obj1[keys1[i]] !== obj2[keys1[i]]) {
      return false;
    }
  }
  return true;
}

export default function Dashboard({ wordbanks, settings, setSetting }) {
  const [renderedWordbanks, setRenderedWordbanks] = useState({});

  useEffect(() => {
    if (!doPropertiesMatch(renderedWordbanks, wordbanks)) {
      setRenderedWordbanks(wordbanks);
    }
  }, [wordbanks]);
  useEffect(() => {}, [wordbanks]);

  function changeActiveWordbank(wordbankName, checked) {
    const activeWordbanks = [...settings.activeWordbanks];
    if (checked) {
      if (!settings.activeWordbanks.includes(wordbankName)) {
        activeWordbanks.push(wordbankName);
        activeWordbanks.sort();
        setSetting("activeWordbanks", activeWordbanks);
      }
    } else {
      const i = settings.activeWordbanks.findIndex((wbn) => wbn === wordbankName);
      if (i >= 0) {
        activeWordbanks.splice(i, 1);
        setSetting("activeWordbanks", activeWordbanks);
      }
    }
  }
  return (
    <div>
      {Object.keys(wordbanks).map((wordbankName) => (
        <div key={wordbankName}>
          {wordbanks[wordbankName].display}
          <input
            type="checkbox"
            checked={settings.activeWordbanks.includes(wordbankName)}
            onChange={(e) => changeActiveWordbank(wordbankName, e.target.checked)}
          />
        </div>
      ))}
    </div>
  );
}

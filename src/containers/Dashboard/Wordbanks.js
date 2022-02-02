import React, { useState, useEffect } from "react";
import "./Wordbanks.css";
import useDebounceDependency from "../../hooks/useDebounceDependency";

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

export default function Wordbanks({ wordbanks, settings, setSetting }) {
  const debouncedWordbanks = useDebounceDependency(wordbanks, undefined, 100, {falling: true});
  const [renderedWordbanks, setRenderedWordbanks] = useState({});

  useEffect(() => {
    if (!doPropertiesMatch(renderedWordbanks, wordbanks)) {
      setRenderedWordbanks(wordbanks);
    }
  }, [debouncedWordbanks]);

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
    <div className="Wordbanks">
      <div className="column">
        {Object.keys(renderedWordbanks).map((wordbankName) => (
          <div className="Wordbanks__item" key={wordbankName}>
            <label>
              {renderedWordbanks[wordbankName].display}
              <input
                type="checkbox"
                checked={settings.activeWordbanks.includes(wordbankName)}
                onChange={(e) => changeActiveWordbank(wordbankName, e.target.checked)}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

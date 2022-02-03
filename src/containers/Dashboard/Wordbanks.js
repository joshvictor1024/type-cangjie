import React, { useState, useEffect } from "react";
import "./Wordbanks.css";
import { useWordbanks } from "../../contexts/useWordbanks";
import { useActiveWordbanks } from "../../contexts/useActiveWordbanks";

function isObject(obj) {
  return (obj !== null && typeof obj === "object") || typeof obj === "function";
}

function doPropertiesMatch(obj1, obj2) {
  if (isObject(obj1) === false || isObject(obj2) === false) {
    return false;
  }
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

export default function Wordbanks({ settings, setSetting }) {
  const { wordbanks } = useWordbanks();
  const { activeWordbanks, setActiveWordbank } = useActiveWordbanks();
  const [renderedWordbanks, setRenderedWordbanks] = useState({});

  useEffect(() => {
    if (!doPropertiesMatch(renderedWordbanks, wordbanks)) {
      setRenderedWordbanks(wordbanks);
    }
  }, [wordbanks]);

  function changeActiveWordbank(wordbankName, checked) {
    setActiveWordbank(wordbankName, checked);
    return;
  }
  return (
    <div className="Wordbanks">
      <div className="column">
        {/* TODO: item order */}
        {Object.keys(renderedWordbanks).map((wordbankName) => (
          <div className="Wordbanks__item" key={wordbankName}>
            <label>
              {renderedWordbanks[wordbankName].display}
              <input
                type="checkbox"
                checked={activeWordbanks[wordbankName]}
                onChange={(e) => changeActiveWordbank(wordbankName, e.target.checked)}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

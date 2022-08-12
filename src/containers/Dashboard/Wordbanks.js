import React, { useState, useEffect } from "react";
import "./Wordbanks.css";

function doItemsFieldMatch(arr1, arr2, fieldName) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i][fieldName] !== arr2[i][fieldName]) {
      return false;
    }
  }
  return true;
}

/**
 * @param {Object} props
 * @param {Section[]} props.sections
 * @param {Object.<string, boolean>} props.wordbankActive
 * @param {(wordbankName: string, value: boolean) => {}} props.setWordbankActive
 */
export default function Wordbanks({ sections, wordbankActive, setWordbankActive }) {
  const [renderedSections, setRenderedSections] = useState([]);

  useEffect(() => {
    if (!doItemsFieldMatch(renderedSections, sections, "displayName")) {
      setRenderedSections(sections);
    }
    for (let i = 0; i < renderedSections.length; i++) {
      if (!doItemsFieldMatch(renderedSections[i].wordbanks, sections[i].wordbanks, "displayName")) {
        setRenderedSections(sections);
      }
    }
  }, [renderedSections, sections]);

  function changeActiveWordbank(wordbankName, checked) {
    setWordbankActive(wordbankName, checked);
    return;
  }
  return (
    <div className="Wordbanks">
      <div className="column">
        {renderedSections.map((section) => (
          <section key={section.name} className="Wordbanks__section column">
            <span>{section.displayName}</span>
            {section.wordbanks.map((wordbank) => (
              <div key={wordbank.name} className="Wordbanks__item">
                <label>
                  {wordbank.displayName}
                  {wordbank.words ? (
                    <input
                      type="checkbox"
                      checked={wordbankActive[wordbank.name] ? true : false}
                      onChange={(e) => changeActiveWordbank(wordbank.name, e.target.checked)}
                    />
                  ) : (
                    " 載入中..."
                  )}
                </label>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

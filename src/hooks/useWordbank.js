import { useState, useEffect } from "react";

export default function useWordbanks() {
  const [wordbanks, setWordbanks] = useState({});
  async function loadDefaults() {
    try {
      const res = await fetch("wordbank/defaults.json");
      const defaults = await res.json();
      return defaults;
    } catch (e) {
      console.error(e);
    }
    return null;
  }
  async function loadDisplay() {
    try {
      const res = await fetch("wordbank/display.json");
      const display = await res.json();
      return display;
    } catch (e) {
      console.error(e);
    }
    return null;
  }
  async function loadWords(wordbankName) {
    try {
      const res = await fetch(`wordbank/words/${wordbankName}.csv`);
      const text = await res.text();
      return text.split(",");
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  useEffect(() => {
    (async () => {
      const defaults = await loadDefaults();
      const display = await loadDisplay();
      if (!(defaults && display)) {
        return;
      }
      defaults.forEach(async (wordbankName) => {
        const words = await loadWords(wordbankName);
        if (!words) {
          return;
        }
        setWordbanks((c) => {
          return {
            ...c,
            [wordbankName]: {
              display: display[wordbankName],
              words: words
            }
          };
        });
      });
    })();
  }, []);

  return { wordbanks };
}

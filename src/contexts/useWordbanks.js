import { createContext, useContext, useState, useEffect } from "react";
import useDebounceDependency from "../hooks/useDebounceDependency";

const WordbanksContext = createContext({
  workbanks: []
});

function WordbanksProvider(props) {
  const [wordbanks, setWordbanks] = useState([]);
  const debouncedWordbanks = useDebounceDependency(wordbanks, [], 100, { falling: true });
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
      if (!defaults) {
        return;
      }
      setWordbanks(defaults.map((defaultWordbank) => {
        return {
          name: defaultWordbank.name,
          displayName: defaultWordbank.displayName,
          words: null
        };
      }));
      defaults.forEach(async (defaultWordbank) => {
        const words = await loadWords(defaultWordbank.name);
        if (!words) {
          return;
        }
        // if JSON is not found, returns HTML document,
        // which contains "<"
        if (words.find((word) => word.includes("<"))) {
          return;
        }
        setWordbanks((c) => {
          const i = c.findIndex((wb) => wb.name === defaultWordbank.name);
          const copy = [...c];
          copy[i].words = words;
          return copy;
        });
      });
    })();
  }, []);

  return <WordbanksContext.Provider value={{ wordbanks: debouncedWordbanks }} {...props} />;
}

function useWordbanks() {
  return useContext(WordbanksContext);
}

export { WordbanksProvider, useWordbanks };

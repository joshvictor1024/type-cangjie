import { useState, useEffect } from "react";
import useDebounceDependency from "../hooks/useDebounceDependency";
import { fetchJSON, fetchText } from "../util/fetch";

/** @typedef {{name: string, displayName: string, words: string[]}} Wordbank */

/** @returns {Wordbank[]} */
export default function useWordbanks() {
  /** @type {[Wordbank, React.Dispatch<React.SetStateAction<Wordbank[]>>]} */
  const [wordbanks, setWordbanks] = useState([]);
  const debouncedWordbanks = useDebounceDependency(wordbanks, [], 100, { falling: true });

  useEffect(() => {
    (async () => {
      // Load default wordbank manifests.
      const defaults = await fetchJSON("wordbank/defaults.json");
      if (defaults === null) {
        return;
      }
      setWordbanks(
        defaults.map((defaultWordbank) => {
          return {
            name: defaultWordbank.name,
            displayName: defaultWordbank.displayName,
            words: null
          };
        })
      );
      // Load words according to the manifests.
      defaults.forEach(async (defaultWordbank) => {
        const wordsString = await fetchText(`wordbank/words/${defaultWordbank.name}.csv`);
        if (wordsString === null) {
          return;
        }
        const words = wordsString.split(",");
        // If file is not found, returns HTML document, which contains "<".
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

  return debouncedWordbanks;
}

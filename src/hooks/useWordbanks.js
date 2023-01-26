import { useState, useEffect } from "react";
import useDebounceDependency from "../hooks/useDebounceDependency";
import { fetchJSON, fetchText } from "../util/fetch";

/** @typedef {{name: string, displayName: string, words: string[]}} Wordbank */
/** @typedef {{name: string, displayName: string, wordbanks: Wordbank[]}} Section */

/** @returns {Wordbank[]} */
export default function useWordbanks() {
  /** @type {[Section, React.Dispatch<React.SetStateAction<Section[]>>]} */
  const [sections, setSections] = useState([]);
  const debouncedSections = useDebounceDependency(sections, [], 100, { falling: true });

  useEffect(() => {
    (async () => {
      // Load default wordbank manifest.
      /** @type {Section[]} */
      const manifest = await fetchJSON("wordbank/manifest.json");
      if (manifest === null) {
        return;
      }
      setSections(manifest);
      
      // Load wordbanks according to the manifest.
      manifest.forEach((section) => {
        // Load words according to the manifest.
        section.wordbanks.forEach(async (wordbank) => {
          const wordsString = await fetchText(`wordbank/${section.name}/${wordbank.name}.csv`);
          if (wordsString === null) {
            return;
          }
          const words = wordsString.split(",");
          // If the file is not found, return the HTML document, which contains "<".
          if (words.find((word) => word.includes("<"))) {
            return;
          }
          setSections((c) => {
            const copy = [...c];
            const sectionIndex = copy.findIndex((s) => s.name === section.name);
            const wordbankIndex = copy[sectionIndex].wordbanks.findIndex((wb) => wb.name === wordbank.name);
            copy[sectionIndex].wordbanks[wordbankIndex].words = words;
            return copy;
          });
        })
      })
    })();
  }, []);

  return debouncedSections;
}

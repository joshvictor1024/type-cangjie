import { useState, useEffect } from "react";

export default function useCangjieDicts() {
  const [dicts, setDicts] = useState(null);

  useEffect(() => {
    (async () => {
      async function loadDictionary(dictionaryName) {
        try {
          const res = await fetch(`cangjie/dictionary/${dictionaryName}.json`);
          const json = await res.json();
          return json;
        } catch (e) {
          console.error(e);
        }
        return null;
      }
      const cj3Dictonary = await loadDictionary("3");
      const cj5Dictonary = await loadDictionary("5");
      const cj5xDictonary = await loadDictionary("5x");
      const cjmsDictonary = await loadDictionary("ms");
      if (!(cj3Dictonary && cj5Dictonary && cj5xDictonary && cjmsDictonary)) {
        return;
      }

      const newDicts = {};
      newDicts.dict3 = { ...cj5Dictonary, ...cj3Dictonary }; // overwrite former with latter
      newDicts.dict5 = { ...cj5Dictonary, ...cj5xDictonary };
      newDicts.dict5x = { ...cj5xDictonary };
      newDicts.dictMs = { ...cj5Dictonary, ...cj3Dictonary, ...cjmsDictonary }; // overwrite former with latter
      setDicts(newDicts);
    })();
  }, []);

  return dicts;
}

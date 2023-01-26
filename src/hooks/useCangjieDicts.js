import { useState, useEffect } from "react";
import { fetchJSON } from "../util/fetch";

export default function useCangjieDicts() {
  const [dicts, setDicts] = useState(null);

  useEffect(() => {
    (async () => {
      const cj3Dictonary = await fetchJSON("cangjie/dictionary/3.json");
      const cj5Dictonary = await fetchJSON("cangjie/dictionary/5.json");
      const cj5xDictonary = await fetchJSON("cangjie/dictionary/5x.json");
      const cjmsDictonary = await fetchJSON("cangjie/dictionary/ms.json");
      if (!(cj3Dictonary && cj5Dictonary && cj5xDictonary && cjmsDictonary)) {
        return;
      }

      const newDicts = {};
      newDicts.dict3 = { ...cj5Dictonary, ...cj3Dictonary }; // Overwrite former with latter.
      newDicts.dict5 = { ...cj5Dictonary, ...cj5xDictonary };
      newDicts.dict5x = { ...cj5xDictonary };
      newDicts.dictMs = { ...cj5Dictonary, ...cj3Dictonary, ...cjmsDictonary }; // Overwrite former with latter.
      setDicts(newDicts);
    })();
  }, []);

  return dicts;
}

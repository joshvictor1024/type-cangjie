import { createContext, useContext, useEffect, useRef } from "react";

const VERSION_3 = "3";
const VERSION_5 = "5";
const VERSION_5x = "5x";
const VERSION_3_AND_5 = "3n5";
const VERSION_MS = "ms";
const VERSION_MS_AND_3 = "msn3";

const RADICALS = {
  a: "日",
  b: "月",
  c: "金",
  d: "木",
  e: "水",
  f: "火",
  g: "土",
  h: "竹",
  i: "戈",
  j: "十",
  k: "大",
  l: "中",
  m: "一",
  n: "弓",
  o: "人",
  p: "心",
  q: "手",
  r: "口",
  s: "尸",
  t: "廿",
  u: "山",
  v: "女",
  w: "田",
  x: "難",
  y: "卜",
  z: "重"
};

function toRadicals(code) {
  return Array.from(code)
    .map((letter) => RADICALS[letter])
    .join("");
}

const CangjieContext = createContext({
  toCode: () => [],
  toRadicals
});

function CangjieProvider(props) {
  const loadedRef = useRef(false);
  const cj3 = useRef(null);
  const cj5 = useRef(null);
  const cj5x = useRef(null);
  const cjms = useRef(null);

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
      cj3.current = cj3Dictonary;
      cj5.current = cj5Dictonary;
      cj5x.current = cj5xDictonary;
      cjms.current = cjmsDictonary;
      loadedRef.current = true;
    })();
  }, []);

  function toCode(character, version = VERSION_3_AND_5) {
    if (!loadedRef.current) return [];
    const cj3Codes = cj3.current[character];
    const cj5Codes = cj5.current[character];
    const cj5xCodes = cj5x.current[character];
    const cjmsCodes = cjms.current[character];
    const codes = [];
    switch (version) {
      case VERSION_3:
        if (cj3Codes) codes.push(...cj3Codes);
        else if (cj5Codes) codes.push(...cj5Codes);
        return codes;
      case VERSION_5:
        if (cj5Codes) codes.push(...cj5Codes);
        if (cj5xCodes) codes.push(...cj5xCodes);
        return codes;
      case VERSION_5x:
        if (cj5xCodes) codes.push(...cj5xCodes);
        return codes;
      case VERSION_3_AND_5:
        if (cj3Codes) codes.push(...cj3Codes);
        if (cj5Codes) codes.push(...cj5Codes);
        if (cj5xCodes) codes.push(...cj5xCodes);
        return codes;
      case VERSION_MS:
        if (cjmsCodes) codes.push(...cjmsCodes);
        else if (cj3Codes) codes.push(...cj3Codes);
        else if (cj5Codes) codes.push(...cj5Codes);
        return codes;
      case VERSION_MS_AND_3:
        if (cjmsCodes) codes.push(...cjmsCodes);
        if (cj3Codes) codes.push(...cj3Codes);
        else if (cj5Codes) codes.push(...cj5Codes);
        return codes;
      default:
        throw new Error(`unknown cangjie version ${version}`);
    }
  }

  return <CangjieContext.Provider value={{ toCode, toRadicals }} {...props} />;
}

function useCangjie() {
  return useContext(CangjieContext);
}

export { CangjieProvider, useCangjie };

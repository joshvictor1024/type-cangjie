import { createContext, useContext, useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const defaultActiveWordbanks = {
  "common-character-l1": true
};

const ActiveWordbanksContext = createContext({
  activeWordbanks: defaultActiveWordbanks,
  setActiveWordbank: () => {}
});

function ActiveWordbanksProvider(props) {
  const {
    isAvailable,
    get: getLocalActiveWordbanks,
    set: setLocalActiveWordbanks
  } = useLocalStorage("active-wordbanks");
  const [activeWordbanks, setActiveWordbanks] = useState(defaultActiveWordbanks);

  useEffect(() => {
    if (isAvailable()) {
      const localActiveWordbanks = getLocalActiveWordbanks();
      if (localActiveWordbanks) {
        setActiveWordbanks((c) => {
          return { ...c, ...localActiveWordbanks };
        });
      }
    }
  }, []);

  function setActiveWordbank(wordbankName, value) {
    const newActiveWordbanks = { ...activeWordbanks, [wordbankName]: value };
    setActiveWordbanks(newActiveWordbanks);
    if (isAvailable()) {
      setLocalActiveWordbanks(newActiveWordbanks);
    }
  }

  return (
    <ActiveWordbanksContext.Provider value={{ activeWordbanks, setActiveWordbank }} {...props} />
  );
}

function useActiveWordbanks() {
  return useContext(ActiveWordbanksContext);
}

export { ActiveWordbanksProvider, useActiveWordbanks };

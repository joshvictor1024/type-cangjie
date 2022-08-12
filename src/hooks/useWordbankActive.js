import { useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const defaultWordbankActive = {
  "graded-character-l1": true
};

export default function useWordbankActive() {
  const {
    isAvailable,
    get: getLocalWordbankActive,
    set: setLocalWordbankActive
  } = useLocalStorage("wordbank-active");
  const [wordbankActive, setWordbankActive] = useState(defaultWordbankActive);

  useEffect(() => {
    if (isAvailable()) {
      const localWordbankActive = getLocalWordbankActive();
      if (localWordbankActive) {
        setWordbankActive((c) => {
          return { ...c, ...localWordbankActive };
        });
      }
    }
  }, []);

  /**
   * @param {string} wordbankName
   * @param {boolean} value
   */
  function setWordbankActiveExternal(wordbankName, value) {
    const newActiveWordbanks = { ...wordbankActive, [wordbankName]: value };
    setWordbankActive(newActiveWordbanks);
    if (isAvailable()) {
      setLocalWordbankActive(newActiveWordbanks);
    }
  }

  return { wordbankActive, setWordbankActive: setWordbankActiveExternal };
}

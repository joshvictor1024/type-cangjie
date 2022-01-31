import { useState, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

const defaultSettings = {
  activeWordbanks: ["common-character-l1"]
};

// settings:
// {
//   activeWordbanks: [String]
// }
export default function useSettings() {
  const { isAvailable, get: getLocalSettings, set: setLocalSettings } = useLocalStorage("settings");
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    if (isAvailable()) {
      const localSettings = getLocalSettings();
      if (localSettings) {
        setSettings((c) => {
          return { ...c, ...localSettings };
        });
      }
    }
  }, []);

  function setSetting(setting, value) {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    if (isAvailable()) {
      setLocalSettings(newSettings);
    }
  }

  return { settings, setSetting };
}

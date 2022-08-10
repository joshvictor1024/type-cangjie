import React from "react";
import "./Composer.css";
import { radicalKeysToRadicals } from "../lib/typing/key"

export default function Composer({ radicalKeys }) {
  return <div className="Composer">{radicalKeys?.length !== 0 ? radicalKeysToRadicals(radicalKeys) : "　"}</div>;
}

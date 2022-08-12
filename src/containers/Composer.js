import React from "react";
import "./Composer.css";
import { radicalKeysToRadicals } from "../lib/typing/key";

export default function Composer({ radicalKeys, marginCount }) {
  return (
    <div className="Composer">
      <span>{"　".repeat(marginCount)}</span>
      <div className="Composer__radicals">
        {radicalKeys?.length !== 0 ? radicalKeysToRadicals(radicalKeys) : "　"}
      </div>
    </div>
  );
}

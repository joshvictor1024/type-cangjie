import React from "react";
import "./Composer.css";
import { keysToRadicals } from "../lib/typing/radical"

export default function Composer({ keys }) {
  return <div className="Composer">{keys?.length !== 0 ? keysToRadicals(keys) : "　"}</div>;
}

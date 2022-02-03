import React from "react";
import "./Input.css";
import { useCangjie } from "../contexts/useCangjie";

export default function Input({ code }) {
  const { toRadicals } = useCangjie();
  return <div className="Input">{code ? toRadicals(code) : "　"}</div>;
}

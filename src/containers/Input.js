import React from "react";
import "./Input.css";

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

export default function Input({ code }) {
  return <div className="Input">{code ? toRadicals(code) : "　"}</div>;
}

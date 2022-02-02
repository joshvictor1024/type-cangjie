import React from "react";
import "./Lookup.css";

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

export default function Lookup({ character, setCharacter, toCode }) {
  toCode = toCode ?? (() => []);

  const cj3Codes = toCode(character, "3");
  const cj5Codes = toCode(character, "5");
  const cj5xCodes = toCode(character, "5x");
  const cjmsCodes = toCode(character, "ms");
  const cj3Code = cj3Codes[0] ? cj3Codes[0] : "";
  const cj5Code = cj5Codes[0] ? cj5Codes[0] : "";
  const cj5xCode = cj5xCodes[0] ? cj5xCodes[0] : "";
  const cjmsCode = cjmsCodes[0] ? cjmsCodes[0] : "";
  return (
    <div className="Lookup">
      <input
        className="Lookup__input"
        type="text"
        value={character}
        onChange={(e) => setCharacter(e.target.value)}
        maxLength={1}
        title="點擊輸入文字，以查詢倉頡編碼"
      />
      <div className="Lookup__result">
        <table>
          <tbody>
            <tr>
              <th>倉頡三代</th>
              <td>{toRadicals(cj3Code)}</td>
              <td>{cj3Code}</td>
            </tr>
            <tr>
              <th>倉頡五代</th>
              <td>{toRadicals(cj5Code)}</td>
              <td>{cj5Code}</td>
            </tr>
            {cj5xCode ? (
              <tr>
                <th></th>
                <td>{toRadicals(cj5xCode)}</td>
                <td>{cj5xCode}</td>
              </tr>
            ) : null}
            <tr>
              <th>微軟倉頡</th>
              <td>{toRadicals(cjmsCode)}</td>
              <td>{cjmsCode}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

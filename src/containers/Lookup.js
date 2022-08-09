import React from "react";
import "./Lookup.css";
import { useCangjie } from "../contexts/useCangjieDicts";
import { keysToRadicals } from "../lib/typing/radical";
import { reverseLookup } from "../lib/typing/compose";

export default function Lookup({ character, setCharacter }) {
  const { dicts } = useCangjie();

  const cj3Code = (reverseLookup(character, dicts, "3") ?? [""])[0];
  const cj5Code = (reverseLookup(character, dicts, "5") ?? [""])[0];
  const cj5xCode = (reverseLookup(character, dicts, "5x") ?? [""])[0];
  const cjmsCode = (reverseLookup(character, dicts, "ms") ?? [""])[0];

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
              <td>{keysToRadicals(Array.from(cj3Code))}</td>
              <td className="Lookup__result-cell--english">{cj3Code}</td>
            </tr>
            <tr>
              <th>倉頡五代</th>
              <td>{keysToRadicals(Array.from(cj5Code))}</td>
              <td className="Lookup__result-cell--english">{cj5Code}</td>
            </tr>
            {cj5xCode ? (
              <tr>
                <th></th>
                <td>{keysToRadicals(Array.from(cj5xCode))}</td>
                <td className="Lookup__result-cell--english">{cj5xCode}</td>
              </tr>
            ) : null}
            <tr>
              <th>微軟倉頡</th>
              <td>{keysToRadicals(Array.from(cjmsCode))}</td>
              <td className="Lookup__result-cell--english">{cjmsCode}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

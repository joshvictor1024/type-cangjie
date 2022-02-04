import React, { useState } from "react";
import { useCangjie } from "../contexts/useCangjie";
import "./ScreenKeyboard.css";

const keyLength = 100;
const margin = 10;
const rowsPadding = [0, 0.3 * keyLength, 0.9 * keyLength];
function getKeyPosition(key) {
  const row = key.r;
  const column = key.c;
  const rowPadding = rowsPadding[row];
  return {
    x: margin + rowPadding + (keyLength + margin) * column,
    y: margin + (keyLength + margin) * row
  };
}
const keyLetter = {
  q: { r: 0, c: 0 },
  w: { r: 0, c: 1 },
  e: { r: 0, c: 2 },
  r: { r: 0, c: 3 },
  t: { r: 0, c: 4 },
  y: { r: 0, c: 5 },
  u: { r: 0, c: 6 },
  i: { r: 0, c: 7 },
  o: { r: 0, c: 8 },
  p: { r: 0, c: 9 },

  a: { r: 1, c: 0 },
  s: { r: 1, c: 1 },
  d: { r: 1, c: 2 },
  f: { r: 1, c: 3 },
  g: { r: 1, c: 4 },
  h: { r: 1, c: 5 },
  j: { r: 1, c: 6 },
  k: { r: 1, c: 7 },
  l: { r: 1, c: 8 },

  z: { r: 2, c: 0 },
  x: { r: 2, c: 1 },
  c: { r: 2, c: 2 },
  v: { r: 2, c: 3 },
  b: { r: 2, c: 4 },
  n: { r: 2, c: 5 },
  m: { r: 2, c: 6 }
};

const width = 10 * keyLength + 11 * margin;
const height = 4 * keyLength + 5 * margin;

const keyFunction = {
  Space: {
    x: margin + 0.9 * keyLength + 2 * (keyLength + margin),
    y: margin + 3 * (keyLength + margin),
    w: keyLength * 4 + margin * 3
  },
  Backspace: {
    x: width - keyLength * 2.5 - margin,
    y: margin + 3 * (keyLength + margin),
    w: keyLength * 2.5
  }
};

function getDefaultKeyState() {
  return Object.keys(keyLetter).reduce(
    (acc, cur) => {
      acc[cur] = false;
      return acc;
    },
    Object.keys(keyFunction).reduce((acc, cur) => {
      acc[cur] = false;
      return acc;
    }, {})
  );
}

function KeyLetter({ letter, radical, x, y, length, isDown, handleKeyDown, handleKeyUp }) {
  return (
    <svg
      x={x}
      y={y}
      width={length}
      height={length}
      onMouseDown={() => handleKeyDown(letter)}
      onMouseUp={() => handleKeyUp(letter)}
      onMouseLeave={() => handleKeyUp(letter)}
    >
      <rect
        width="100%"
        height="100%"
        rx="8%"
        className={"ScreenKeyboard__cap" + (isDown ? " ScreenKeyboard__cap--down" : "")}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={length * 0.4}
        className={"ScreenKeyboard__text" + (isDown ? " ScreenKeyboard__text--down" : "")}
      >
        {letter.toUpperCase()}
      </text>
      <text
        x="20%"
        y="80%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={length * 0.3}
        className={"ScreenKeyboard__text" + (isDown ? " ScreenKeyboard__text--down" : "")}
      >
        {radical}
      </text>
    </svg>
  );
}
function KeyFunction({ name, x, y, w, h, isDown, handleKeyDown, handleKeyUp }) {
  return (
    <svg
      x={x}
      y={y}
      width={w}
      height={h}
      onMouseDown={() => handleKeyDown(name)}
      onMouseUp={() => handleKeyUp(name)}
      onMouseLeave={() => handleKeyUp(name)}
    >
      <rect
        width="100%"
        height="100%"
        ry="8%"
        className={"ScreenKeyboard__cap" + (isDown ? " ScreenKeyboard__cap--down" : "")}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={h * 0.4}
        className={"ScreenKeyboard__text" + (isDown ? " ScreenKeyboard__text--down" : "")}
      >
        {name}
      </text>
    </svg>
  );
}
/**
 * [a-z]|"Backspace"|"Space"
 */
export default function useScreenKeyboard(enterKey) {
  const { toRadicals } = useCangjie();
  const [keyState, setKeyState] = useState(getDefaultKeyState());
  function setKey(down, key) {
    setKeyState((c) => {
      return { ...c, [key]: down };
    });
  }
  function handleKeyDown(key) {
    if (keyState[key] === false) {
      enterKey(key);
      setKeyState((c) => {
        return { ...c, [key]: true };
      });
    }
  }
  function handleKeyUp(key) {
    if (keyState[key] === true) {
      setKeyState((c) => {
        return { ...c, [key]: false };
      });
    }
  }
  function Keyboard() {
    return (
      <div className="Keyboard">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`}>
          <rect width="100%" height="100%" fill="#f3f3f3" />
          {Object.keys(keyLetter).map((letter) => (
            <KeyLetter
              key={letter}
              letter={letter}
              radical={toRadicals(letter)}
              {...getKeyPosition(keyLetter[letter])}
              length={keyLength}
              isDown={keyState[letter]}
              handleKeyDown={handleKeyDown}
              handleKeyUp={handleKeyUp}
            />
          ))}
          {Object.keys(keyFunction).map((name) => (
            <KeyFunction
              key={name}
              name={name}
              {...keyFunction[name]}
              h={keyLength}
              isDown={keyState[name]}
              handleKeyDown={handleKeyDown}
              handleKeyUp={handleKeyUp}
            />
          ))}
        </svg>
      </div>
    );
  };
  return {Keyboard, setKey};
}

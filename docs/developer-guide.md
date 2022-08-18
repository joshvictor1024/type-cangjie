# Developer Guide

## Local Development

Run `yarn install` to install required packages.

In `package.json`, `"homepage"` is set to `https://joshvictor1024.github.io/type-cangjie/` for deployment to gh-pages. Remove the entry before running `yarn start`.

Sometimes, `useEffect` effects may run twice. Disabling React strict mode may fix this.

```js
// src/index.js

// <React.StrictMode>
//   <App />
// </React.StrictMode>,
<App />,
```

When you are ready to deploy, change `package.json` and `src/index.js` back if you've modified them. Run `yarn predeploy` then `yarn deploy`.

## Wordbank

Common characters and words are from https://coct.naer.edu.tw/download/tech_report/.

### Specs

The csv files comply to RFC 4180. In short:

- Line break is CRLF.
- Line break on last line is optional.
- No trailing commas.

For usage within the app:

- Fields should only contain characters that are meant to be typed in the app. Therefore:
  - Words should not be enclosed in double quotes.
  - Words should not include whitespaces.
  - Words should not include characters that cannot be typed using the current IME implementation e.g. the half-width parenthses "(", ")".

Some characters and words are not included.

**Characters**

TODO

**Words**

- If the longest word is a superset of shorter ones, only the longest is preserved e.g. 一共/共 => 一共
- "兒" suffix is omitted e.g. 事/事兒 => 事
- "子" suffix is not omitted e.g. 小孩/小孩子 => 小孩子
- If one writing form is significantly more common, the others are omitted e.g. 什麼/甚麼 => 什麼
- If there are multiple common writing forms, all are preserved e.g. 台灣/臺灣
- Although some common words are technically incorrect, they are preserved e.g. "姐姐" ("姊" elder sister; "姐" female)
- For words with multiple meanings (denoted with number 1, 2), only one is preserved.
- For words with "()", the inclusion and exclusion of the parenthesized characters each counts as a word e.g. 沒(有)用 => 沒有用/沒用 => 沒有用

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

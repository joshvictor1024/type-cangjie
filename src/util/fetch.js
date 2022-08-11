/**
 * @param {string} jsonURL
 * @returns {Object|null} return `null` on fetch error
 */
export async function fetchJSON(jsonURL) {
  try {
    const res = await fetch(jsonURL);
    const json = await res.json();
    return json;
  } catch (e) {
    console.error(e);
  }
  return null;
}

/**
 * @param {string} textURL
 * @returns {string|null} return `null` on fetch error
 */
export async function fetchText(textURL) {
  try {
    const res = await fetch(textURL);
    const text = await res.text();
    return text;
  } catch (e) {
    console.error(e);
  }
  return null;
}

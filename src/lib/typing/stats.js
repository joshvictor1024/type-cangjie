/**
 * @module typing
 */

/**
 * Information extracted from one or more `HistoryEntry` object.
 * Time is in milliseconds.
 * @typedef {Object} Stats
 * @property {number} totalComposition number of character compositions
 * @property {number} errorComposition number of character compositions that involved at least one error
 * @property {number} totalTime time used for all key presses
 * @property {number} effectiveTime time used for effective key presses
 * @property {Object.<string, number[]>} keysTimes time used to type each key
 */

/**
 * Creates a default-valued `Stats`.
 * @returns {Stats}
 */
export function createStats() {
  return {
    totalComposition: 0,
    errorComposition: 0,
    totalTime: 0,
    effectiveTime: 0,
    keysTimes: {}
  };
}

/**
 * Extracts information from `he`.
 * @param {HistoryEntry} he
 * @returns {Stats}
 */
export function getStats(he) {
  // Make copies so as not to modify `he`.
  const codeArray = Array.from(he.c);
  const keys = [...he.k];

  const stats = createStats();
  stats.totalComposition = 1;
  stats.errorComposition = he.e ? 1 : 0;

  // TODO: this algorithm is not correct
  // e.g. compose 說(yrcru) by typing "yrcruu ":
  // second last "u" is the effective key, yet last "u" is counted.
  //
  // Process from the end of `keys`.
  while (keys.length) {
    const [key, time] = keys.pop();

    // Always accumulate total time.
    stats.totalTime += time;

    // Calculate effective time by comparing with `codeArray`.
    if (key === "Backspace") {
      continue;
    } else if (key === "Space") {
      // Only count the last "Space", which contributes to the successful composition, as effective.
      if (stats.keysTimes["Space"] == null) {
        stats.keysTimes["Space"] = [time];
        stats.effectiveTime += time;
      }
    } else {
      // Only count `key` as effective if it contributes to the successful composition.
      if (codeArray.length === 0) {
        continue;
      } else if (key === codeArray[codeArray.length - 1]) {
        codeArray.pop();
        if (stats.keysTimes[key] == null) {
          stats.keysTimes[key] = [];
        }
        stats.keysTimes[key].push(time);
        stats.effectiveTime += time;
      }
    }
  }

  return stats;
}

/**
 * Accumulates one or more `Stats` into one.
 * @param {Stats[]} statsArray
 * @returns {Stats}
 */
export function accumulateStats(statsArray) {
  return Object.values(statsArray).reduce(
    (acc, stats) => {
      acc.totalComposition += stats.totalComposition;
      acc.errorComposition += stats.errorComposition;
      acc.totalTime += stats.totalTime;
      acc.effectiveTime += stats.effectiveTime;
      Object.keys(stats.keysTimes).forEach((key) => {
        if (acc.keysTimes[key] == null) {
          acc.keysTimes[key] = [];
        }
        acc.keysTimes[key].push(...stats.keysTimes[key]);
      });
      return acc;
    },
    { totalComposition: 0, errorComposition: 0, totalTime: 0, effectiveTime: 0, keysTimes: {} }
  );
}

/**
 * @param {Stats} stats
 * @returns {number} Returns accuracy in percents.
 */
export function getCompositionAccuracy(stats) {
  return ((stats.totalComposition - stats.errorComposition) * 100) / stats.totalComposition;
}

/**
 * @param {Stats} stats
 * @returns {number} Returns efficiency in percents.
 */
export function getTimeEfficiency(stats) {
  return (stats.effectiveTime / stats.totalTime) * 100;
}

/**
 * @param {Stats} stats
 * @returns {number} Returns speed in characters per minute (cpm).
 */
export function getOptimalAverageSpeed(stats) {
  return (
    (stats.totalComposition - stats.errorComposition) / (stats.effectiveTime / (1000 * 60))
  );
}

/**
 * In characters per minute (cpm).
 * @param {Stats} stats
 * @returns {number}
 */
export function getAverageSpeed(stats) {
  return stats.totalComposition / (stats.totalTime / (1000 * 60));
}

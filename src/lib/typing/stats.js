/**
 * @module typing
 */

/**
 * Information extracted from one or more `CompositionHistory` object.
 * @typedef {Object} CompositionHistoryStats
 * @property {number} totalComposition number of character compositions
 * @property {number} errorComposition number of character compositions that involved at least one error
 * @property {number} totalTime time used for all key presses
 * @property {number} effectiveTime time used for effective key presses
 * @property {Object.<string, number[]>} keysTimes time used to type each key
 */

/**
 * Extract information from `ch`.
 * @param {CompositionHistory} ch
 * @returns {CompositionHistoryStats}
 */
export function getStats(ch) {
  // Make copies so as not to modify `ch`.
  const codeArray = Array.from(ch.c);
  const keys = [...ch.k];

  const stats = {
    totalComposition: 1,
    errorComposition: ch.e ? 1 : 0,
    totalTime: 0,
    effectiveTime: 0,
    keysTimes: {}
  };

  // TODO: this algorithm is not correct
  // e.g. compose 說(yrcru) by typing "yrcruu":
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
 * Accumulate one or more `CompositionHistoryStats` into one.
 * @param {CompositionHistoryStats[]} statsArray
 * @returns {CompositionHistoryStats}
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
 * In percents.
 * @param {CompositionHistoryStats} chStats
 * @returns {number}
 */
export function getCompositionAccuracy(chStats) {
  return ((chStats.totalComposition - chStats.errorComposition) * 100) / chStats.totalComposition;
}

/**
 * In percents.
 * @param {CompositionHistoryStats} chStats
 * @returns {number}
 */
export function getTimeEfficiency(chStats) {
  return (chStats.effectiveTime / chStats.totalTime) * 100;
}

/**
 * In characters per minute (cpm).
 * @param {CompositionHistoryStats} chStats
 * @returns {number}
 */
export function getOptimalAverageSpeed(chStats) {
  return (
    (chStats.totalComposition - chStats.errorComposition) / (chStats.effectiveTime / (1000 * 60))
  );
}

/**
 * In characters per minute (cpm).
 * @param {CompositionHistoryStats} chStats
 * @returns {number}
 */
export function getAverageSpeed(chStats) {
  return chStats.totalComposition / (chStats.totalTime / (1000 * 60));
}

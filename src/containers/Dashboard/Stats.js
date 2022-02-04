import React, { useState, useLayoutEffect, useRef } from "react";
import { useCharacterHistory } from "../../contexts/useCharacterHistory";

function getCharacterStats(code, keys, error) {
  code = Array.from(code);
  const result = {
    totalComposition: 1,
    errorComposition: error ? 1 : 0,
    totalTime: 0,
    effectiveTime: 0,
    keys: {}
  };
  //console.log(keys, code);
  while (code.length) {
    if (keys.length === 0) {
      throw new Error("getKeyTimes parse error");
    }
    const [key, time] = keys.pop();
    result.totalTime += time;
    if (key === "Space") {
      if (!result.keys.Space) {
        result.keys.Space = [time];
        result.effectiveTime += time;
      }
    } else if (key === "Backspace") {
      continue;
    } else {
      if (key === code[code.length - 1]) {
        if (!result.keys[key]) {
          result.keys[key] = [];
        }
        result.keys[key].push(time);
        result.effectiveTime += time;
        code.pop();
      }
    }
  }
  while (keys.length) {
    const [, time] = keys.pop();
    result.totalTime += time;
  }
  return result;
}

function accumulateStats(statsArray) {
  return Object.values(statsArray).reduce(
    (acc, stats) => {
      acc.totalComposition += stats.totalComposition;
      acc.errorComposition += stats.errorComposition;
      acc.totalTime += stats.totalTime;
      acc.effectiveTime += stats.effectiveTime;
      Object.keys(stats.keys).forEach((key) => {
        if (!acc.keys[key]) {
          acc.keys[key] = [];
        }
        acc.keys[key].push(...stats.keys[key]);
      });
      return acc;
    },
    { totalComposition: 0, errorComposition: 0, totalTime: 0, effectiveTime: 0, keys: {} }
  );
}

function getDateStats(history) {
  const dates = Object.keys(history);
  return dates.reduce((acc, date) => {
    const dateHistory = history[date];
    const dateAllCharacterStats = Object.values(dateHistory).map((dateCharacterHistories) => {
      const dateCharacterStats = dateCharacterHistories.map((characterHistory) =>
        getCharacterStats(characterHistory.c, [...characterHistory.k], characterHistory.e)
      );
      return accumulateStats(dateCharacterStats);
    });
    acc[date] = accumulateStats(dateAllCharacterStats);
    return acc;
  }, {});
}

function getStatsAllDates(dateStats) {
  return accumulateStats(Object.values(dateStats));
}

function getSelectedState(dateStats, selectedDate) {
  return selectedDate === "all" ? getStatsAllDates(dateStats) : dateStats[selectedDate];
}

function GeneralStatsRows({ totalComposition, errorComposition, totalTime, effectiveTime }) {
  return (
    <>
      <tr>
        <th>Total Composition Count</th>
        <td>{totalComposition}</td>
      </tr>
      <tr>
        <th>Composition Error Count</th>
        <td>{errorComposition}</td>
      </tr>
      <tr>
        <th>Character Accuracy (%)</th>
        <td>{(((totalComposition - errorComposition) * 100) / totalComposition).toFixed(1)}</td>
      </tr>
      <tr>
        <th>Total Time Spend (seconds)</th>
        <td>{(totalTime / 1000).toFixed(1)}</td>
      </tr>
      <tr>
        <th>Effective Time (seconds)</th>
        <td>{(effectiveTime / 1000).toFixed(1)}</td>
      </tr>
      <tr>
        <th>Time Effeciency (%)</th>
        <td>{((effectiveTime * 100) / totalTime).toFixed(1)}</td>
      </tr>
      <tr>
        <th>Optimal Speed (Character Per Minute)</th>
        <td>
          {((totalComposition - errorComposition) / (effectiveTime / (1000 * 60))).toFixed(1)}
        </td>
      </tr>
      <tr>
        <th>Average Speed (Character Per Minute)</th>
        <td>{(totalComposition / (totalTime / (1000 * 60))).toFixed(1)}</td>
      </tr>
    </>
  );
}

function KeyStatsRows({ keyProp: key, times }) {
  return (
    <>
      <tr>
        <th>{key}</th>
      </tr>
      <tr>
        <th>Keystroke count</th>
        <td>{times.length}</td>
      </tr>
      <tr>
        <th>Average Time (milliseconds)</th>
        <td>{(times.reduce((acc, cur) => acc + cur) / times.length).toFixed(0)}</td>
      </tr>
    </>
  );
}

export default function Stats() {
  const { historyRef } = useCharacterHistory();
  const [renderedHistory, setRenderedHistory] = useState(historyRef.current);
  const dateStatsRef = useRef();
  const sortedDatesRef = useRef();
  const [selectedDate, setSelectedDate] = useState(null);

  useLayoutEffect(() => {
    dateStatsRef.current = getDateStats(renderedHistory);
    sortedDatesRef.current = Object.keys(dateStatsRef.current).sort((a, b) => (a < b ? 1 : -1));
    const selectedDate = sortedDatesRef.current[0];
    setSelectedDate(selectedDate);
  }, [renderedHistory]);

  function handleChange(e) {
    setSelectedDate(e.target.value);
  }

  return (
    <div className="Stats">
      <button
        className="Stats__refresh"
        onClick={() => setRenderedHistory({ ...historyRef.current })}
      >
        refresh
      </button>
      {dateStatsRef.current ? (
        <>
          <select name="date" value={selectedDate} onChange={handleChange}>
            {sortedDatesRef.current.length === 0 ? null : <option value="all">All</option>}
            {sortedDatesRef.current.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
          <table>
            <tbody>
              {(() => {
                const s = getSelectedState(dateStatsRef.current, selectedDate);
                return s ? (
                  <>
                    <GeneralStatsRows {...s} />
                    {Object.keys(s.keys).map((key) => (
                      <KeyStatsRows key={key} keyProp={key} times={s.keys[key]} />
                    ))}
                  </>
                ) : null;
              })()}
            </tbody>
          </table>
        </>
      ) : (
        "press refresh to calculate stats..."
      )}
    </div>
  );
}

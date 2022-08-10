import React, { useState, useLayoutEffect, useRef } from "react";
import "./Stats.css";
import { radicalKeysToRadicals } from "../../lib/typing/key";
import { getStats, accumulateStats } from "../../lib/typing/compositionHistory";

/**
 * @param {Object.<string, Object.<string, CompositionHistory>>} history
 * @returns {Object.<string, CompositionHistoryStats>}
 */
function getDateStats(history) {
  const dates = Object.keys(history);
  return dates.reduce((acc, date) => {
    const dateHistory = history[date];
    const dateAllCharacterStats = Object.values(dateHistory).map((dateCharacterChs) => {
      const dateCharacterStats = dateCharacterChs.map((dateCharacterCh) =>
        getStats(dateCharacterCh)
      );
      return accumulateStats(dateCharacterStats);
    });
    acc[date] = accumulateStats(dateAllCharacterStats);
    return acc;
  }, {});
}

/**
 * @param {Object.<string, CompositionHistoryStats>} dateStats
 * @returns {CompositionHistoryStats}
 */
function getStatsAllDates(dateStats) {
  return accumulateStats(Object.values(dateStats));
}

/**
 * @param {Object.<string, CompositionHistoryStats>} dateStats
 * @param {string} selectedDate
 * @returns {CompositionHistoryStats|null} return `null` if either `dateStats` or `selectedDate` is not ready
 */
function getSelectedStats(dateStats, selectedDate) {
  if (dateStats && selectedDate) {
    return selectedDate === "all" ? getStatsAllDates(dateStats) : dateStats[selectedDate];
  }
  return null;
}

function GeneralStatsTable({ totalComposition, errorComposition, totalTime, effectiveTime }) {
  return (
    <table className="GeneralStats">
      <tbody>
        <tr>
          <th className="GeneralStats__help" title="成功從輸入列中清除的字數">
            總輸入字數
          </th>
          <th></th>
          <td>{totalComposition}</td>
        </tr>
        <tr>
          <th
            className="GeneralStats__help"
            title="成功從輸入列中清除的文字中，有一次以上組字錯誤的字數"
          >
            錯誤輸入字數
          </th>
          <th></th>
          <td>{errorComposition}</td>
        </tr>
        <tr>
          <th
            className="GeneralStats__help"
            title="成功從輸入列中清除的文字中，沒有組字錯誤的字數比例"
          >
            輸入正確率
          </th>
          <th>(%)</th>
          <td>{(((totalComposition - errorComposition) * 100) / totalComposition).toFixed(1)}</td>
        </tr>
        <tr>
          <th className="GeneralStats__help" title="所有按鍵輸入所花的時間">
            總輸入時間
          </th>
          <th>(秒)</th>
          <td>{(totalTime / 1000).toFixed(1)}</td>
        </tr>
        <tr>
          <th
            className="GeneralStats__help"
            title="扣除使用Backspace清除字母、以及組字錯誤所花費的時間"
          >
            有效輸入時間
          </th>
          <th>(秒)</th>
          <td>{(effectiveTime / 1000).toFixed(1)}</td>
        </tr>
        <tr>
          <th className="GeneralStats__help" title="總輸入時間中，有效輸入時間的比例">
            輸入時間效率
          </th>
          <th>(%)</th>
          <td>{((effectiveTime * 100) / totalTime).toFixed(1)}</td>
        </tr>
        <tr>
          <th className="GeneralStats__help" title="(輸入字數 - 錯誤輸入字數) / 有效輸入時間">
            平均最佳速度
          </th>
          <th>(字/分)</th>
          <td>
            {((totalComposition - errorComposition) / (effectiveTime / (1000 * 60))).toFixed(1)}
          </td>
        </tr>
        <tr>
          <th className="GeneralStats__help" title="輸入字數 / 總輸入時間">
            平均速度
          </th>
          <th>(字/分)</th>
          <td>{(totalComposition / (totalTime / (1000 * 60))).toFixed(1)}</td>
        </tr>
      </tbody>
    </table>
  );
}

function KeyStatsTable({ keysTimes }) {
  const keysAverageTime = Object.keys(keysTimes).reduce((acc, cur) => {
    const times = keysTimes[cur];
    acc[cur] = Math.floor(times.reduce((acc, cur) => acc + cur) / times.length);
    return acc;
  }, {});
  return (
    <table className="KeyStats">
      <tbody>
        <tr>
          <th colSpan={2}>按鍵</th>
          <th>輸入次數</th>
          <th>平均輸入時間 (毫杪)</th>
        </tr>
        {Object.keys(keysAverageTime)
          .sort((key1, key2) => keysAverageTime[key2] - keysAverageTime[key1])
          .map((key) => (
            <tr key={key}>
              <td>{key === "Space" ? "" : radicalKeysToRadicals([key])}</td>
              <td>{key}</td>
              <td>{keysTimes[key].length}</td>
              <td>{keysAverageTime[key]}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

/**
 * @param {Object} props 
 * @param {Object.<string, Object.<string, CompositionHistory>>} props.history
 */
export default function Stats({ history }) {
  const [renderedHistory, setRenderedHistory] = useState(history);
  const dateStatsRef = useRef();
  const sortedDatesRef = useRef();
  const [selectedDate, setSelectedDate] = useState(null);

  useLayoutEffect(() => {
    dateStatsRef.current = getDateStats(renderedHistory);
    sortedDatesRef.current = Object.keys(dateStatsRef.current).sort((a, b) => (a < b ? 1 : -1));
    const firstSortedDate = sortedDatesRef.current[0];
    if (firstSortedDate) setSelectedDate(firstSortedDate);
  }, [renderedHistory]);

  function handleChange(e) {
    setSelectedDate(e.target.value);
  }

  const selectedStats = getSelectedStats(dateStatsRef.current, selectedDate);

  return (
    <div className="Stats">
      <div className="Stats__toolbar">
        <button
          className="Stats__refresh"
          onClick={() => setRenderedHistory({ ...history })}
        >
          重新整理
        </button>
        {dateStatsRef.current && Object.keys(dateStatsRef.current).length ? (
          <label>
            選擇日期 &nbsp;
            <select name="date" value={selectedDate} onChange={handleChange}>
              {sortedDatesRef.current.length === 0 ? null : <option value="all">全部</option>}
              {sortedDatesRef.current.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      {selectedStats ? (
        <>
          <h3>一般</h3>
          <GeneralStatsTable {...selectedStats} />
          <h3>按鍵</h3>
          <KeyStatsTable keysTimes={selectedStats.keysTimes} />
        </>
      ) : (
        "無歷史資料"
      )}
    </div>
  );
}

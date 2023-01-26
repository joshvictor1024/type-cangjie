import React, {useState, useEffect, useRef} from "react";
import * as d3 from "d3";
import * as stats from "../../lib/typing/stats.js";
import "./Graph.css";

const RECENT_STATS_PERIOD = 5000; // ms
const UPDATE_INTERVAL = 1; // s
const DATAPOINT_LENGTH = 60;
// Adds slack then trim to `DATAPOINT_LENGTH` to keep length of `datapoints` consistent,
// since interval of `setInterval` fluctuates.
const DATAPOINT_MAX_AGE = (UPDATE_INTERVAL * 1000) * (DATAPOINT_LENGTH + 2); // ms

/** @typedef {import('../../lib/typing/stats.js').Stats} Stats */

/**
 * @param {Object} props
 * @param {(number) => Stats} props.getRecentStats
 */
export default function Graph({getRecentStats}) {
  const [datapoints, setDatapoints] = useState([{cpm: 0, optimalCpm: 0, timestamp: Date.now()}]);
  const [doSvgUpdate, setDoSvgUpdate] = useState(true);
  useEffect(() => {
    const i = setInterval(() => {
      const recentStats = getRecentStats(RECENT_STATS_PERIOD);
      setDatapoints((c) => {
        // Replace `NaN` with `0`.
        const averageCpm = stats.getAverageSpeed(recentStats) || 0;
        const optimalAverageCpm = stats.getOptimalAverageSpeed(recentStats) || 0;
        // Delete datapoints older than `DATAPOINT_MAX_AGE`.
        const removeOld = c.filter((v) => Date.now() - v.timestamp < DATAPOINT_MAX_AGE);
        // Trim to length, and append new datapoint.
        const newC = removeOld.slice(-(DATAPOINT_LENGTH - 1)).concat({cpm: averageCpm, optimalCpm: optimalAverageCpm, timestamp: Date.now()});
        return newC;
      });
    }, UPDATE_INTERVAL * 1000);
    return () => {
      clearInterval(i);
    }
  }, []);

  const toggleSvgUpdateButtonRef = useRef(null);
  const svgRef = useRef(null);
  useEffect(() => {
    if (doSvgUpdate === false) {
      return;
    }

    // Set up SVG coordinates.

    const width = svgRef.current.clientWidth ?? 0;
    const height = (svgRef.current.clientHeight - toggleSvgUpdateButtonRef.current.clientHeight) ?? 0;
    const margin = {top: height * 0.05, right: width * 0.05, bottom: height * 0.18, left: width * 0.1};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);

    // Set up domain (data) and range (coordinates).

    const xValue = (v) => v.timestamp;
    const yValue = (v) => v.cpm;
    const yOptValue = (v) => v.optimalCpm;
    const xScale = d3.scaleTime()
      .domain(d3.extent(datapoints, xValue))
      .range([0, innerWidth]);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(datapoints, yOptValue)+10])
      .range([innerHeight, 0]);

    // Replace with new `g` to draw in.

    svg.select("g").remove();
    const g = svg.append("g");

    // Draw area graph.

    const areaGenerator = d3.area()
      .x((v) => xScale(xValue(v)))
      .y0(innerHeight)
      .y1((v) => yScale(yValue(v)))
      .curve(d3.curveBasis);
    const areaOptGenerator = d3.area()
      .x((v) => xScale(xValue(v)))
      .y0(innerHeight)
      .y1((v) => yScale(yOptValue(v)))
      .curve(d3.curveBasis);
    const gArea = g.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    gArea.append("path")
      .attr("class", "AreaOptimal")
      .attr("d", areaOptGenerator(datapoints));
    gArea.append("path")
      .attr("class", "Area")
      .attr("d", areaGenerator(datapoints));

    // Draw axes.

    const xAxis = d3.axisBottom(xScale)
      .tickFormat((x) => d3.timeFormat("%S")(x)) // seconds
      .tickSizeInner(-innerHeight) // gridlines
      .tickSizeOuter(0); // Remove ending line.
    const yAxis = d3.axisLeft(yScale)
      .tickSizeInner(-innerWidth) // gridlines
      .tickSizeOuter(0); // Remove ending line.
    const gXAxis = g.append("g")
      .attr("class", "XAxis")
      .attr("transform", `translate(${margin.left}, ${innerHeight + margin.top})`)
      .call(xAxis);
    gXAxis.append("text")
      .attr("class", "XLabel")
      .attr("transform", `translate(${innerWidth / 2}, ${margin.bottom / 2})`)
      .text("時間軸 (秒)");
    const gYAxis = g.append("g")
      .attr("class", "YAxis")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .call(yAxis);
    gYAxis.append("text")
      .attr("class", "YLabel")
      .attr("transform", `translate(${margin.left / 2}, ${innerHeight + margin.bottom / 2})`)
      .text("速度 (字/分)");

    // Draw Legends.

    const gLegends = g.append("g")
      .attr("transform", `translate(${margin.left + 12}, ${margin.top + 12})`);

    const legendSquareSize = 12;
    const legendSquareMargin = 6;
    gLegends.append("rect")
      .attr("class", "Legend__background")
      .attr("width", 80)
      .attr("height", 2 * legendSquareSize + 3 * legendSquareMargin)
    gLegends.append("rect")
      .attr("class", "Legend__colorArea")
      .attr("width", legendSquareSize)
      .attr("height", legendSquareSize)
      .attr("transform", `translate(${legendSquareMargin}, ${legendSquareMargin})`);
    gLegends.append("rect")
      .attr("class", "Legend__colorAreaOptimal")
      .attr("width", legendSquareSize)
      .attr("height", legendSquareSize)
      .attr("transform", `translate(${legendSquareMargin}, ${2 * legendSquareMargin + legendSquareSize})`);
    gLegends.append("text")
      .attr("class", "Legend__labelArea")
      .text("速度")
      .attr("transform", `translate(${2 * legendSquareMargin + legendSquareSize}, ${legendSquareMargin + legendSquareSize})`);
    gLegends.append("text")
      .attr("class", "Legend__labelAreaOptimal")
      .text("最佳速度")
      .attr("transform", `translate(${2 * legendSquareMargin + legendSquareSize}, ${2 * legendSquareMargin + 2 * legendSquareSize})`);
  }, [doSvgUpdate, datapoints]);
  
  return (
    <div className="Graph">
      <button ref={toggleSvgUpdateButtonRef} onClick={() => setDoSvgUpdate((c) => !c)}>{doSvgUpdate ? "暫停圖表更新" : "恢復圖表更新"}</button>
      <svg ref={svgRef}></svg>
    </div>
  );
}

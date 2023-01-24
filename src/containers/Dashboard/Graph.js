import React, {useState, useEffect} from "react";
import "./Graph.css";

export default function Graph({getRecentStats}) {
  const [recentStats, setRecentStats] = useState(null);
  useEffect(() => {
    const i = setInterval(() => setRecentStats(getRecentStats), 1000);
    return () => {
      clearInterval(i);
    }
  }, [getRecentStats]);
  
  return (
    <div className="Graph">
      <pre>{JSON.stringify(recentStats, null, 2)}</pre>
    </div>
  );
}

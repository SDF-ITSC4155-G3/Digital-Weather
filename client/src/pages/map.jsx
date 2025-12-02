import React, {useState, useEffect} from 'react';
import { getAuthHeaders } from '../utils/auth.js';
import "./Map.css";

function Map() {

  const [data, setData] = useState({ hello_world: [] });
  const gridSize = 100;

useEffect(() => {
  // Prefer relative URL so the CRA dev server proxy (package.json) can forward to Flask.
  // If that fails, try the absolute backend URL to aid debugging.
  const urls = ["/hello-world", "http://127.0.0.1:5000/hello-world"];

  const tryFetch = async () => {
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
        console.log("fetched from", url, json);
        return;
      } catch (err) {
        console.warn(`fetch failed for ${url}:`, err.message || err);
      }
    }
    console.error("All fetch attempts failed");
  };

  tryFetch();

  const interval = setInterval(tryFetch, 5000); // Fetch every 5 seconds

  return () => clearInterval(interval);
}, []);


  const getColor = (value) => {
    const colors = [
      '#d3d3d3', // 0 - light grey
      '#ffff99', // 1 - light yellow
      '#ffcc00', // 2 - yellow-orange
      '#ff6600', // 3 - orange-red
      '#ff0000', // 4 - red
      '#800080', // 5 - purple
    ];
    return colors[Math.max(0, Math.min(5, Number(value)))];
  };

  return (
    <div className="page map-page">
      <header className="site-header site-header--middle">
        <h1 className="site-title">Digital Weather Map - UNC Charlotte</h1>
        <p className="site-subtitle">
          Live visualization of grid-based weather data over campus.
        </p>
      </header>

      <div className="map-card page-card">
        <div
          className="tileMap"
          style={{
            position: "relative",
            backgroundImage: "url(/UNCCMap.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {data.hello_world && data.hello_world.length > 0
            ? data.hello_world.map((value, i) => {
                const row = Math.floor(i / gridSize);
                const col = i % gridSize;
                return (
                  <div
                    key={i}
                    className="tile"
                    style={{
                      backgroundColor: getColor(value),
                      top: `${row * (100 / gridSize)}%`,
                      left: `${col * (100 / gridSize)}%`,
                    }}
                  />
                );
              })
            : null}
        </div>

        {/* NEW: legend */}
        <div className="map-legend">
          <span className="legend-title">User density</span>
          <div className="legend-rows">
            <div className="legend-row">
              <span className="legend-swatch legend-swatch--1" />
              <span className="legend-text">Very low</span>
            </div>
            <div className="legend-row">
              <span className="legend-swatch legend-swatch--2" />
              <span className="legend-text">Low</span>
            </div>
            <div className="legend-row">
              <span className="legend-swatch legend-swatch--3" />
              <span className="legend-text">Medium</span>
            </div>
            <div className="legend-row">
              <span className="legend-swatch legend-swatch--4" />
              <span className="legend-text">High</span>
            </div>
            <div className="legend-row">
              <span className="legend-swatch legend-swatch--5" />
              <span className="legend-text">Very high</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map
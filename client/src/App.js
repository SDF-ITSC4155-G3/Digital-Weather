import React, {useState, useEffect} from 'react'

function App() {

  const [data, setData] = useState({ hello_world: [] });
  const gridSize = 10;

useEffect(() => {
  // Prefer relative URL so the CRA dev server proxy (package.json) can forward to Flask.
  // If that fails, try the absolute backend URL to aid debugging.
  const urls = ["/hello-world", "http://127.0.0.1:5000/hello-world"];

  const tryFetch = async () => {
    for (const url of urls) {
      try {
        const res = await fetch(url);
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
    <div className="App">
      <header className="site-header site-header--middle">
        <h1 className="site-title">Digital Weather Map - UNC Charlotte</h1>
      </header>

      <div
        className="tileMap"
        style={{
          position: 'relative',          
          width: '700px',                 // width of the map
          height: '700px',                // height of the map
          backgroundImage: 'url(/UNCCMap.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {data.hello_world && data.hello_world.length > 0 ? (
          data.hello_world.map((value, i) => {
            
            
            
            
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            return (
              <div
                key={i}
                className="tile"
                style={{
                  backgroundColor: getColor(value),
                  width: `${100 / gridSize}%`,
                  height: `${100 / gridSize}%`,
                  position: 'absolute',
                  top: `${row * (100 / gridSize)}%`,
                  left: `${col * (100 / gridSize)}%`,
                  opacity: 0.5,
                }}
              ></div>
            );



          
          })
        ) : null}
      </div>




      <main className="site-content">
        {(typeof data.hello_world === 'undefined') ? (
          <p>Loading...</p>
        ) : (
          data.hello_world.map((word, i) => (
            <p key={i}>{word}</p>
          ))
        )}
      </main>
    </div>
  )
}

export default App
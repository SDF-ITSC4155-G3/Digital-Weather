import React, {useState, useEffect} from 'react'

function App() {

  const [data, setData] = useState([{}]);

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

  return (    
  
    <div>
      
      {(typeof data.hello_world === 'undefined') ? (
        <p>Loading...</p>
      ) : (
        data.hello_world.map((word, i) => (
          <p key={i}>{word}</p>
        ))
      )}
    </div>
  )
}

export default App
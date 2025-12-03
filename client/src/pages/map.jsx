import React, {useState, useEffect} from 'react';
import { getAuthHeaders, getCurrentUser } from '../utils/auth.js';
import ReviewModal from '../components/ReviewModal.jsx';
import "./Map.css";

function Map() {

  const [data, setData] = useState({ hello_world: [] });
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showPinForm, setShowPinForm] = useState(false);
  const [newPinLocation, setNewPinLocation] = useState(null);
  const [pinTitle, setPinTitle] = useState('');
  const [pinDescription, setPinDescription] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [editingPin, setEditingPin] = useState(null);
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

useEffect(() => {
  fetchPins();
  loadCurrentUser();
}, []);

const loadCurrentUser = async () => {
  const user = await getCurrentUser();
  setCurrentUser(user);
};

const fetchPins = async () => {
  try {
    const res = await fetch('/api/pins');
    if (!res.ok) throw new Error('Failed to fetch pins');
    const data = await res.json();
    setPins(data);
  } catch (err) {
    console.error('Error fetching pins:', err);
  }
};

const handleMapClick = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  setNewPinLocation({ latitude: y, longitude: x });
  setEditingPin(null);
  setShowPinForm(true);
};

const handleEditPin = (pin) => {
  setEditingPin(pin);
  setPinTitle(pin.title);
  setPinDescription(pin.description || '');
  setShowPinForm(true);
};

const handleCreatePin = async (e) => {
  e.preventDefault();

  if (!pinTitle.trim()) {
    alert('Please enter a title for the pin');
    return;
  }

  try {
    if (editingPin) {
      // Update existing pin
      const res = await fetch(`/api/pins/${editingPin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          title: pinTitle,
          description: pinDescription
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update pin');
      }
    } else {
      // Create new pin
      const res = await fetch('/api/pins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          latitude: newPinLocation.latitude,
          longitude: newPinLocation.longitude,
          title: pinTitle,
          description: pinDescription
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create pin');
      }
    }

    setPinTitle('');
    setPinDescription('');
    setShowPinForm(false);
    setNewPinLocation(null);
    setEditingPin(null);
    fetchPins();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

const handleCancelPin = () => {
  setShowPinForm(false);
  setNewPinLocation(null);
  setPinTitle('');
  setPinDescription('');
  setEditingPin(null);
};

const handleDeletePin = async (pinId) => {
  if (!window.confirm('Are you sure you want to delete this pin?')) return;

  try {
    const res = await fetch(`/api/pins/${pinId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to delete pin');
    }

    fetchPins();
    setSelectedPin(null);
  } catch (err) {
    alert('Error: ' + err.message);
  }
};


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
        <div className="header-content">
          <div>
            <h1 className="site-title">Digital Weather Map - UNC Charlotte</h1>
            <p className="site-subtitle">
              Live visualization of grid-based weather data over campus.
              Click on the map to place a pin!
            </p>
          </div>
          {currentUser && (
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span className="username">{currentUser.username}</span>
            </div>
          )}
        </div>
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
          onClick={handleMapClick}
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

          {/* Render pins */}
          {pins.map((pin) => (
            <div
              key={pin.id}
              className="map-pin"
              style={{
                top: `${pin.latitude}%`,
                left: `${pin.longitude}%`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPin(pin);
              }}
              title={pin.title}
            >
              📍
            </div>
          ))}

          {/* Show preview pin while creating */}
          {newPinLocation && (
            <div
              className="map-pin preview-pin"
              style={{
                top: `${newPinLocation.latitude}%`,
                left: `${newPinLocation.longitude}%`,
              }}
            >
              📍
            </div>
          )}
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

      {/* Pin creation form */}
      {showPinForm && (
        <div className="pin-form-overlay" onClick={handleCancelPin}>
          <div className="pin-form-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingPin ? 'Edit Pin' : 'Create New Pin'}</h3>
            <form onSubmit={handleCreatePin}>
              <div className="form-group">
                <label htmlFor="pinTitle">Title:</label>
                <input
                  type="text"
                  id="pinTitle"
                  value={pinTitle}
                  onChange={(e) => setPinTitle(e.target.value)}
                  placeholder="Enter pin title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="pinDescription">Description:</label>
                <textarea
                  id="pinDescription"
                  value={pinDescription}
                  onChange={(e) => setPinDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                  rows="3"
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn-submit">{editingPin ? 'Update Pin' : 'Create Pin'}</button>
                <button type="button" className="btn-cancel" onClick={handleCancelPin}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review modal */}
      {selectedPin && (
        <ReviewModal
          pin={selectedPin}
          currentUser={currentUser}
          onClose={() => setSelectedPin(null)}
          onReviewSubmitted={fetchPins}
          onEditPin={handleEditPin}
          onDeletePin={handleDeletePin}
        />
      )}
    </div>
  );
}

export default Map
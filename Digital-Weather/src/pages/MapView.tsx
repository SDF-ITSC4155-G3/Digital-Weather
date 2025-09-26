import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Use MapContainer directly (ensure react-leaflet version matches React runtime)
const MapContainerAny = MapContainer as unknown as any;

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Device {
  type: string;
  geometry: { type: string; coordinates: [number, number] };
  properties: { id: number };
}

export default function MapView() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Array<any>>([]);
  const [noteText, setNoteText] = useState<string>("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const markerRefs = useRef<Record<number, any>>({});

  // Fetch devices - extracted so we can call it after add and via a Refresh button
  async function fetchDevices() {
    try {
      const geojson = await invoke("get_devices_cmd");
      console.debug("get_devices_cmd result:", geojson);
      const features = (geojson as any).features || [];
      setDevices(features);
      setErrorMsg(null);
      // Ensure Leaflet recalculates size if needed (fixes blank map issues)
      if (mapInstance && typeof mapInstance.invalidateSize === 'function') {
        setTimeout(() => mapInstance.invalidateSize(), 200);
      }
      // Auto-center map on first device
      if (features.length > 0 && mapInstance && typeof mapInstance.setView === 'function') {
        const first = features[0];
        const lat = first.geometry.coordinates[1];
        const lng = first.geometry.coordinates[0];
        try {
          setTimeout(() => mapInstance.setView([lat, lng], 10), 300);
        } catch (e) {
          console.warn('Failed to set map view:', e);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch devices:", err);
      setDevices([]);
      setErrorMsg(String(err));
    }
  }

  useEffect(() => { fetchDevices(); }, []);

  // Ensure map invalidates size on window resize and when page becomes visible
  useEffect(() => {
    const onResize = () => {
      if (mapInstance && typeof mapInstance.invalidateSize === 'function') {
        mapInstance.invalidateSize();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && mapInstance && typeof mapInstance.invalidateSize === 'function') {
        setTimeout(() => mapInstance.invalidateSize(), 200);
      }
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [mapInstance]);

  const handleAddDevice = async () => {
    // Validate coordinates
    if (!isFinite(lat) || !isFinite(lng)) {
      console.warn("Invalid coordinates, not adding device:", lat, lng);
      return;
    }

    try {
      const addedId = await invoke("add_device_cmd", { lat, lng });
      console.debug("add_device_cmd returned id:", addedId);
      await fetchDevices();
    } catch (err) {
      console.error("Failed to add device:", err);
      setErrorMsg(String(err));
    }
  };

  // Notes CRUD helpers
  const fetchNotes = async (deviceId: number) => {
    try {
      const res = await invoke("get_notes_for_device", { deviceId });
      setNotes(res as any[] || []);
    } catch (e) {
      console.error("Failed to fetch notes:", e);
      setNotes([]);
    }
  };

  const handleSelectDevice = async (id: number) => {
    setSelectedDeviceId(id);
    await fetchNotes(id);
    // Pan map to marker and open popup if possible
    const marker = markerRefs.current[id];
    if (marker && mapInstance) {
      try {
        const latlng = marker.getLatLng();
        mapInstance.setView([latlng.lat, latlng.lng], 13);
        // Open the marker's popup if ref supports it
        if (typeof marker.openPopup === 'function') {
          setTimeout(() => marker.openPopup(), 50);
        }
      } catch (e) {
        console.warn('Failed to pan/open popup for marker:', e);
      }
    }
  };

  const handleAddNote = async () => {
    if (!selectedDeviceId) return;
    if (!noteText.trim()) return;
    try {
      const newId = await invoke("add_note_cmd", { deviceId: selectedDeviceId, text: noteText });
      setNoteText("");
      await fetchNotes(selectedDeviceId);
    } catch (e) {
      console.error("Failed to add note:", e);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await invoke("delete_note_cmd", { noteId: id });
      if (selectedDeviceId) await fetchNotes(selectedDeviceId);
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  };

  const handleEditNote = (id: number, text: string) => {
    setEditingNoteId(id);
    setNoteText(text);
  };

  const handleUpdateNote = async () => {
    if (!editingNoteId) return;
    try {
      await invoke("update_note_cmd", { noteId: editingNoteId, text: noteText });
      setEditingNoteId(null);
      setNoteText("");
      if (selectedDeviceId) await fetchNotes(selectedDeviceId);
    } catch (e) {
      console.error("Failed to update note:", e);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="number"
          placeholder="Latitude"
          value={lat}
          onChange={e => setLat(parseFloat(e.target.value))}
          style={{ marginRight: '0.5rem' }}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={lng}
          onChange={e => setLng(parseFloat(e.target.value))}
          style={{ marginRight: '0.5rem' }}
        />
        <button onClick={handleAddDevice}>Add Device</button>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <MapContainerAny
        center={[0, 0] as any}
        zoom={2}
        style={{ height: "500px", width: "100%" }}
        whenCreated={(m: any) => setMapInstance(m)}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {devices.map(device => {
              const id = device.properties.id;
              return (
                <Marker
                  key={id}
                  position={[device.geometry.coordinates[1], device.geometry.coordinates[0]]}
                  eventHandlers={{
                    click: () => handleSelectDevice(id),
                  }}
                  ref={ref => { if (ref) markerRefs.current[id] = ref; }}
                >
                  <Popup>
                    <div>
                      <div>Device #{id}</div>
                      <div style={{ marginTop: 6 }}>
                        <button onClick={() => handleSelectDevice(id)}>View Notes</button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainerAny>
        </div>

        <div style={{ width: 360, borderLeft: '1px solid #ddd', paddingLeft: 12 }}>
          <h3>Devices</h3>
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {devices.length === 0 && <div>No devices</div>}
            {devices.map(d => (
              <div key={d.properties.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 6, borderBottom: '1px solid #eee' }}>
                <div>
                  <div>Device #{d.properties.id}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{d.geometry.coordinates[1].toFixed(4)}, {d.geometry.coordinates[0].toFixed(4)}</div>
                </div>
                <div>
                  <button onClick={() => handleSelectDevice(d.properties.id)} style={{ marginRight: 6 }}>Select</button>
                </div>
              </div>
            ))}
          </div>

          <hr />

          <h3>Notes</h3>
          {selectedDeviceId ? (
            <div>
              <div style={{ marginBottom: 8 }}><strong>Device #{selectedDeviceId}</strong></div>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} style={{ width: '100%' }} />
              <div style={{ marginTop: 6 }}>
                {editingNoteId ? (
                  <>
                    <button onClick={handleUpdateNote} style={{ marginRight: 6 }}>Save</button>
                    <button onClick={() => { setEditingNoteId(null); setNoteText(''); }}>Cancel</button>
                  </>
                ) : (
                  <button onClick={handleAddNote}>Add Note</button>
                )}
              </div>

              <div style={{ marginTop: 12, maxHeight: 200, overflow: 'auto' }}>
                {notes.length === 0 && <div>No notes</div>}
                {notes.map(n => (
                  <div key={n.id} style={{ borderBottom: '1px solid #eee', padding: 6 }}>
                    <div style={{ fontSize: 12, color: '#666' }}>{n.created_at}</div>
                    <div style={{ marginTop: 4 }}>{n.text}</div>
                    <div style={{ marginTop: 6 }}>
                      <button onClick={() => handleEditNote(n.id, n.text)} style={{ marginRight: 6 }}>Edit</button>
                      <button onClick={() => handleDeleteNote(n.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>Select a device to view/add notes</div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => fetchDevices()} style={{ marginRight: 8 }}>Refresh Devices</button>
        {errorMsg && <span style={{ color: 'red' }}>Error: {errorMsg}</span>}
      </div>
      {/* Debug: show raw devices returned */}
      <pre style={{ marginTop: 12, maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(devices, null, 2)}</pre>
    </div>
  );
}

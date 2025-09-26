import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
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

      <MapContainerAny
        center={[0, 0] as any}
        zoom={2}
        style={{ height: "500px", width: "100%" }}
        whenCreated={(m: any) => setMapInstance(m)}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {devices.map(device => (
          <Marker
            key={device.properties.id}
            position={[device.geometry.coordinates[1], device.geometry.coordinates[0]]} // lat, lng
          />
        ))}
  </MapContainerAny>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => fetchDevices()} style={{ marginRight: 8 }}>Refresh Devices</button>
        {errorMsg && <span style={{ color: 'red' }}>Error: {errorMsg}</span>}
      </div>
      {/* Debug: show raw devices returned */}
      <pre style={{ marginTop: 12, maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(devices, null, 2)}</pre>
    </div>
  );
}

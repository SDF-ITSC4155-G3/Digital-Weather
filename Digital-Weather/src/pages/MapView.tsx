import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Device {
  properties: { id: number; name: string };
  geometry: { type: string; coordinates: number[] };
}

export default function MapView() {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const geojson: any = await invoke("get_devices");
        if (geojson.features && Array.isArray(geojson.features)) {
          setDevices(geojson.features);
        }
      } catch (e) {
        console.error("Failed to fetch devices:", e);
      }
    };
    fetchDevices();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Devices Map</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((d) => (
          <div key={d.properties.id} className="border p-4 rounded shadow">
            <p className="font-bold">{d.properties.name}</p>
            <p>
              Coordinates: {d.geometry.coordinates[1]}, {d.geometry.coordinates[0]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

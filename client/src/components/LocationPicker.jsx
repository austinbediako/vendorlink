import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultPosition = [5.6037, -0.1870]; // Accra, Ghana

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&limit=1`);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = (data.features || []).find((f) => f.properties.countrycode === 'GH');
    if (!feature) return null;
    const p = feature.properties;
    return [p.name, p.district || p.city, p.state, 'Ghana']
      .filter((v, i, arr) => v && arr.indexOf(v) === i)
      .join(', ') || null;
  } catch {
    return null;
  }
}

function MapClickHandler({ onSelect, setGeocoding }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setGeocoding(true);
      const locationName = await reverseGeocode(lat, lng);
      setGeocoding(false);
      onSelect(lat, lng, locationName);
    },
  });
  return null;
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, Math.max(map.getZoom(), 13));
  }, [position, map]);
  return null;
}

export function LocationPicker({ latitude, longitude, onChange }) {
  const [position, setPosition] = useState([
    latitude || defaultPosition[0],
    longitude || defaultPosition[1],
  ]);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleSelect = (lat, lng, locationName) => {
    setPosition([lat, lng]);
    onChange(lat, lng, locationName);
  };

  return (
    <div className="space-y-2">
      <div className="relative h-64 rounded-lg border border-gray-300 overflow-hidden">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={markerIcon} />
          <RecenterMap position={position} />
          <MapClickHandler onSelect={handleSelect} setGeocoding={setGeocoding} />
        </MapContainer>
        {geocoding && (
          <div className="absolute top-2 right-2 bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow">
            Looking up address...
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500">Click on the map to select a location. The address will be filled automatically if available.</p>
      {latitude && longitude && (
        <p className="text-xs text-gray-600">
          Selected: {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
        </p>
      )}
    </div>
  );
}

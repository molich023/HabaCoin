import { MapContainer, TileLayer, Polygon, Circle } from 'react-leaflet';
import DOMPurify from 'dompurify'; // Essential for sanitization

export default function HabaMap({ hotspots, activeHustlers }) {
  return (
    <MapContainer center={[-1.286389, 36.817223]} zoom={13} className="h-96 w-full rounded-3xl">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {hotspots.map(spot => (
        <Circle 
          center={spot.coords} 
          radius={500} 
          pathOptions={{ color: 'lime', fillColor: 'lime', fillOpacity: 0.2 }}
        >
          {/* We sanitize the name to prevent script injection */}
          <Popup>{DOMPurify.sanitize(spot.name)} - 2x Multiplier!</Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}

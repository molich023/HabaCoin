import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import DOMPurify from 'dompurify';

interface Hotspot {
  id: string | number;
  coords: [number, number];
  name: string;
}

interface HabaMapProps {
  hotspots: Hotspot[];
  activeHustlers?: number;
}

export default function HabaMap({ hotspots = [], activeHustlers }: HabaMapProps) {
  // Ensure Map element doesn't break if server variables resolve to an unexpected payload array type
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];

  return (
    <MapContainer 
      center={[-1.286389, 36.817223]} 
      zoom={13} 
      className="h-96 w-full rounded-3xl z-0"
    >
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {safeHotspots.map((spot) => {
        if (!spot || !spot.coords) return null;
        
        // Sanitize string content thoroughly to block Cross-Site Scripting (XSS) via database overrides
        const sanitizedContent = DOMPurify.sanitize(spot.name || "Unknown Asset Base");

        return (
          <Circle 
            key={spot.id}
            center={spot.coords} 
            radius={500} 
            pathOptions={{ color: 'lime', fillColor: 'lime', fillOpacity: 0.2 }}
          >
            <Popup>
              <div dangerouslySetInnerHTML={{ __html: `${sanitizedContent} - <strong>2x Multiplier!</strong>` }} />
            </Popup>
          </Circle>
        );
      })}
    </MapContainer>
  );
}

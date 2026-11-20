import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ApiSpot } from "@/shared/lib/api";
import { hasCoordinates, spotStatus } from "../utils/spotPresentation";

export function StudySpotsMap({ spots, onSelect }: { spots: ApiSpot[]; onSelect: (spot: ApiSpot) => void }) {
  const valid = spots.filter(hasCoordinates);
  const center = valid[0] ?? { latitude: 40.1075, longitude: -88.2272 };
  return <MapContainer center={[center.latitude, center.longitude]} zoom={15} style={{ width: "100%", height: "100%" }}>
    <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
    {valid.map(spot => { const status = spotStatus(spot); return <CircleMarker key={spot.id} center={[spot.latitude, spot.longitude]} radius={10} pathOptions={{ color: "white", weight: 2, fillColor: status.color, fillOpacity: 1 }} eventHandlers={{ click: () => onSelect(spot) }}>
      <Popup><button type="button" onClick={() => onSelect(spot)}>{spot.name}<br />{status.label} · {spot.activeCheckInCount} checked in</button></Popup>
    </CircleMarker>; })}
  </MapContainer>;
}

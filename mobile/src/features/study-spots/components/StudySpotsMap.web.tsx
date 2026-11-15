import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { mockStudySpots, FAKE_USER_LOCATION } from "@/shared/data/mockStudySpots";

export function StudySpotsMap() {
  return (
    <MapContainer
      center={[FAKE_USER_LOCATION.latitude, FAKE_USER_LOCATION.longitude]}
      zoom={15}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {mockStudySpots.map((spot) => (
        <CircleMarker
          key={spot.id}
          center={[spot.location.latitude, spot.location.longitude]}
          radius={10}
        >
          <Popup>
            <strong>{spot.name}</strong>
            <br />
            {spot.area}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
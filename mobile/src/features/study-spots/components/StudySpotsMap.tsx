import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";
import type { ApiSpot } from "@/shared/lib/api";
import { hasCoordinates, spotStatus } from "../utils/spotPresentation";

export function StudySpotsMap({ spots, onSelect }: { spots: ApiSpot[]; onSelect: (spot: ApiSpot) => void }) {
  const valid = spots.filter(hasCoordinates);
  const center = valid[0] ?? { latitude: 40.1075, longitude: -88.2272 };
  return <MapView style={styles.map} initialRegion={{ latitude: center.latitude, longitude: center.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
    {valid.map(spot => <Marker key={spot.id} coordinate={{ latitude: spot.latitude, longitude: spot.longitude }} pinColor={spotStatus(spot).color} title={spot.name} description={`${spotStatus(spot).label} · ${spot.activeCheckInCount} checked in`} onPress={() => onSelect(spot)} />)}
  </MapView>;
}
const styles = StyleSheet.create({ map: { flex: 1 } });

// mobile/src/features/study-spots/components/StudySpotsMap.tsx
import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";
import { mockStudySpots, FAKE_USER_LOCATION } from "@/shared/data/mockStudySpots";

export function StudySpotsMap() {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        ...FAKE_USER_LOCATION,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      {mockStudySpots.map((spot) => (
        <Marker
          key={spot.id}
          coordinate={spot.location}
          title={spot.name}
          description={spot.area}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
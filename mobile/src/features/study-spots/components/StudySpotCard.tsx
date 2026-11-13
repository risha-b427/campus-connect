import { StyleSheet, Text, View } from "react-native";

import type { Spot } from "../api";

type StudySpotCardProps = {
  spot: Spot;
};

function peopleHereText(count: number): string {
  if (count === 0) return "No one here now";
  if (count === 1) return "1 person here now";
  return `${count} people here now`;
}

export default function StudySpotCard({ spot }: StudySpotCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{spot.name}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{spot.spotType}</Text>
        </View>
      </View>

      <Text style={styles.building}>{spot.building}</Text>

      {spot.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {spot.description}
        </Text>
      ) : null}

      <Text style={styles.peopleHere}>{peopleHereText(spot.activeCheckInCount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE2EA",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 19,
    fontWeight: "700",
    color: "#172033",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#E0E7FF",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#172033",
  },
  building: {
    marginTop: 10,
    fontSize: 16,
    color: "#475569",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: "#475569",
  },
  peopleHere: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#172033",
  },
});

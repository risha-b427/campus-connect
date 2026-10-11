import { StyleSheet, Text, View } from "react-native";
import type { StudySpot } from "../data/studySpots";

type StudySpotCardProps = {
  spot: StudySpot;
};

export default function StudySpotCard({
  spot,
}: StudySpotCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{spot.name}</Text>

        <View
          style={[
            styles.badge,
            spot.isFree ? styles.freeBadge : styles.paidBadge,
          ]}
        >
          <Text style={styles.badgeText}>
            {spot.isFree ? "Free" : "Paid"}
          </Text>
        </View>
      </View>

      <Text style={styles.building}>{spot.building}</Text>
      <Text style={styles.hours}>Hours: {spot.hours}</Text>
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
  },
  freeBadge: {
    backgroundColor: "#DCFCE7",
  },
  paidBadge: {
    backgroundColor: "#FEF3C7",
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
  hours: {
    marginTop: 8,
    fontSize: 14,
    color: "#475569",
  },
});

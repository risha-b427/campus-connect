import { StyleSheet, Text, View } from "react-native";

import type { StudySpot } from "@/shared/data/mockStudySpots";

type StudySpotCardProps = {
  spot: StudySpot;
};

export default function StudySpotCard({ spot }: StudySpotCardProps) {
  const initials = spot.name.replace(/^Sample\s+/, "").split(/\s+/)
    .slice(0, 2).map((word) => word[0]).join("");

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.buildingIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.identity}>
          <Text style={styles.building}>{spot.name}</Text>
          <Text style={styles.name} accessibilityRole="header">
            {spot.area ?? "Study space"}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.hoursGroup}>
          <Text style={styles.label}>HOURS</Text>
          <Text style={styles.hours}>{spot.hours}</Text>
        </View>
        <View style={[styles.badge, spot.isFree ? styles.freeBadge : styles.paidBadge]}>
          <View style={[styles.dot, spot.isFree ? styles.freeDot : styles.paidDot]} />
          <Text style={[styles.badgeText, spot.isFree ? styles.freeText : styles.paidText]}>
            {spot.isFree ? "Free" : "Paid"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE5EF",
    borderRadius: 18,
    padding: 20,
    gap: 20,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  buildingIcon: {
    width: 46, height: 46, borderRadius: 13,
    alignItems: "center", justifyContent: "center", backgroundColor: "#EDF2FF",
  },
  initials: { color: "#3656A5", fontSize: 15, fontWeight: "800" },
  identity: { flex: 1, gap: 5 },
  building: { color: "#52627A", fontSize: 13, fontWeight: "500" },
  name: { color: "#172B4D", fontSize: 19, lineHeight: 25, fontWeight: "700" },
  footer: {
    borderTopWidth: 1, borderTopColor: "#EEF1F6", paddingTop: 14,
    flexDirection: "row", flexWrap: "wrap", alignItems: "center",
    justifyContent: "space-between", gap: 12,
  },
  hoursGroup: { gap: 5, flexShrink: 1 },
  label: { fontSize: 10, letterSpacing: 1.3, fontWeight: "700", color: "#62718A" },
  hours: { fontSize: 14, fontWeight: "500", color: "#283C5A" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 6 },
  freeBadge: { backgroundColor: "#EAF7EF" },
  paidBadge: { backgroundColor: "#FFF3DC" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  freeDot: { backgroundColor: "#248451" },
  paidDot: { backgroundColor: "#A3650B" },
  badgeText: { fontSize: 12, fontWeight: "700" },
  freeText: { color: "#206B43" },
  paidText: { color: "#865108" },
});

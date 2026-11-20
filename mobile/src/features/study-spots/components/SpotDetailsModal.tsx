import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { spotStatus, type SpotDetails } from "../utils/spotPresentation";

export function SpotDetailsModal({ spot, onClose }: { spot: SpotDetails | null; onClose: () => void }) {
  if (!spot) return null;
  const status = spotStatus(spot);
  const rows = [
    ["Building", spot.building], ["Area", spot.area ?? spot.name],
    ["Open hours", spot.hours ?? "Not provided"], ["Type", spot.spotType],
    ["Cost", spot.isFree == null ? "Not provided" : spot.isFree ? "Free" : "Paid"],
    ["Checked in now", String(spot.activeCheckInCount)],
    ["Busyness", status.label],
    ["Reported crowding", spot.busyness.occupancy == null ? "No recent reports" : `${Math.round(spot.busyness.occupancy * 100)}%`],
    ["Noise", spot.averageNoise == null ? "No recent reports" : `${spot.averageNoise}/10`],
    ["Rating", spot.averageRating == null ? "No ratings yet" : `${spot.averageRating}/5 (${spot.ratingCount} ratings)`],
  ];
  return <Modal visible transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <View style={styles.dialog} accessibilityViewIsModal>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">{spot.name}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close spot details" style={styles.close}><Text style={styles.closeText}>Close</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.status}><View style={[styles.dot, { backgroundColor: status.color }]} /><Text>{status.label}</Text></View>
          {spot.description ? <Text style={styles.description}>{spot.description}</Text> : null}
          {rows.map(([label, value]) => <View style={styles.row} key={label}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>)}
          <Text style={styles.note}>Check-ins count people who have not checked out. Busyness and noise use reports from the last 3 hours.</Text>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", padding: 20 },
  dialog: { width: "100%", maxWidth: 500, maxHeight: "90%", backgroundColor: "white", borderRadius: 12, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#E2E8F0", gap: 8 },
  title: { flex: 1, fontSize: 21, fontWeight: "700", color: "#172033" },
  close: { minHeight: 44, minWidth: 44, justifyContent: "center" }, closeText: { color: "#1D4ED8", fontWeight: "600" },
  body: { padding: 20, gap: 16 }, status: { flexDirection: "row", alignItems: "center", gap: 8 }, dot: { width: 12, height: 12, borderRadius: 6 },
  description: { color: "#334155", lineHeight: 22 }, row: { flexDirection: "row", gap: 16 }, label: { width: 110, color: "#475569" }, value: { flex: 1, color: "#172033" }, note: { fontSize: 12, lineHeight: 18, color: "#475569" },
});

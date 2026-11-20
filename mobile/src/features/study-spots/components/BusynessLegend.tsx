import { StyleSheet, Text, View } from "react-native";
import { BUSYNESS_LEVELS, BUSYNESS_LABELS, getBusynessRange } from "@/shared/utils/busyness";
import { BUSYNESS_COLORS, UNKNOWN_COLOR } from "../utils/spotPresentation";

export function BusynessLegend() {
  return <View style={styles.container}>
    <Text style={styles.title}>How busy is it?</Text>
    <View style={styles.items}>
      {BUSYNESS_LEVELS.map(level => <View key={level} style={styles.item}>
        <View style={[styles.dot, { backgroundColor: BUSYNESS_COLORS[level] }]} />
        <Text style={styles.text}>{BUSYNESS_LABELS[level]} ({getBusynessRange(level)})</Text>
      </View>)}
      <View style={styles.item}><View style={[styles.dot, { backgroundColor: UNKNOWN_COLOR }]} /><Text style={styles.text}>No recent reports</Text></View>
    </View>
    <Text style={styles.note}>Based on crowd reports from the last 3 hours, not a seat count.</Text>
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: 8, marginVertical: 12 }, title: { fontSize: 14, fontWeight: "600", color: "#172033" },
  items: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, item: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 }, text: { color: "#334155", fontSize: 13 }, note: { color: "#475569", fontSize: 12 },
});

import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useCheckIns } from "@/features/check/context/CheckInContext";
import type { ApiSpot } from "@/shared/lib/api";
import { StudySpotsMap } from "../components/StudySpotsMap";
import { BusynessLegend } from "../components/BusynessLegend";
import { SpotDetailsModal } from "../components/SpotDetailsModal";
import { spotStatus } from "../utils/spotPresentation";

type ViewMode = "list" | "map";

export function StudySpotsScreen() {
  const { spots, loading, error, refresh } = useCheckIns();
  const [mode, setMode] = useState<ViewMode>("list");
  const [selected, setSelected] = useState<ApiSpot | null>(null);
  return <View style={styles.screen}>
    <Text style={styles.title}>Find a Study Spot</Text>
    <View style={styles.toggle}>
      {(["list", "map"] as const).map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: mode === item }} onPress={() => setMode(item)} style={[styles.toggleButton, mode === item && styles.active]}><Text style={mode === item ? styles.activeText : undefined}>{item === "list" ? "List" : "Map"}</Text></Pressable>)}
    </View>
    <BusynessLegend />
    {error ? <Pressable onPress={refresh}><Text style={styles.error}>{error} · Tap to retry</Text></Pressable> : null}
    {loading && spots.length === 0 ? <Text>Loading spots…</Text> : mode === "map" ? <View style={styles.map}><StudySpotsMap spots={spots} onSelect={setSelected} /></View> : <FlatList data={spots} keyExtractor={spot => spot.id} renderItem={({ item }) => { const status = spotStatus(item); return <Pressable style={styles.row} accessibilityRole="button" accessibilityLabel={`Details for ${item.name}`} onPress={() => setSelected(item)}><View style={[styles.dot, { backgroundColor: status.color }]} /><View style={styles.rowText}><Text style={styles.rowTitle}>{item.name}</Text><Text style={styles.secondary}>{item.building} · {item.spotType}</Text></View><Text style={styles.secondary}>{item.activeCheckInCount} here</Text></Pressable>; }} ListEmptyComponent={<Text>No study spots found.</Text>} />}
    <SpotDetailsModal spot={selected} onClose={() => setSelected(null)} />
  </View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, padding: 16, backgroundColor: "#F4F6FA" }, title: { fontSize: 26, fontWeight: "700", color: "#172033" }, toggle: { flexDirection: "row", gap: 8, marginTop: 12 }, toggleButton: { minWidth: 72, minHeight: 44, justifyContent: "center", alignItems: "center", borderRadius: 8, backgroundColor: "#E2E8F0" }, active: { backgroundColor: "#1D4ED8" }, activeText: { color: "white", fontWeight: "600" }, map: { flex: 1, minHeight: 300, overflow: "hidden", borderRadius: 8 }, error: { color: "#B91C1C", padding: 8 }, row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: "white", borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#CBD5E1" }, dot: { width: 12, height: 12, borderRadius: 6 }, rowText: { flex: 1, gap: 4 }, rowTitle: { fontSize: 16, fontWeight: "600", color: "#172033" }, secondary: { fontSize: 13, color: "#475569" } });

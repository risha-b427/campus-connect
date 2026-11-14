import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mockStudySpots } from "@/shared/data/mockStudySpots";
import StudySpotCard from "../components/StudySpotCard";
import { filterStudySpots, type CostFilter } from "../utils/filterStudySpots";

const FILTERS: { value: CostFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

export function StudySpotsScreen() {
  const [query, setQuery] = useState("");
  const [cost, setCost] = useState<CostFilter>("all");
  const [searchFocused, setSearchFocused] = useState(false);
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 2 : 1;
  const spots = filterStudySpots(mockStudySpots, query, cost);
  const hasFilters = query.length > 0 || cost !== "all";
  const resetFilters = () => { setQuery(""); setCost("all"); };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>Campus Connect</Text>
          <Text style={styles.title} accessibilityRole="header">Study spots</Text>
          <Text style={styles.subtitle}>Search campus study spots by name or building.</Text>
        </View>

        <View style={styles.controls}>
          <View style={[styles.searchBox, searchFocused && styles.searchFocused]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search by spot or building"
              placeholderTextColor="#69778D"
              accessibilityLabel="Search study spots by name or building"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={styles.searchInput}
            />
            {query.length > 0 && (
              <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery("")} style={styles.clearSearch}>
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.filterRow}>
            {FILTERS.map((filter) => (
              <Pressable
                key={filter.value}
                accessibilityRole="button"
                accessibilityLabel={`${filter.label} study spots`}
                accessibilityState={{ selected: cost === filter.value }}
                onPress={() => setCost(filter.value)}
                style={({ pressed }) => [styles.filter, cost === filter.value && styles.activeFilter, pressed && styles.pressed]}
              >
                <Text style={[styles.filterText, cost === filter.value && styles.activeFilterText]}>{filter.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultCount} accessibilityLiveRegion="polite">
            {spots.length} {spots.length === 1 ? "spot" : "spots"}{hasFilters ? ` of ${mockStudySpots.length}` : ""}
          </Text>
          {hasFilters ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Reset all filters" onPress={resetFilters} style={styles.reset}>
              <Text style={styles.resetText}>Reset filters</Text>
            </Pressable>
          ) : <Text style={styles.sampleLabel}>Sample locations</Text>}
        </View>

        <FlatList
          key={columns}
          data={spots}
          numColumns={columns}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <View style={styles.cardCell}><StudySpotCard spot={item} /></View>}
          columnWrapperStyle={columns === 2 ? styles.cardRow : undefined}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle} accessibilityRole="header">No spots found</Text>
              <Text style={styles.emptyText}>Try a different search or clear the filters.</Text>
              <Pressable accessibilityRole="button" onPress={resetFilters} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Show all spots</Text>
              </Pressable>
            </View>
          }
          ListFooterComponent={spots.length > 0 ? <Text style={styles.disclaimer}>Sample data. Hours and prices may be inaccurate.</Text> : undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F6FA" },
  content: { flex: 1, width: "100%", maxWidth: 1080, alignSelf: "center", paddingHorizontal: 20 },
  heading: { paddingTop: 28, paddingBottom: 22, gap: 9 },
  eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.7, color: "#4C6290" },
  title: { fontSize: 30, lineHeight: 37, fontWeight: "800", color: "#172B4D" },
  subtitle: { fontSize: 14, lineHeight: 21, color: "#596B84" },
  controls: { gap: 14 },
  searchBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CFD8E6", borderRadius: 12, backgroundColor: "#FFFFFF" },
  searchFocused: { borderColor: "#385DC1" },
  searchInput: { flex: 1, minWidth: 0, minHeight: 48, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15, color: "#172B4D", borderRadius: 12 },
  clearSearch: { minHeight: 44, paddingHorizontal: 13, justifyContent: "center" },
  clearText: { color: "#3154A5", fontWeight: "600", fontSize: 13 },
  filterRow: { flexDirection: "row", gap: 8 },
  filter: { minWidth: 72, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, paddingHorizontal: 20, backgroundColor: "#E7ECF4", borderWidth: 1, borderColor: "#E7ECF4" },
  activeFilter: { backgroundColor: "#203F79", borderColor: "#203F79" },
  filterText: { fontSize: 14, color: "#42536E", fontWeight: "600" },
  activeFilterText: { color: "#FFFFFF" },
  pressed: { opacity: 0.75 },
  resultsHeader: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  resultCount: { color: "#283C5A", fontSize: 13, fontWeight: "700", flexShrink: 1 },
  sampleLabel: { color: "#69778D", fontSize: 12 },
  reset: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  resetText: { color: "#3154A5", fontSize: 13, fontWeight: "600" },
  list: { flex: 1 },
  listContent: { paddingBottom: 24 },
  cardRow: { gap: 14 },
  cardCell: { flex: 1, marginBottom: 14 },
  disclaimer: { color: "#69778D", fontSize: 12, lineHeight: 18, paddingVertical: 10, textAlign: "center" },
  empty: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DEE5EF", borderRadius: 18, padding: 28, alignItems: "center", gap: 12 },
  emptyTitle: { color: "#172B4D", fontSize: 21, fontWeight: "700" },
  emptyText: { color: "#596B84", fontSize: 14, lineHeight: 22, textAlign: "center", maxWidth: 360 },
  emptyButton: { backgroundColor: "#203F79", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 14, marginTop: 4 },
  emptyButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
});

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SPOT_TYPES, type SpotFilterValues } from "../filterSpots";
import { NOISE_LEVELS } from "../noise";

type SpotFiltersProps = {
  value: SpotFilterValues;
  onChange: (value: SpotFilterValues) => void;
};

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

// Type and noise filters for the study spots list. This only shows the
// choices; the screen keeps the selected values and does the filtering.
export default function SpotFilters({ value, onChange }: SpotFiltersProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Chip
          label="All"
          selected={value.type === null}
          onPress={() => onChange({ ...value, type: null })}
        />
        {SPOT_TYPES.map((type) => (
          <Chip
            key={type}
            label={type}
            selected={value.type === type}
            onPress={() => onChange({ ...value, type })}
          />
        ))}
      </ScrollView>

      <Text style={styles.label}>Noise</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Chip
          label="All"
          selected={value.noise === null}
          onPress={() => onChange({ ...value, noise: null })}
        />
        {NOISE_LEVELS.map((noise) => (
          <Chip
            key={noise}
            label={noise}
            selected={value.noise === noise}
            onPress={() => onChange({ ...value, noise })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  row: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DCE2EA",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: "#172033",
    borderColor: "#172033",
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#172033",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
});

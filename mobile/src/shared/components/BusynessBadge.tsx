import { StyleSheet, Text, View } from "react-native";

import { BUSYNESS_LABELS, type BusynessLevel } from "@/shared/utils/busyness";

const COLORS: Record<BusynessLevel, { background: string; text: string }> = {
  full: { background: "#fde2e1", text: "#b42318" },
  busy: { background: "#fef0c7", text: "#b54708" },
  moderate: { background: "#e0f0ff", text: "#175cd3" },
  quiet: { background: "#dcfae6", text: "#067647" },
};

type BusynessBadgeProps = {
  level: BusynessLevel;
};

export function BusynessBadge({ level }: BusynessBadgeProps) {
  const colors = COLORS[level];

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>
        {BUSYNESS_LABELS[level]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});

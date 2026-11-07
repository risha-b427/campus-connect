import { StyleSheet, Text, View } from "react-native";

import { SectionTitle } from "@/features/home/components/SectionTitle";
import { BusynessBadge } from "@/shared/components/BusynessBadge";
import type { StudySpot } from "@/shared/data/mockStudySpots";
import {
  BUSYNESS_LEVELS,
  formatPercent,
  getBusynessLevel,
  getBusynessRange,
} from "@/shared/utils/busyness";

type SpotBusynessListProps = {
  spots: StudySpot[];
};

export function SpotBusynessList({ spots }: SpotBusynessListProps) {
  // Least busy first, so the best options are at the top.
  const sortedSpots = [...spots].sort((a, b) => a.occupancy - b.occupancy);

  return (
    <View>
      <SectionTitle title="How busy is it right now?" />
      <View style={styles.card}>
        {sortedSpots.map((spot, index) => (
          <View
            key={spot.id}
            style={[styles.row, index > 0 && styles.rowDivider]}
          >
            <Text style={styles.name}>{spot.name}</Text>
            <View style={styles.status}>
              <Text style={styles.percent}>
                {formatPercent(spot.occupancy)} full
              </Text>
              <BusynessBadge level={getBusynessLevel(spot.occupancy)} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.key}>
        {BUSYNESS_LEVELS.map((level) => (
          <View key={level} style={styles.keyItem}>
            <BusynessBadge level={level} />
            <Text style={styles.keyRange}>{getBusynessRange(level)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  name: {
    fontSize: 16,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  percent: {
    fontSize: 13,
    color: "#777",
  },
  key: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  keyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  keyRange: {
    fontSize: 13,
    color: "#555",
  },
});

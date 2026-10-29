import { StyleSheet, View } from "react-native";

import { SectionTitle } from "@/features/home/components/SectionTitle";
import { CheckInCard } from "@/shared/components/CheckInCard";
import type { CheckIn } from "@/shared/data/mockCheckIns";
import { mockStudySpots } from "@/shared/data/mockStudySpots";

type FriendsCheckInsProps = {
  checkIns: CheckIn[];
};

export function FriendsCheckIns({ checkIns }: FriendsCheckInsProps) {
  // Group the check-ins into rows of 2 for the grid.
  const rows: CheckIn[][] = [];
  for (let i = 0; i < checkIns.length; i += 2) {
    rows.push(checkIns.slice(i, i + 2));
  }

  return (
    <View>
      <SectionTitle title="Friends' check-ins" />
      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row[0].id} style={styles.row}>
            {row.map((checkIn) => (
              <CheckInCard
                key={checkIn.id}
                checkIn={checkIn}
                spotName={mockStudySpots.find((s) => s.id === checkIn.spotId)?.name}
              />
            ))}
            {/* Keeps a lone last card at half width instead of stretching. */}
            {row.length === 1 && <View style={styles.spacer} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  spacer: {
    flex: 1,
  },
});

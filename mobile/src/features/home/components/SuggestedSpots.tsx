import { ScrollView, StyleSheet, Text, View } from "react-native";

import { SectionTitle } from "@/features/home/components/SectionTitle";
import { BusynessBadge } from "@/shared/components/BusynessBadge";
import type { Coordinates, StudySpot } from "@/shared/data/mockStudySpots";
import { formatPercent, getBusynessLevel } from "@/shared/utils/busyness";
import { distanceInMiles, formatMiles } from "@/shared/utils/distance";

const SUGGESTION_COUNT = 3;

type SuggestedSpotsProps = {
  spots: StudySpot[];
  userLocation: Coordinates;
  // Stack the cards vertically (wide screens) instead of scrolling sideways.
  stacked?: boolean;
};

export function SuggestedSpots({
  spots,
  userLocation,
  stacked = false,
}: SuggestedSpotsProps) {
  // Closest spots first, skipping any that are already full.
  const suggestions = spots
    .filter((spot) => getBusynessLevel(spot.occupancy) !== "full")
    .map((spot) => ({
      spot,
      miles: distanceInMiles(userLocation, spot.location),
    }))
    .sort((a, b) => a.miles - b.miles)
    .slice(0, SUGGESTION_COUNT);

  const cards = suggestions.map(({ spot, miles }) => (
    <View key={spot.id} style={[styles.card, !stacked && styles.cardFixedWidth]}>
      <Text style={styles.name}>{spot.name}</Text>
      <Text style={styles.details}>{formatMiles(miles)} away</Text>
      <Text style={styles.details}>{formatPercent(spot.occupancy)} full</Text>
      <BusynessBadge level={getBusynessLevel(spot.occupancy)} />
    </View>
  ));

  return (
    <View>
      <SectionTitle title="Suggested near you" />
      {stacked ? (
        <View style={styles.list}>{cards}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {cards}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    padding: 16,
  },
  cardFixedWidth: {
    width: 150,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  details: {
    fontSize: 13,
    color: "#777",
  },
});

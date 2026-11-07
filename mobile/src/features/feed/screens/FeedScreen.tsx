import { FlatList, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FeedCheckInCard } from "@/shared/components/FeedCheckInCard";
import { getSortedCheckIns } from "@/shared/data/mockCheckIns";
import { mockStudySpots } from "@/shared/data/mockStudySpots";

export function FeedScreen() {
  // Newest first.
  const checkIns = getSortedCheckIns();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Feed</Text>
      <FlatList
        data={checkIns}
        keyExtractor={(checkIn) => checkIn.id}
        renderItem={({ item }) => (
          <FeedCheckInCard
            checkIn={item}
            spotName={mockStudySpots.find((s) => s.id === item.spotId)?.name}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    paddingTop: 16,
  },
  list: {
    gap: 12,
    padding: 16,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
  },
});

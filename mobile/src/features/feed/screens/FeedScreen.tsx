import { FlatList, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckInCard } from "@/shared/components/CheckInCard";
import { getSortedCheckIns } from "@/shared/data/mockCheckIns";

export function FeedScreen() {
  const checkIns = getSortedCheckIns();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={checkIns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CheckInCard checkIn={item} />}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={<Text style={styles.title}>Feed</Text>}
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
  list: {
    padding: 16,
    gap: 12,
  },
  row: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
});

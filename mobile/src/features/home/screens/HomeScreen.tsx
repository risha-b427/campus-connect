import { FlatList, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckInCard } from "@/shared/components/CheckInCard";
import { getSortedCheckIns } from "@/shared/data/mockCheckIns";

const RECENT_COUNT = 6;

export function HomeScreen() {
  const recentCheckIns = getSortedCheckIns().slice(0, RECENT_COUNT);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={recentCheckIns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CheckInCard checkIn={item} />}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={<Text style={styles.title}>Recent Check-ins</Text>}
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

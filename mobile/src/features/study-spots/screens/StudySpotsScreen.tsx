import { FlatList, StyleSheet, Text, View } from "react-native";

import StudySpotCard from "../components/StudySpotCard";
import { mockStudySpots } from "@/shared/data/mockStudySpots";

export function StudySpotsScreen() {
  return (
    <View style={styles.screen}>
      <FlatList
        data={mockStudySpots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudySpotCard spot={item} />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.heading}>
            <Text style={styles.title}>
              Find a Study Spot
            </Text>

            <Text style={styles.subtitle}>
              Explore {mockStudySpots.length} places to study around campus.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6FA",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#172033",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#475569",
  },
});

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import StudySpotCard from "../components/StudySpotCard";
import { useSpots } from "../hooks/useSpots";

export function StudySpotsScreen() {
  const { spots, loading, error, reload } = useSpots();

  return (
    <View style={styles.screen}>
      <FlatList
        data={loading || error ? [] : spots}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StudySpotCard spot={item} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.heading}>
            <Text style={styles.title}>Find a Study Spot</Text>

            {!loading && !error ? (
              <Text style={styles.subtitle}>
                Explore {spots.length} places to study around campus.
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loading} />
          ) : error ? (
            <View style={styles.messageBox}>
              <Text style={styles.errorText}>Couldn&apos;t load study spots: {error}</Text>
              <Pressable
                onPress={reload}
                accessibilityRole="button"
                style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
              >
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>No study spots found.</Text>
            </View>
          )
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
  loading: {
    marginTop: 40,
  },
  messageBox: {
    alignItems: "center",
    gap: 12,
    marginTop: 40,
  },
  messageText: {
    fontSize: 15,
    color: "#475569",
  },
  errorText: {
    fontSize: 15,
    color: "#B91C1C",
    textAlign: "center",
  },
  retryButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#172033",
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

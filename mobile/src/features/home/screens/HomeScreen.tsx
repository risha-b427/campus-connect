import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FriendsCheckIns } from "@/features/home/components/FriendsCheckIns";
import { SpotBusynessList } from "@/features/home/components/SpotBusynessList";
import { SuggestedSpots } from "@/features/home/components/SuggestedSpots";
import { getSortedCheckIns } from "@/shared/data/mockCheckIns";
import {
  FAKE_USER_LOCATION,
  mockStudySpots,
} from "@/shared/data/mockStudySpots";

const RECENT_COUNT = 6;
const ICON_SIZE = 24;
const ICON_COLOR = "#333";
// At this width and above (e.g. a computer browser), the sections sit side by
// side instead of stacking.
const WIDE_LAYOUT_MIN_WIDTH = 900;

export function HomeScreen() {
  const recentCheckIns = getSortedCheckIns().slice(0, RECENT_COUNT);
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_LAYOUT_MIN_WIDTH;

  const friendsSection = (
    <View style={isWide && styles.column}>
      <FriendsCheckIns checkIns={recentCheckIns} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Search"
          onPress={() => router.push("/search")}
        >
          <SymbolView
            name={{ ios: "magnifyingglass", android: "search", web: "search" }}
            size={ICON_SIZE}
            tintColor={ICON_COLOR}
          />
        </Pressable>

        <Text style={styles.title}>Home</Text>

        <Pressable
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push("/notifications")}
        >
          <SymbolView
            name={{
              ios: "bell",
              android: "notifications",
              web: "notifications",
            }}
            size={ICON_SIZE}
            tintColor={ICON_COLOR}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.sections, isWide && styles.sectionsWide]}>
          {/* Friends' check-ins go first (left column) on wide screens, last on phones. */}
          {isWide && friendsSection}
          <View style={isWide && styles.column}>
            <SpotBusynessList spots={mockStudySpots} />
          </View>
          <View style={isWide && styles.column}>
            <SuggestedSpots
              spots={mockStudySpots}
              userLocation={FAKE_USER_LOCATION}
              stacked={isWide}
            />
          </View>
          {!isWide && friendsSection}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  // Both buttons share a fixed width so the title stays truly centered.
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  sections: {
    gap: 24,
  },
  sectionsWide: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
  },
  column: {
    flex: 1,
  },
});

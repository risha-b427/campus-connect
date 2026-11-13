import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/features/auth/AuthProvider";
import { fetchFeed, type FeedItem } from "@/features/feed/api";
import { FeedCheckInCard } from "@/shared/components/FeedCheckInCard";

// Pull-to-refresh only works on phones; on web, RefreshControl does nothing,
// so the web version shows a Refresh button instead.
const isWeb = Platform.OS === "web";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Couldn't load the feed.";
}

export function FeedScreen() {
  const { session } = useAuth();
  const accessToken = session?.access_token;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load once when the screen opens (and again if the login changes).
  useEffect(() => {
    if (!accessToken) return;
    // Ignore the response if the screen closed before it arrived.
    let cancelled = false;

    fetchFeed(accessToken)
      .then(
        (feed) => {
          if (cancelled) return;
          setItems(feed);
          setError(null);
        },
        (err) => {
          if (!cancelled) setError(errorMessage(err));
        },
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  // Pull-to-refresh (or the web Refresh button): fetch again and replace the list.
  const handleRefresh = async () => {
    if (!accessToken || refreshing) return;
    setRefreshing(true);
    try {
      setItems(await fetchFeed(accessToken));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Feed</Text>

      {isWeb && !loading ? (
        <View style={styles.toolbar}>
          <Pressable
            onPress={handleRefresh}
            disabled={refreshing}
            accessibilityRole="button"
            style={({ hovered, pressed }) => [
              styles.refreshButton,
              (hovered || pressed) && styles.refreshButtonActive,
              refreshing && styles.refreshButtonDisabled,
            ]}
          >
            <Text style={styles.refreshText}>{refreshing ? "Refreshing…" : "Refresh"}</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FeedCheckInCard
              userName={item.user.name}
              spotName={item.spot.name}
              checkedInAt={item.checkedInAt}
              isHereNow={item.isActive}
            />
          )}
          // Pull down to refresh.
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.hint}>
                  {isWeb ? "Press Refresh to try again." : "Pull down to try again."}
                </Text>
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            error ? undefined : (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No recent check-ins</Text>
                <Text style={styles.hint}>
                  When your friends check in, they will show up here.
                </Text>
              </View>
            )
          }
          contentContainerStyle={styles.list}
        />
      )}
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
  loading: {
    marginTop: 32,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  refreshButton: {
    borderWidth: 1,
    borderColor: "#d0d5dd",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  refreshButtonActive: {
    backgroundColor: "#f2f4f7",
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
  },
  list: {
    flexGrow: 1,
    gap: 12,
    padding: 16,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
  },
  empty: {
    alignItems: "center",
    gap: 4,
    marginTop: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#fef3f2",
    borderColor: "#fecdca",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  errorText: {
    color: "#b42318",
    fontWeight: "600",
  },
});

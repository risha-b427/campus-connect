import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Profile = {
  name: string;
  major: string;
  year: string;
  bio: string;
};

type CheckIn = {
  id: string;
  spotName: string;
  // ISO date-time, local time
  timestamp: string;
  // minutes
  duration: number;
};

type MostVisited = {
  spotName: string;
  visits: number;
};

// Fake profile and check-ins until the backend exists.
const PROFILE: Profile = {
  name: "Jordan Lee",
  major: "Computer Science",
  year: "Sophomore",
  bio: "Night owl, coffee-fueled. Usually hunting for a quiet corner with an outlet.",
};

// Intentionally out of order so the sort in sortNewestFirst is what puts the
// newest first.
const CHECK_INS: CheckIn[] = [
  { id: "1", spotName: "Grainger", timestamp: "2026-10-06T19:15:00", duration: 120 },
  { id: "2", spotName: "Main Library", timestamp: "2026-10-09T14:30:00", duration: 95 },
  { id: "3", spotName: "Illini Union", timestamp: "2026-10-03T11:00:00", duration: 45 },
  { id: "4", spotName: "Grainger", timestamp: "2026-10-08T20:05:00", duration: 150 },
  { id: "5", spotName: "Siebel Center", timestamp: "2026-10-07T16:40:00", duration: 60 },
  { id: "6", spotName: "Grainger", timestamp: "2026-10-01T18:30:00", duration: 180 },
  { id: "7", spotName: "Main Library", timestamp: "2026-10-04T13:10:00", duration: 75 },
  { id: "8", spotName: "Grainger", timestamp: "2026-10-10T09:20:00", duration: 50 },
  { id: "9", spotName: "ACES Library", timestamp: "2026-10-02T10:45:00", duration: 30 },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function sortNewestFirst(checkIns: CheckIn[]): CheckIn[] {
  return [...checkIns].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

// Counts visits per spot, then picks the spot with the highest count. On a tie
// the spot that shows up first in the list wins.
function getMostVisited(checkIns: CheckIn[]): MostVisited | null {
  const visitsBySpot = checkIns.reduce<Record<string, number>>(
    (counts, checkIn) => {
      counts[checkIn.spotName] = (counts[checkIn.spotName] ?? 0) + 1;
      return counts;
    },
    {},
  );

  return Object.entries(visitsBySpot).reduce<MostVisited | null>(
    (top, [spotName, visits]) =>
      top === null || visits > top.visits ? { spotName, visits } : top,
    null,
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours < 12 ? "AM" : "PM";

  return `${MONTHS[date.getMonth()]} ${date.getDate()} · ${hours % 12 || 12}:${minutes} ${period}`;
}

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
};

function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {detail ? <Text style={styles.statDetail}>{detail}</Text> : null}
    </View>
  );
}

type CheckInRowProps = {
  checkIn: CheckIn;
};

function CheckInRow({ checkIn }: CheckInRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowSpot} numberOfLines={1}>
          {checkIn.spotName}
        </Text>
        <Text style={styles.rowTime}>{formatTimestamp(checkIn.timestamp)}</Text>
      </View>
      <View style={styles.durationPill}>
        <Text style={styles.durationText}>
          {formatDuration(checkIn.duration)}
        </Text>
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const recentCheckIns = sortNewestFirst(CHECK_INS);
  const totalCheckIns = recentCheckIns.length;
  const mostVisited = getMostVisited(recentCheckIns);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={recentCheckIns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CheckInRow checkIn={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(PROFILE.name)}
                </Text>
              </View>
              <Text style={styles.name}>{PROFILE.name}</Text>
              <Text style={styles.meta}>
                {PROFILE.major} · {PROFILE.year}
              </Text>
              <Text style={styles.bio}>{PROFILE.bio}</Text>
            </View>

            <View style={styles.stats}>
              <StatCard
                label="Total check-ins"
                value={String(totalCheckIns)}
              />
              <StatCard
                label="Most visited"
                value={mostVisited ? mostVisited.spotName : "—"}
                detail={
                  mostVisited
                    ? `${mostVisited.visits} ${mostVisited.visits === 1 ? "visit" : "visits"}`
                    : undefined
                }
              />
            </View>

            <Text style={styles.sectionTitle}>Recent check-ins</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No check-ins yet.</Text>
        }
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
  header: {
    gap: 12,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#13294b",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: "600",
    color: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
  },
  meta: {
    fontSize: 15,
    color: "#777",
    marginTop: 4,
  },
  bio: {
    fontSize: 15,
    lineHeight: 21,
    color: "#333",
    textAlign: "center",
    marginTop: 12,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  statLabel: {
    fontSize: 13,
    color: "#777",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 6,
  },
  statDetail: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  rowText: {
    flex: 1,
  },
  rowSpot: {
    fontSize: 16,
    fontWeight: "600",
  },
  rowTime: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  durationPill: {
    backgroundColor: "#f5f5f5",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  durationText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  empty: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    paddingVertical: 24,
  },
});

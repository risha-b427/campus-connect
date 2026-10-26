import { useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { studySpots } from "@/features/study-spots/data/studySpots";
import { mockCheckIns } from "@/shared/data/mockCheckIns";
import type { CheckIn } from "@/shared/types";

// Stands in for the logged-in user until login is hooked up.
const DEMO_USER_ID = "u1";

// Only show the newest few so the list stays short for heavy users.
const RECENT_LIMIT = 5;
const TOP_SPOTS_LIMIT = 3;

type Profile = {
  name: string;
  major: string;
  year: string;
  bio: string;
};

type Connection = {
  // matches a userId in mockCheckIns
  id: string;
  name: string;
  major: string;
};

type SpotStats = {
  spotId: string;
  visits: number;
  minutes: number;
};

// Fake profile until the backend exists.
const PROFILE: Profile = {
  name: "Jordan Lee",
  major: "Computer Science",
  year: "Sophomore",
  bio: "Night owl, coffee-fueled. Usually hunting for a quiet corner with an outlet.",
};

// Fake friends until connections come from the database. Their ids match
// users in mockCheckIns, so we can show where they're studying right now.
const CONNECTIONS: Connection[] = [
  { id: "u2", name: "Alex Kim", major: "Statistics" },
  { id: "u3", name: "Priya Patel", major: "Mathematics" },
  { id: "u5", name: "Maya Chen", major: "Economics" },
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

function getSpot(spotId: string) {
  return studySpots.find((spot) => spot.id === spotId);
}

function getSpotName(spotId: string): string {
  return getSpot(spotId)?.name ?? "Unknown spot";
}

// A check-in with no endedAt is still going, so count it up to now.
function getMinutes(checkIn: CheckIn, now: number): number {
  const start = new Date(checkIn.startedAt).getTime();
  const end = checkIn.endedAt ? new Date(checkIn.endedAt).getTime() : now;
  return Math.max(0, Math.round((end - start) / 60_000));
}

function sortNewestFirst(checkIns: CheckIn[]): CheckIn[] {
  return [...checkIns].sort(
    (a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

// Groups check-ins by spot, then ranks spots by visits. On a tie, the spot
// with more time spent there wins.
function getTopSpots(checkIns: CheckIn[], now: number): SpotStats[] {
  const statsBySpot = checkIns.reduce<Record<string, SpotStats>>(
    (stats, checkIn) => {
      const current = stats[checkIn.spotId] ?? {
        spotId: checkIn.spotId,
        visits: 0,
        minutes: 0,
      };
      stats[checkIn.spotId] = {
        ...current,
        visits: current.visits + 1,
        minutes: current.minutes + getMinutes(checkIn, now),
      };
      return stats;
    },
    {},
  );

  return Object.values(statsBySpot).sort(
    (a, b) => b.visits - a.visits || b.minutes - a.minutes,
  );
}

function findActiveCheckIn(userId: string): CheckIn | undefined {
  return mockCheckIns.find(
    (checkIn) => checkIn.userId === userId && !checkIn.endedAt,
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

function pluralize(count: number, word: string): string {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

type StatTileProps = {
  label: string;
  value: string;
};

function StatTile({ label, value }: StatTileProps) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

type TopSpotRowProps = {
  rank: number;
  stats: SpotStats;
};

function TopSpotRow({ rank, stats }: TopSpotRowProps) {
  const spot = getSpot(stats.spotId);

  return (
    <View style={styles.row}>
      <View style={styles.rank}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {spot?.name ?? "Unknown spot"}
        </Text>
        {spot ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {spot.building}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowRightValue}>
          {pluralize(stats.visits, "visit")}
        </Text>
        <Text style={styles.rowSubtitle}>{formatDuration(stats.minutes)}</Text>
      </View>
    </View>
  );
}

type CheckInRowProps = {
  checkIn: CheckIn;
  now: number;
};

function CheckInRow({ checkIn, now }: CheckInRowProps) {
  const isActive = !checkIn.endedAt;

  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {getSpotName(checkIn.spotId)}
        </Text>
        <Text style={styles.rowSubtitle}>
          {formatTimestamp(checkIn.startedAt)}
        </Text>
        {checkIn.note ? (
          <Text style={styles.note} numberOfLines={2}>
            {checkIn.note}
          </Text>
        ) : null}
      </View>
      <View style={[styles.pill, isActive && styles.pillActive]}>
        <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
          {isActive ? "Here now" : formatDuration(getMinutes(checkIn, now))}
        </Text>
      </View>
    </View>
  );
}

type ConnectionRowProps = {
  connection: Connection;
};

function ConnectionRow({ connection }: ConnectionRowProps) {
  const activeCheckIn = findActiveCheckIn(connection.id);

  return (
    <View style={styles.row}>
      <View style={styles.smallAvatar}>
        <Text style={styles.smallAvatarText}>
          {getInitials(connection.name)}
        </Text>
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {connection.name}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {activeCheckIn
            ? `Studying at ${getSpotName(activeCheckIn.spotId)}`
            : connection.major}
        </Text>
      </View>
      {activeCheckIn ? <View style={styles.activeDot} /> : null}
    </View>
  );
}

export function ProfileScreen() {
  // Read the clock once so "Here now" times stay steady between re-renders.
  const [now] = useState(() => Date.now());

  const myCheckIns = sortNewestFirst(
    mockCheckIns.filter((checkIn) => checkIn.userId === DEMO_USER_ID),
  );
  const recentCheckIns = myCheckIns.slice(0, RECENT_LIMIT);
  const topSpots = getTopSpots(myCheckIns, now);
  const totalMinutes = myCheckIns.reduce(
    (total, checkIn) => total + getMinutes(checkIn, now),
    0,
  );
  const averageMinutes =
    myCheckIns.length > 0 ? Math.round(totalMinutes / myCheckIns.length) : 0;
  const activeCheckIn = myCheckIns.find((checkIn) => !checkIn.endedAt);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(PROFILE.name)}</Text>
          </View>
          <Text style={styles.name}>{PROFILE.name}</Text>
          <Text style={styles.meta}>
            {PROFILE.major} · {PROFILE.year}
          </Text>
          <Text style={styles.bio}>{PROFILE.bio}</Text>
          {activeCheckIn ? (
            <View style={[styles.pill, styles.pillActive, styles.statusPill]}>
              <Text style={[styles.pillText, styles.pillTextActive]}>
                Studying at {getSpotName(activeCheckIn.spotId)}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.statsGrid}>
          <StatTile label="Check-ins" value={String(myCheckIns.length)} />
          <StatTile label="Hours studied" value={formatDuration(totalMinutes)} />
          <StatTile label="Spots visited" value={String(topSpots.length)} />
          <StatTile label="Avg. session" value={formatDuration(averageMinutes)} />
        </View>

        <Section title="Top spots">
          {topSpots.length > 0 ? (
            topSpots
              .slice(0, TOP_SPOTS_LIMIT)
              .map((stats, index) => (
                <TopSpotRow key={stats.spotId} rank={index + 1} stats={stats} />
              ))
          ) : (
            <Text style={styles.empty}>No spots yet.</Text>
          )}
        </Section>

        <Section title="Recent check-ins">
          {recentCheckIns.length > 0 ? (
            recentCheckIns.map((checkIn) => (
              <CheckInRow key={checkIn.id} checkIn={checkIn} now={now} />
            ))
          ) : (
            <Text style={styles.empty}>No check-ins yet.</Text>
          )}
        </Section>

        <Section title="My connections">
          {CONNECTIONS.length > 0 ? (
            CONNECTIONS.map((connection) => (
              <ConnectionRow key={connection.id} connection={connection} />
            ))
          ) : (
            <Text style={styles.empty}>No connections yet.</Text>
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FA",
  },
  content: {
    padding: 16,
    gap: 20,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#DCE2EA",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#13294B",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#172033",
  },
  meta: {
    fontSize: 15,
    color: "#475569",
    marginTop: 4,
  },
  bio: {
    fontSize: 15,
    lineHeight: 21,
    color: "#475569",
    textAlign: "center",
    marginTop: 12,
  },
  statusPill: {
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statTile: {
    // two tiles per row, minus half the gap between them
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCE2EA",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#13294B",
  },
  statLabel: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#172033",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCE2EA",
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#172033",
  },
  rowSubtitle: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
  },
  rowRight: {
    alignItems: "flex-end",
  },
  rowRightValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172033",
  },
  note: {
    fontSize: 14,
    color: "#172033",
    marginTop: 6,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EDF5",
  },
  rankText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#13294B",
  },
  pill: {
    backgroundColor: "#F4F6FA",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillActive: {
    backgroundColor: "#DCFCE7",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  pillTextActive: {
    color: "#166534",
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EDF5",
  },
  smallAvatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#13294B",
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
  },
  empty: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    paddingVertical: 16,
  },
});

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import { useCheckIns } from "@/features/check/context/CheckInContext";
import { CURRENT_USER } from "@/shared/data/currentUser";
import { mockStudySpots } from "@/shared/data/mockStudySpots";
import { peopleHere } from "@/shared/lib/busyness";

function peopleLabel(count: number) {
  if (count === 0) return "No one here yet";
  if (count === 1) return "1 person here now";
  return `${count} people here now`;
}

// One tappable box, used in both lists
function SpotBox({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.spot, selected && styles.spotSelected]}
      onPress={onPress}
    >
      <Text style={styles.spotTitle}>{title}</Text>
      <Text style={styles.count}>{subtitle}</Text>
    </Pressable>
  );
}

// A row of 1-5 buttons for one rating
function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.ratingButtons}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            style={[styles.ratingButton, value === n && styles.ratingSelected]}
            onPress={() => onChange(n)}
          >
            <Text style={value === n ? styles.ratingTextSelected : undefined}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function CheckInScreen() {
  const { checkIns, checkIn, checkOut } = useCheckIns();
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isRating, setIsRating] = useState(false);
  const [busyness, setBusyness] = useState<number | null>(null);
  const [noise, setNoise] = useState<number | null>(null);

  const myCheckIn = checkIns.find(
    (c) => c.userId === CURRENT_USER.id && !c.endedAt,
  );
  const checkedInSpot = mockStudySpots.find((s) => s.id === myCheckIn?.spotId);

  // Popular right now: top 4 spots by people here, highest first
  const popularSpots = [...mockStudySpots]
    .sort(
      (a, b) => peopleHere(b.id, checkIns) - peopleHere(a.id, checkIns),
    )
    .slice(0, 4);

  // Last rated: most recent rated check-out per spot, newest first, top 3
  const seen = new Set<string>();
  const lastRated = checkIns
    .filter((c) => c.rating && c.endedAt)
    .sort(
      (a, b) =>
        new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime(),
    )
    .filter((c) => {
      if (seen.has(c.spotId)) return false;
      seen.add(c.spotId);
      return true;
    })
    .slice(0, 3);

  function spotName(spotId: string) {
    return mockStudySpots.find((s) => s.id === spotId)?.name ?? spotId;
  }

  function handleCheckIn() {
    if (selectedSpotId) {
      checkIn(selectedSpotId, note);
    }
  }

  function handleSubmitRating() {
  if (myCheckIn && busyness && noise) {
    checkOut(myCheckIn.id, { busyness, noise });
  }
  setIsRating(false);
  setBusyness(null);
  setNoise(null);
  setSelectedSpotId(null);
  setNote("");
}

  // View shown after checking in
  if (myCheckIn) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        You're checked in at {checkedInSpot?.name ?? myCheckIn.spotId}!
      </Text>
      <Text style={styles.note}>
        {peopleLabel(peopleHere(myCheckIn.spotId, checkIns))}
      </Text>
      {myCheckIn.note ? (
        <Text style={styles.note}>Working on: {myCheckIn.note}</Text>
      ) : null}

      {isRating ? (
        <>
          <Text style={styles.columnTitle}>How was it? (1 = low, 5 = high)</Text>
          <RatingRow label="Busyness" value={busyness} onChange={setBusyness} />
          <RatingRow label="Noise" value={noise} onChange={setNoise} />
          <Pressable
            style={[styles.button, !(busyness && noise) && styles.buttonDisabled]}
            onPress={handleSubmitRating}
            disabled={!(busyness && noise)}
          >
            <Text style={styles.buttonText}>Submit and check out</Text>
          </Pressable>
        </>
      ) : (
        <Pressable style={styles.button} onPress={() => setIsRating(true)}>
          <Text style={styles.buttonText}>Check out</Text>
        </Pressable>
      )}
    </View>
  );
}

  // View shown before checking in
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Check into a study spot and leave your ratings!
      </Text>

      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Popular right now</Text>
          {popularSpots.map((spot) => (
            <SpotBox
              key={spot.id}
              title={spot.name}
              subtitle={peopleLabel(peopleHere(spot.id, checkIns))}
              selected={selectedSpotId === spot.id}
              onPress={() => setSelectedSpotId(spot.id)}
            />
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>Last rated</Text>
          {lastRated.length === 0 ? (
            <Text style={styles.count}>No ratings yet</Text>
          ) : (
            lastRated.map((c) => (
              <SpotBox
                key={c.id}
                title={spotName(c.spotId)}
                subtitle={`Busyness ${c.rating!.busyness}/5 · Noise ${c.rating!.noise}/5`}
                selected={selectedSpotId === c.spotId}
                onPress={() => setSelectedSpotId(c.spotId)}
              />
            ))
          )}
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="What are you working on? (optional)"
        value={note}
        onChangeText={setNote}
      />

      <Pressable
        style={[styles.button, !selectedSpotId && styles.buttonDisabled]}
        onPress={handleCheckIn}
        disabled={!selectedSpotId}
      >
        <Text style={styles.buttonText}>
          {selectedSpotId
            ? `Check in at ${spotName(selectedSpotId)}`
            : "Check in"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 48 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  note: { fontSize: 16, marginBottom: 16 },
  columns: { flexDirection: "row", gap: 12 },
  column: { flex: 1 },
  columnTitle: { fontSize: 15, fontWeight: "600", marginBottom: 8 },
  spot: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
  },
  spotSelected: { backgroundColor: "#cfe3ff", borderColor: "#3b82f6" },
  spotTitle: { fontSize: 14, fontWeight: "500" },
  count: { fontSize: 12, color: "#666", marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "white", fontWeight: "bold" },
  ratingRow: { marginBottom: 16 },
  ratingLabel: { fontSize: 15, fontWeight: "500", marginBottom: 6 },
  ratingButtons: { flexDirection: "row", gap: 8 },
  ratingButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingSelected: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  ratingTextSelected: { color: "white", fontWeight: "bold" },
});
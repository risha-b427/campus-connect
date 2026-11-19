import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useCheckIns } from "@/features/check/context/CheckInContext";

function peopleLabel(count: number) {
  if (count === 0) return "No one here yet";
  if (count === 1) return "1 person here now";
  return `${count} people here now`;
}

// A row of tappable numbers from 1 to max
function NumberRow({
  label,
  max,
  value,
  onChange,
}: {
  label: string;
  max: number;
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.ratingButtons}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
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
  const { spots, checkIns, myCheckIn, loading, error, refresh, checkIn, checkOut } =
    useCheckIns();

  // Check-in form
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busyness, setBusyness] = useState<number | null>(null);
  const [noise, setNoise] = useState<number | null>(null);

  // Checkout form
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [outBusyness, setOutBusyness] = useState<number | null>(null);
  const [outNoise, setOutNoise] = useState<number | null>(null);
  const [overall, setOverall] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);

  const countFor = (spotId: string) =>
    checkIns.filter((c) => c.spotId === spotId).length;

  const spotName = (spotId: string) =>
    spots.find((s) => s.id === spotId)?.name ?? "this spot";

  // Popular right now: most people first, then by name
  const popularSpots = [...spots].sort(
    (a, b) => countFor(b.id) - countFor(a.id) || a.name.localeCompare(b.name),
  );

  async function handleCheckIn() {
    if (!selectedSpotId || !busyness || !noise) return;
    setSaving(true);
    const ok = await checkIn(selectedSpotId, note, busyness, noise);
    setSaving(false);
    if (ok) {
      setSelectedSpotId(null);
      setNote("");
      setBusyness(null);
      setNoise(null);
    }
  }

  function startCheckOut() {
    // Start from the scores given at check-in
    setOutBusyness(myCheckIn?.busyness ?? null);
    setOutNoise(myCheckIn?.noise ?? null);
    setOverall(null);
    setIsCheckingOut(true);
  }

  async function handleSubmitCheckOut() {
    if (!outBusyness || !outNoise) return;
    setSaving(true);
    const ok = await checkOut(outBusyness, outNoise, overall ?? undefined);
    setSaving(false);
    if (ok) setIsCheckingOut(false);
  }

  const errorBox = error ? (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{error}</Text>
      <Pressable onPress={refresh}>
        <Text style={styles.retry}>Try again</Text>
      </Pressable>
    </View>
  ) : null;

  // First load
  if (loading && spots.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator />
      </View>
    );
  }

  // View shown after checking in
  if (myCheckIn) {
    const canSubmit = !!outBusyness && !!outNoise && !saving;
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          You're checked in at {spotName(myCheckIn.spotId)}!
        </Text>
        <Text style={styles.note}>
          {peopleLabel(countFor(myCheckIn.spotId))}
        </Text>
        {myCheckIn.note ? (
          <Text style={styles.note}>Working on: {myCheckIn.note}</Text>
        ) : null}
        {errorBox}

        {isCheckingOut ? (
          <>
            <Text style={styles.columnTitle}>How is it now? (1 = low, 10 = high)</Text>
            <NumberRow label="Busyness" max={10} value={outBusyness} onChange={setOutBusyness} />
            <NumberRow label="Noise" max={10} value={outNoise} onChange={setOutNoise} />
            <NumberRow
              label="Overall rating of this spot (optional, 1-5)"
              max={5}
              value={overall}
              onChange={setOverall}
            />
            <Pressable
              style={[styles.button, !canSubmit && styles.buttonDisabled]}
              onPress={handleSubmitCheckOut}
              disabled={!canSubmit}
            >
              <Text style={styles.buttonText}>
                {saving ? "Saving..." : "Submit and check out"}
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.button} onPress={startCheckOut}>
            <Text style={styles.buttonText}>Check out</Text>
          </Pressable>
        )}
      </ScrollView>
    );
  }

  // View shown before checking in
  const canCheckIn = !!selectedSpotId && !!busyness && !!noise && !saving;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Check into a study spot and leave your ratings!
      </Text>
      {errorBox}

      <Text style={styles.columnTitle}>Popular right now</Text>
      {popularSpots.map((spot) => (
        <Pressable
          key={spot.id}
          style={[styles.spot, selectedSpotId === spot.id && styles.spotSelected]}
          onPress={() => setSelectedSpotId(spot.id)}
        >
          <Text style={styles.spotTitle}>{spot.name}</Text>
          <Text style={styles.count}>{peopleLabel(countFor(spot.id))}</Text>
        </Pressable>
      ))}

      <NumberRow label="How busy is it? (1-10)" max={10} value={busyness} onChange={setBusyness} />
      <NumberRow label="How noisy is it? (1-10)" max={10} value={noise} onChange={setNoise} />

      <TextInput
        style={styles.input}
        placeholder="What are you working on? (optional)"
        value={note}
        onChangeText={setNote}
        maxLength={200}
      />

      <Pressable
        style={[styles.button, !canCheckIn && styles.buttonDisabled]}
        onPress={handleCheckIn}
        disabled={!canCheckIn}
      >
        <Text style={styles.buttonText}>
          {saving
            ? "Checking in..."
            : selectedSpotId
              ? `Check in at ${spotName(selectedSpotId)}`
              : "Check in"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  note: { fontSize: 16, marginBottom: 16 },
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
  ratingRow: { marginTop: 8, marginBottom: 8 },
  ratingLabel: { fontSize: 15, fontWeight: "500", marginBottom: 6 },
  ratingButtons: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  ratingButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingSelected: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  ratingTextSelected: { color: "white", fontWeight: "bold" },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#991b1b" },
  retry: { color: "#991b1b", fontWeight: "bold", marginTop: 6 },
});
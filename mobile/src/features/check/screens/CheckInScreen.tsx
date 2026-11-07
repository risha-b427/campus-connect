import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { mockStudySpots } from "@/shared/data/mockStudySpots";

export default function CheckInScreen() {
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [checkedInSpotId, setCheckedInSpotId] = useState<string | null>(null);

  const checkedInSpot = mockStudySpots.find((s) => s.id === checkedInSpotId);

  function handleCheckIn() {
    if (selectedSpotId) {
      setCheckedInSpotId(selectedSpotId);
    }
  }

  function handleCheckOut() {
    setCheckedInSpotId(null);
    setSelectedSpotId(null);
    setNote("");
  }

  // View shown after checking in
  if (checkedInSpot) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          You're checked in at {checkedInSpot.name}!
        </Text>
        {note !== "" && <Text style={styles.note}>Working on: {note}</Text>}
        <Pressable style={styles.button} onPress={handleCheckOut}>
          <Text style={styles.buttonText}>Check out</Text>
        </Pressable>
      </View>
    );
  }

  // View shown before checking in
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick a study spot</Text>

      {mockStudySpots.map((spot) => (
        <Pressable
          key={spot.id}
          style={[styles.spot, selectedSpotId === spot.id && styles.spotSelected]}
          onPress={() => setSelectedSpotId(spot.id)}
        >
          <Text>
            {spot.area ? `${spot.area} (${spot.name})` : spot.name}
          </Text>
        </Pressable>
      ))}

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
        <Text style={styles.buttonText}>Check in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  note: { fontSize: 16, marginBottom: 16 },
  spot: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
  },
  spotSelected: { backgroundColor: "#cfe3ff", borderColor: "#3b82f6" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "white", fontWeight: "bold" },
});
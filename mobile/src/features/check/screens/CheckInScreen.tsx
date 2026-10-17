import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

const SPOTS = ['Grainger', 'Main Library', 'Undergrad Library', 'Illini Union'];

export default function CheckInScreen() {
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [checkedInSpot, setCheckedInSpot] = useState<string | null>(null);

  function handleCheckIn() {
    if (selectedSpot) {
      setCheckedInSpot(selectedSpot);
    }
  }

  function handleCheckOut() {
    setCheckedInSpot(null);
    setSelectedSpot(null);
    setNote('');
  }

  // View shown after checking in
  if (checkedInSpot) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You're checked in at {checkedInSpot}!</Text>
        {note !== '' && <Text style={styles.note}>Working on: {note}</Text>}
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

      {SPOTS.map((spot) => (
        <Pressable
          key={spot}
          style={[styles.spot, selectedSpot === spot && styles.spotSelected]}
          onPress={() => setSelectedSpot(spot)}
        >
          <Text>{spot}</Text>
        </Pressable>
      ))}

      <TextInput
        style={styles.input}
        placeholder="What are you working on? (optional)"
        value={note}
        onChangeText={setNote}
      />

      <Pressable
        style={[styles.button, !selectedSpot && styles.buttonDisabled]}
        onPress={handleCheckIn}
        disabled={!selectedSpot}
      >
        <Text style={styles.buttonText}>Check in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  note: { fontSize: 16, marginBottom: 16 },
  spot: { padding: 14, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 8 },
  spotSelected: { backgroundColor: '#cfe3ff', borderColor: '#3b82f6' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginVertical: 16 },
  button: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9ca3af' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
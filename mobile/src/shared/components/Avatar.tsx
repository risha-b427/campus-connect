import { StyleSheet, Text, View } from "react-native";

// Placeholder profile picture: a coloured circle with the person's initial.
// Swap in a real photo once users have profile pictures.
const COLORS = ["#f97066", "#f79009", "#12b76a", "#2e90fa", "#7a5af8", "#ee46bc"];

// The same name always gets the same colour.
function colorForName(name: string) {
  let hash = 0;
  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % COLORS.length;
  }
  return COLORS[hash];
}

type AvatarProps = {
  name: string;
  size?: number;
};

export function Avatar({ name, size = 64 }: AvatarProps) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colorForName(name),
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.45 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    color: "#fff",
    fontWeight: "600",
  },
});

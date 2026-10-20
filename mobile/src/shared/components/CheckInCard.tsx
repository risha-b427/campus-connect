import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/shared/components/Avatar";
import type { CheckIn } from "@/shared/data/mockCheckIns";
import { timeAgo } from "@/shared/utils/timeAgo";

const AVATAR_SIZE = 56;

type CheckInCardProps = {
  checkIn: CheckIn;
};

export function CheckInCard({ checkIn }: CheckInCardProps) {
  // At least as tall as it is wide (a square), but allowed to grow taller when
  // the card is narrow and the text wraps onto more lines.
  const [width, setWidth] = useState(0);

  return (
    <View
      style={[styles.card, { minHeight: width }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.avatarArea}>
        <Avatar name={checkIn.name} size={AVATAR_SIZE} />
      </View>
      <Text style={styles.message}>
        <Text style={styles.bold}>{checkIn.name}</Text> is studying at{" "}
        <Text style={styles.bold}>{checkIn.spot}</Text>
      </Text>
      <Text style={styles.time}>{timeAgo(checkIn.timestamp)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  // Takes up the spare space above the text and centers the avatar in it.
  avatarArea: {
    flex: 1,
    minHeight: AVATAR_SIZE + 8,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
  },
  bold: {
    fontWeight: "600",
  },
  time: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
  },
});

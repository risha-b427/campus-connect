import { StyleSheet, Text, View } from "react-native";

import type { CheckIn } from "@/shared/data/mockCheckIns";
import { timeAgo } from "@/shared/utils/timeAgo";

type CheckInCardProps = {
  checkIn: CheckIn;
};

export function CheckInCard({ checkIn }: CheckInCardProps) {
  return (
    <View style={styles.card}>
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
    aspectRatio: 1,
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  message: {
    fontSize: 16,
  },
  bold: {
    fontWeight: "600",
  },
  time: {
    fontSize: 13,
    color: "#777",
  },
});

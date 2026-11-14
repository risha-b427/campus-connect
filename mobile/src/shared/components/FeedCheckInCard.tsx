import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/shared/components/Avatar";
import type { CheckIn } from "@/shared/data/mockCheckIns";
import { timeAgo } from "@/shared/utils/timeAgo";

const AVATAR_SIZE = 44;

type FeedCheckInCardProps = {
  checkIn: CheckIn;
  spotName?: string;
};

export function FeedCheckInCard({ checkIn, spotName }: FeedCheckInCardProps) {
  // No end time means they haven't checked out yet.
  const isHereNow = !checkIn.endedAt;

  return (
    <View style={styles.card}>
      <Avatar name={checkIn.userName} size={AVATAR_SIZE} />
      <View style={styles.body}>
        <Text style={styles.message}>
          <Text style={styles.bold}>{checkIn.userName}</Text>
          {isHereNow ? " is studying at " : " studied at "}
          <Text style={styles.bold}>{spotName ?? checkIn.spotId}</Text>
        </Text>

        {checkIn.note && <Text style={styles.note}>{checkIn.note}</Text>}

        <View style={styles.footer}>
          <Text style={styles.time}>{timeAgo(new Date(checkIn.startedAt))}</Text>
          {isHereNow && (
            <View style={styles.hereNowTag}>
              <Text style={styles.hereNowText}>here now</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  body: {
    flex: 1,
    gap: 4,
  },
  message: {
    fontSize: 15,
  },
  bold: {
    fontWeight: "600",
  },
  note: {
    fontSize: 14,
    color: "#444",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  time: {
    fontSize: 13,
    color: "#777",
  },
  hereNowTag: {
    backgroundColor: "#d1fadf",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  hereNowText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#027a48",
  },
});

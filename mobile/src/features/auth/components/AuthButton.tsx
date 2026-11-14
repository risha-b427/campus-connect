import { useState } from "react";
import { ActivityIndicator, Animated, Pressable, Text } from "react-native";

import { authStyles as styles } from "@/features/auth/authStyles";

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

// The main blue button. It squishes down a little when pressed.
export function AuthButton({ label, onPress, loading = false }: AuthButtonProps) {
  const [scale] = useState(() => new Animated.Value(1));

  const squish = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onPress}
        onPressIn={() => squish(0.96)}
        onPressOut={() => squish(1)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FF5F05" />
        ) : (
          <Text style={styles.buttonText}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";

type EntranceProps = {
  children: React.ReactNode;
  // Pass the error message here: the screen shakes when it changes to a new one.
  shake?: string | null;
};

// Slides and fades its content in when the screen opens, and shakes on errors.
// If the phone has "Reduce Motion" turned on, it skips the movement.
export function Entrance({ children, shake }: EntranceProps) {
  const [progress] = useState(() => new Animated.Value(0));
  const [shakeX] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      setReduceMotion(reduce);
      if (reduce) {
        progress.setValue(1);
        return;
      }
      Animated.timing(progress, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }, [progress]);

  useEffect(() => {
    if (!shake || reduceMotion) return;
    const step = (toValue: number) =>
      Animated.timing(shakeX, { toValue, duration: 55, useNativeDriver: true });
    Animated.sequence([step(10), step(-10), step(7), step(-7), step(0)]).start();
  }, [shake, reduceMotion, shakeX]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [24, 0],
            }),
          },
          { translateX: shakeX },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

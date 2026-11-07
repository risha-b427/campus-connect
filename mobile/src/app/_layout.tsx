import { Stack } from "expo-router";

import { CheckInProvider } from "@/features/check/context/CheckInContext";

export default function RootLayout() {
  return (
    <CheckInProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="search"
          options={{ headerShown: true, title: "Search", headerBackTitle: "Back" }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            title: "Notifications",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </CheckInProvider>
  );
}
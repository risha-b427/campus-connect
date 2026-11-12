import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { CheckInProvider } from "@/features/check/context/CheckInContext";

function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Only logged-out people can see these screens. After logging in or
          signing up, go to Home. */}
      <Stack.Protected guard={!session} redirectTo="/(tabs)/home">
        <Stack.Screen name="index" />
        <Stack.Screen name="sign-up" />
      </Stack.Protected>

      {/* Only logged-in people can see the app. After logging out, go back to
          the login screen. */}
      <Stack.Protected guard={!!session} redirectTo="/">
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
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CheckInProvider>
        <RootNavigator />
      </CheckInProvider>
    </AuthProvider>
  );
}

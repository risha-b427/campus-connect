import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import { supabase } from "@/shared/lib/supabase";

export function ProfileScreen() {
  const { session } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    // The app notices the log out and sends you back to the login screen.
  };

  const email = session?.user.email ?? "";

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{email.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.label}>Logged in as</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <Pressable
        style={[styles.logoutButton, loggingOut && styles.disabled]}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator color="#172033" />
        ) : (
          <Text style={styles.logoutText}>Log out</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6FA",
    padding: 20,
    paddingTop: 64,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE2EA",
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#13294B",
    borderWidth: 3,
    borderColor: "#FF5F05",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    color: "#475569",
  },
  email: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "700",
    color: "#172033",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE2EA",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
  disabled: {
    opacity: 0.6,
  },
});

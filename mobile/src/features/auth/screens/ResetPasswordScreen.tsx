import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { Entrance } from "@/features/auth/components/Entrance";
import { authStyles as styles } from "@/features/auth/authStyles";
import { readResetLink } from "@/features/auth/resetLink";
import { supabase } from "@/shared/lib/supabase";

export function ResetPasswordScreen() {
  // The URL the app was opened with (the link from the reset email).
  const url = Linking.useURL();
  const link = useMemo(() => readResetLink(url), [url]);

  // Result of logging in with the link's tokens: null = still working.
  const [sessionResult, setSessionResult] = useState<
    { ok: true } | { ok: false; message: string } | null
  >(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!link?.accessToken || !link.refreshToken) return;

    supabase.auth
      .setSession({
        access_token: link.accessToken,
        refresh_token: link.refreshToken,
      })
      .then(({ error: sessionError }) => {
        setSessionResult(
          sessionError ? { ok: false, message: sessionError.message } : { ok: true },
        );
      });
  }, [link]);

  const linkError =
    link?.problem ?? (sessionResult && !sessionResult.ok ? sessionResult.message : null);
  const status: "checking" | "ready" | "invalid" = linkError
    ? "invalid"
    : sessionResult?.ok
      ? "ready"
      : "checking";

  const handleSave = async () => {
    setError(null);

    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords don't match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.replace("/home");
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Entrance shake={error}>
        <Text style={styles.title}>New password</Text>
        <Text style={styles.subtitle}>Choose a new password for your account</Text>

        {status === "checking" && <ActivityIndicator />}

        {status === "invalid" && (
          <View style={styles.card}>
            <Text style={styles.error}>{linkError}</Text>
            <Link href="/forgot-password" style={styles.switchLink}>
              Request a new link
            </Link>
          </View>
        )}

        {status === "ready" && (
          <View style={styles.card}>
            <Text style={styles.label}>New password</Text>
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              textContentType="newPassword"
            />

            <Text style={styles.label}>Confirm new password</Text>
            <PasswordInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Type it again"
              textContentType="newPassword"
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <AuthButton label="Save password" onPress={handleSave} loading={loading} />
          </View>
        )}
      </Entrance>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

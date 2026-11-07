import { Link } from "expo-router";
import * as Linking from "expo-linking";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { AuthButton } from "@/features/auth/components/AuthButton";
import { Entrance } from "@/features/auth/components/Entrance";
import { authStyles as styles } from "@/features/auth/authStyles";
import { supabase } from "@/shared/lib/supabase";

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);

    // The link in the email opens the app on the reset-password screen.
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: Linking.createURL("reset-password") },
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("If that email has an account, we sent a link to reset your password.");
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
        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we&apos;ll send you a reset link.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@school.edu"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          {error && <Text style={styles.error}>{error}</Text>}
          {message && <Text style={styles.message}>{message}</Text>}

          <AuthButton label="Send reset link" onPress={handleSend} loading={loading} />
        </View>

        <View style={styles.switchRow}>
          <Link href="/" style={styles.switchLink}>
            Back to log in
          </Link>
        </View>
      </Entrance>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { Link } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { Entrance } from "@/features/auth/components/Entrance";
import { authStyles as styles } from "@/features/auth/authStyles";
import { supabase } from "@/shared/lib/supabase";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
    // On success the app notices the new login and opens Home by itself.
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
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to Campus Connect</Text>

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

          <Text style={styles.label}>Password</Text>
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            textContentType="password"
          />

          <Link href="/forgot-password" style={styles.forgotLink}>
            Forgot password?
          </Link>

          {error && <Text style={styles.error}>{error}</Text>}

          <AuthButton label="Log in" onPress={handleLogin} loading={loading} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Don&apos;t have an account? </Text>
          <Link href="/sign-up" style={styles.switchLink}>
            Sign up
          </Link>
        </View>
      </Entrance>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

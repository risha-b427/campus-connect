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

export function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    setError(null);
    setMessage(null);

    if (!email.trim() || !password) {
      setError("Please enter an email and a password.");
      return;
    }
    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords don't match.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // If Supabase requires email confirmation, there is no session yet.
    if (!data.session) {
      setMessage("Account created! Check your email to confirm it, then log in.");
    }
    // If there is a session, the app notices it and opens Home by itself.
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join Campus Connect</Text>

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
          placeholder="At least 6 characters"
          textContentType="newPassword"
        />

        <Text style={styles.label}>Confirm password</Text>
        <PasswordInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Type it again"
          textContentType="newPassword"
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {message && <Text style={styles.message}>{message}</Text>}

        <AuthButton label="Sign up" onPress={handleSignUp} loading={loading} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account? </Text>
          <Link href="/" style={styles.switchLink}>
            Log in
          </Link>
        </View>
      </Entrance>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

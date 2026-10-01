import { router } from "expo-router";
import { Button, StyleSheet, View } from "react-native";

export function LoginScreen() {
  const handleLogin = () => {
    router.replace("/home");
  };

  return (
    <View style={styles.container}>
      <Button title="Log in" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});

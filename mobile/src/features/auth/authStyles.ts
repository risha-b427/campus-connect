import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F6FA",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#13294B",
    borderLeftWidth: 6,
    borderLeftColor: "#FF5F05",
    paddingLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
    marginTop: 4,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE2EA",
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#172033",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DCE2EA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#172033",
    backgroundColor: "#F4F6FA",
    marginBottom: 16,
  },
  forgotLink: {
    alignSelf: "flex-end",
    color: "#13294B",
    fontSize: 14,
    fontWeight: "600",
    marginTop: -6,
    marginBottom: 16,
  },
  error: {
    color: "#DC2626",
    marginBottom: 16,
  },
  message: {
    color: "#15803D",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#13294B",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  switchText: {
    color: "#475569",
    fontSize: 15,
  },
  switchLink: {
    color: "#13294B",
    fontSize: 15,
    fontWeight: "600",
  },
});

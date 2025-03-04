import { StyleSheet } from "react-native";

const appStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e",
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 30,
  },
  createAccountButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
    width: "20%",
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#444",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    height: 50,
    width: "20%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    textAlign: "left",
  },
  smallText: {
    fontSize: 14,
    color: "#ffffff",
    marginTop: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: '#00A86B',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
    marginTop: 10,
    width: "10%",
    alignItems: "center",
  },
  signUpButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 15,
    width: "10%",
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#444",
  },
});

export default appStyles;
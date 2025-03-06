import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import appStyles from "./styles/appStyles.js";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tier List App</Text>
      <Text style={styles.subtitle}>Create and share tier lists.</Text>
      
      <View style={styles.buttonContainer}>
        {/* Navigate to Login */}
        <TouchableOpacity style={styles.button} onPress={() => router.push("/Login")}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        
        {/* Navigate to Sign Up */}
        <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => router.push("/SignUp")}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: "#2c3e50",
  },
  buttonContainer: {
    flexDirection: "column-reverse",
    justifyContent: "space-between",
    width: "50%",
    paddingHorizontal: 30,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 10,
    margin: 5,
    flex: 1,
    alignItems: "center",
  },
  signupButton: {
    backgroundColor: "#2ecc71",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

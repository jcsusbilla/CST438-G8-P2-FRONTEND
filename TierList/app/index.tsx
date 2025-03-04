import { Text, View, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import appStyles from "./styles/appStyles.js";

export default function LandingScreen() {
  const router = useRouter();
  
  return (
    <View style={appStyles.container}>

      <Text style={appStyles.title}>Tier List</Text>

      {/* Navigate to Signup */}
      <TouchableOpacity style={appStyles.createAccountButton} onPress={() => router.push("/SignUp")}>
        <Text style={appStyles.buttonText}>Create an Account</Text>
      </TouchableOpacity>

      {/* Navigate to Login */}
      <TouchableOpacity style={[appStyles.createAccountButton, appStyles.loginButton]}>
        <Text style={appStyles.buttonText}>Log In</Text>
      </TouchableOpacity>

    </View>
  );
}
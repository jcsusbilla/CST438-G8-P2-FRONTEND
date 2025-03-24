import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert, Modal, Pressable } from "react-native";
import styles from "./styles/appStyles.js";
import { registerUser, loginUser, getUserById, fetchUserDetails } from "@/api/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const isPasswordValid = (pw: string): boolean => {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(pw);
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setModalMessage("Username, Email, and Password are required.");
      setModalVisible(true);
      return;
    }

    if (!isPasswordValid(password)) {
      setModalMessage(
        "Password must be at least 6 characters long, contain letters, numbers, and a special character."
      );
      setModalVisible(true);
      return;
    }

    try {
      console.log("📨 Registering user...");
      const registerResponse = await registerUser(username, email, password, firstName, lastName);
      console.log("📥 registerResponse:", registerResponse);

      if (registerResponse.status === 409 && registerResponse.error) {
        setModalMessage(registerResponse.error);
        setModalVisible(true);
        return;
      }

      if (registerResponse.status === 201) {
        console.log("✅ Registered! Now logging in...");
        await new Promise(resolve => setTimeout(resolve, 500)); // optional delay

        const loginResponse = await loginUser(email, password);
        console.log("📥 loginResponse after register:", loginResponse);

        let userId = loginResponse?.userId;

        // 🔁 Fallback if login response doesn't contain userId
        if (!userId) {
          console.warn("⚠️ loginResponse did not include userId, trying fetchUserDetails...");

          try {
            const userDetails = await fetchUserDetails(email);
            console.log("🧠 fetchUserDetails result:", userDetails, "userDetails.id:", userDetails?.id);

            if (!userDetails || !userDetails.id) {
              console.warn("🚫 fetchUserDetails returned invalid data:", userDetails);
            }

            userId = userDetails?.id;
          } catch (e) {
            console.error("❌ fetchUserDetails threw error:", e);
          }
        }

        if (userId) {
          await AsyncStorage.setItem("userId", String(userId));
          const saved = await AsyncStorage.getItem("userId");
          console.log("✅ Saved to AsyncStorage:", saved);

          router.replace("/Landing");
        } else {
          setModalMessage("Login failed after registration. Could not retrieve user ID.");
          setModalVisible(true);
        }
      }
    } catch (err) {
      console.error("❌ signup error:", err);
      setModalMessage("An unexpected error occurred. Please try again.");
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email *"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password *"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>

      <Pressable onPress={() => router.replace("/Login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Pressable>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push("/")}
      >
        <Text style={styles.buttonText}>BACK</Text>
      </TouchableOpacity>

      {/* Error Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                setModalMessage("");
              }}
            >
              <Text style={styles.buttonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
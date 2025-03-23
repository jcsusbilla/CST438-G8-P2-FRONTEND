import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert, Modal, ScrollView, Pressable } from "react-native";
import styles from "./styles/appStyles.js";
import { registerUser, loginUser, getUserById } from "@/api/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const isPasswordValid = (pw: string): boolean => {
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(pw);
    };

    const handleRegister = async () => {
        if (!username || !email || !password) {
            setErrorMessage("Username, Email, and Password are required.");
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
            console.log("registering user...");
            const registerResponse = await registerUser(
                username,
                email,
                password,
                firstName,
                lastName
          );
    
          console.log("register response:", registerResponse);
    
        if (registerResponse.status === 409 && registerResponse.error) {
            // show modal with backend error
            setErrorMessage(registerResponse.error);
            setModalVisible(true);
            return;
        }

        if (registerResponse.status === 201) {
            console.log("user registered successfully, now logging in...");
    
            const loginResponse = await loginUser(email, password);
    
            if (loginResponse?.userId) {
                await AsyncStorage.setItem("userId", String(loginResponse.userId));
                router.replace("/Landing");
            } else {
                setErrorMessage("Login failed after registration.");
                setModalVisible(true);
            }
        } 
        
        } catch (err) {
            console.error("signup error:", err);
            setErrorMessage("An unexpected error occurred. Please try again.");
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

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => router.push("/")}>
                <Text style={styles.buttonText}>BACK</Text>
            </TouchableOpacity>
        
            {/* modal for password or field errors */}
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
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.buttonText}>OK</Text>
                    </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
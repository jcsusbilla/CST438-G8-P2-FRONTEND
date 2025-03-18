import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import appStyles from "./styles/appStyles.js";
import { registerUser } from "@/api/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password: string) => password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password);

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }
    
        console.log("Collected User Data:");
        console.log("Username:", username);
        console.log("Email:", email);
        console.log("Password:", password);
    
        try {
            const userData = { username, email, password, firstName, lastName };
            await registerUser(userData);
            console.log("Registration successful!");
    
            Alert.alert("Success", "Account created! Redirecting...");
    
            await AsyncStorage.setItem("userEmail", email);
            router.replace("/Landing");
        } catch (err: any) {
            console.error("Registration error:", err.message);
            Alert.alert("Registration Failed", err.message);
        }
    };

    return (
        <View style={appStyles.container}>
            <Text style={appStyles.title}>Create Your Account!</Text>

            <TextInput style={appStyles.input} placeholder="Enter a username" value={username} onChangeText={setUsername} />
            <TextInput style={appStyles.input} placeholder="Enter email" value={email} onChangeText={setEmail} />
            <TextInput style={appStyles.input} placeholder="Enter a password" secureTextEntry={true} value={password} onChangeText={setPassword} />
            <TextInput style={appStyles.input} placeholder="Enter first name" value={firstName} onChangeText={setFirstName} />
            <TextInput style={appStyles.input} placeholder="Enter last name" value={lastName} onChangeText={setLastName} />

            <TouchableOpacity style={appStyles.signUpButton} onPress={handleRegister} disabled={loading}>
                <Text style={appStyles.buttonText}>{loading ? "Registering..." : "REGISTER"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/Login")}>
                <Text style={appStyles.buttonText}>LOG IN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/")}>
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
}
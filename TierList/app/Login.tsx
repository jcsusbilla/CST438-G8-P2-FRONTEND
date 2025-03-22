import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import appStyles from "./styles/appStyles.js";
import { loginUser } from "@/api/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in both fields.");
            return;
        }
    
        try {
            setLoading(true);
            const response = await loginUser(email, password);
            if (response && response.message === "Login successful") {
                await AsyncStorage.setItem("userEmail", email);
                //jc
                if (response.userId) {
                    await AsyncStorage.setItem("userId", String(response.userId));
                    console.log("✅ Stored userId:", response.userId);
                }
                router.replace(`/Landing?email=${email}`);
            } else {
                Alert.alert("Login Failed", response.message || "Unexpected error.");
            }
        } catch (err) {
            Alert.alert("Login Failed", "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={appStyles.container}>
            <Text style={appStyles.title}>Login</Text>

            <TextInput
                style={appStyles.input}
                placeholder="Enter email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={appStyles.input}
                placeholder="Enter password"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={appStyles.button} onPress={handleLogin} disabled={loading}>
                <Text style={appStyles.buttonText}>{loading ? "LOGGING IN..." : "LOG IN"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/")}>
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
}
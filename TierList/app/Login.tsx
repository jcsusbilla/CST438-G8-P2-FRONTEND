import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import appStyles from "./styles/appStyles.js";
import { loginUser, loginWithGoogle } from "@/api/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Google OAuth Request
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: "653433989841-i9tjusnnltg34encolsimput0t0nndof.apps.googleusercontent.com",
        redirectUri: "https://tier-list-app-2c41fcb37475.herokuapp.com/"  
    });

    useEffect(() => {
        if (response?.type === "success") {
            const { authentication } = response;
            handleGoogleLogin(authentication?.accessToken);
        }
    }, [response]);

    const handleGoogleLogin = async (token: string | undefined) => {
        if (!token) return;

        try {
            setLoading(true);
            const message = await loginWithGoogle(token);  
            Alert.alert("Success", message);
            router.push("/Landing");
        } catch (err: any) {
            Alert.alert("Google Login Failed.", err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in both fields.");
            return;
        }

        try {
            const response = await loginUser(email, password);  
            console.log("Login API Response:", response);

            if (response && response.message === "Login successful") {
                await AsyncStorage.setItem("userEmail", email);
                console.log("Navigating to Landing...");
                router.replace("/Landing");
            } else {
                Alert.alert("Login Failed", response.message || "Unexpected error.");
            }
        } catch (err) {
            console.error("Login error:", err);
            Alert.alert("Login Failed", "An error occurred. Please try again.");
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

            <TouchableOpacity 
                style={appStyles.button} 
                onPress={() => request ? promptAsync() : Alert.alert("Error", "Google Login request not initialized.")}
            >
                <Text style={appStyles.buttonText}>LOGIN WITH GOOGLE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.button} onPress={() => router.push("/")}>
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
}

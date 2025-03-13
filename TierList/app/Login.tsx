import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import appStyles from "./styles/appStyles.js";
import { loginUser, loginWithGoogle } from "@/api/userApi";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // configure the google oauth
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: "YOUR_GOOGLE_CLIENT_ID" 
    });

    // handle google oauth response
    useEffect(() => {
        if (response?.type === "success") {
            const { authentication } = response;
            handleGoogleLogin(authentication?.accessToken);
        }
    }, [response]);

    const handleGoogleLogin = async (token: string | undefined) => {
        if (!token) return;

        try {
            const message = await loginWithGoogle(token);
            Alert.alert("Success", message);
            router.push("/Landing");
        } catch (err: any) {
            Alert.alert("Google Login Failed.", err.message);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in both fields");
            return;
        }

        try {
            const message = await loginUser(email, password);
            Alert.alert("Success", message);
            router.push("/Landing");
        } catch (err: any) {
            Alert.alert("Login Failed.", err.message);
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

            <TouchableOpacity style={appStyles.button} onPress={handleLogin}>
                <Text style={appStyles.buttonText}>LOG IN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.button} onPress={() => promptAsync()}>
                <Text style={appStyles.buttonText}>LOGIN WITH GOOGLE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.button} onPress={() => router.push("/")}>
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
}
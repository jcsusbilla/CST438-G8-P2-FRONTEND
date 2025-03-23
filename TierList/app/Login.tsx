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
       
        // this is where the window redirects to after authentication. It is required to have a redirect URI
        redirectUri: "https://tier-list-app-2c41fcb37475.herokuapp.com/"  
    });

    // Handle the Google OAuth response
    useEffect(() => {
        if (response?.type === "success") {
            const { authentication } = response;
            handleGoogleLogin(authentication?.accessToken);
        }
    }, [response]);

    // Handle Google login
    const handleGoogleLogin = async (token: string | undefined) => {
        if (!token) return;

        try {
            setLoading(true);
            // the problem could be with loginWithGoogle function in userApi.ts
            const message = await loginWithGoogle(token);  
            Alert.alert("Success", message);

            // Redirect to the Landing page after successful Google login (This is not happening)
            router.replace("/Landing"); 
        } catch (err: any) {
            Alert.alert("Google Login Failed.", err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle email/password login
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in both fields.");
            return;
        }
    
        try {
            setLoading(true);
            const response = await loginUser(email, password); // Regular login API
            if (response && response.message === "Login successful") {
                await AsyncStorage.setItem("userEmail", email);
                // Store userId if available
                if (response.userId) {
                    await AsyncStorage.setItem("userId", String(response.userId));
                    console.log("✅ Stored userId:", response.userId);
                }
                // Redirect to the Landing page after successful login
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

            {/* Google Login Button */}
            <TouchableOpacity 
                style={appStyles.button} 
                onPress={() => request ? promptAsync() : Alert.alert("Error", "Google Login request not initialized.")}
            >
                <Text style={appStyles.buttonText}>LOGIN WITH GOOGLE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/")}>
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
}

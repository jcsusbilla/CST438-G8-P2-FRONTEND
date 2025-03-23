//@ts-nocheck

import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from "react-native";
import * as Google from "expo-auth-session/providers/google"; 
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appStyles from "./styles/appStyles.js";
import { AuthService } from "@/api/apiService"; 

// Required for Google Auth - registers the browser that will handle OAuth redirects
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Google OAuth Request with simplified configuration
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: "653433989841-i9tjusnnltg34encolsimput0t0nndof.apps.googleusercontent.com", 
        // Set redirect URI to our frontend
        redirectUri: "http://localhost:8081",
        // Scopes to request from Google
        scopes: ["profile", "email"],
        // This helps Expo correctly handle the redirect flow
        usePKCE: true
    });

    // Handle the Google OAuth response
    useEffect(() => {
        if (response?.type === "success") {
            handleGoogleSuccessResponse(response);
        }
    }, [response]);

    // Handle successful Google auth response by getting user data directly from token
    const handleGoogleSuccessResponse = async (authResponse) => {
        try {
            setLoading(true);
            console.log("Auth response received:", authResponse);
            
            // Extract the access token from the response
            const { authentication } = authResponse;
            
            if (!authentication || !authentication.accessToken) {
                throw new Error("No authentication token received");
            }
            
            // Get user info directly from Google (bypass backend for now)
            const userInfoResponse = await fetch(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                    headers: { Authorization: `Bearer ${authentication.accessToken}` }
                }
            );
            
            if (!userInfoResponse.ok) {
                throw new Error("Failed to get user info from Google");
            }
            
            const userData = await userInfoResponse.json();
            console.log("User data from Google:", userData);
            
            // Extract essential user data
            const googleEmail = userData.email;
            const googleName = userData.name || '';
            const [firstName, ...lastNameParts] = googleName.split(' ');
            const lastName = lastNameParts.join(' ');
            
            // Store user data in AsyncStorage
            await AsyncStorage.setItem("userEmail", googleEmail);
            
            // Prepare to register or log in the user with Google credentials
            console.log("Redirecting to Landing with Google data");
            
            // Navigate to Landing with user info
            router.push({
                pathname: "/Landing",
                params: { email: googleEmail }
            });
        } catch (err) {
            console.error("Google login error:", err);
            Alert.alert("Google Login Failed", err.message || "An unexpected error occurred");
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
            console.log("Starting login process for email:", email);
            
            const response = await AuthService.login(email, password);
            console.log("Login response received:", response);
            
            if (response && response.message === "Login successful") {
                // Success - store email and redirect
                await AsyncStorage.setItem("userEmail", email);
                // Store userId if available
                if (response.userId) {
                    await AsyncStorage.setItem("userId", String(response.userId));
                    console.log("✅ Stored userId:", response.userId);
                }
                // Redirect to the Landing page after successful login
                router.replace(`/Landing?email=${email}`);
            } else {
                // Unexpected success response
                Alert.alert("Login Issue", "Received unexpected response from server");
            }
        } catch (error) {
            console.error("Login error:", error);
            // Show error from API service
            Alert.alert("Login Failed", error.message || "An unknown error occurred");
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
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={appStyles.input}
                placeholder="Enter password"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity 
                style={appStyles.button} 
                onPress={handleLogin} 
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                    <Text style={appStyles.buttonText}>LOG IN</Text>
                )}
            </TouchableOpacity>

            {/* Google Login Button */}
            <TouchableOpacity 
                style={appStyles.button} 
                onPress={() => request ? promptAsync() : Alert.alert("Error", "Google Login request not initialized.")}
                disabled={loading}
            >
                <Text style={appStyles.buttonText}>{loading ? "PROCESSING..." : "LOGIN WITH GOOGLE"}</Text>
            </TouchableOpacity>

            {/* Google Login Button
            <TouchableOpacity 
                style={appStyles.button} 
                onPress={() => request ? promptAsync() : Alert.alert("Error", "Google Login request not initialized.")}
                disabled={loading}
            >
                <Text style={appStyles.buttonText}>{loading ? "PROCESSING..." : "LOGIN WITH GOOGLE"}</Text>
            </TouchableOpacity> */}

            <TouchableOpacity 
                style={[appStyles.button, appStyles.secondaryButton]} 
                onPress={() => router.push("/")}
                disabled={loading}
            >
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
}
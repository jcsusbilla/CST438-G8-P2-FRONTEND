//@ts-nocheck

import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from "react-native";
import * as Google from "expo-auth-session/providers/google"; 
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appStyles from "./styles/appStyles.js";
import { AuthService } from "@/api/apiService"; 
import API_BASE_URL from "@/api/apiConfig";
import axios from "axios";

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

    const registerGoogleUser = async (googleEmail, firstName, lastName) => {
        try {
            console.log("Registering new Google user:", { googleEmail, firstName, lastName });
            
            const response = await axios.post(`${API_BASE_URL}/user/register-google-user`, {
                email: googleEmail,
                firstName: firstName || "",
                lastName: lastName || "",
            }, {
                withCredentials: true // Important: Send cookies with the request
            });
            
            console.log("Registration response:", response.data);
            
            if (response.data && response.data.userId) {
                const newUserId = String(response.data.userId);
                console.log("New user registered with ID:", newUserId);
                await AsyncStorage.setItem("userId", newUserId);
                
                // Store essential session data
                await AsyncStorage.setItem("userEmail", googleEmail);
                if (response.data.role) {
                    await AsyncStorage.setItem("userRole", response.data.role);
                }
                
                return newUserId;
            } else {
                console.warn("Registration did not return a user ID");
                return null;
            }
        } catch (error) {
            console.error("Error registering Google user:", error);
            
            if (error.response && error.response.data && error.response.data.userId) {
                console.log("User already exists with ID:", error.response.data.userId);
                await AsyncStorage.setItem("userId", String(error.response.data.userId));
                return error.response.data.userId;
            }
            
            return null;
        }
    };

    const handleGoogleSuccessResponse = async (authResponse) => {
        try {
            setLoading(true);
            console.log("Auth response received:", authResponse);
    
            const { authentication } = authResponse;
            
            if (!authentication || !authentication.accessToken) {
                throw new Error("No authentication token received");
            }
            
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
            
            try {
                const response = await fetch(`${API_BASE_URL}/user/register-google-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: googleEmail,
                        firstName: firstName || '',
                        lastName: lastName || ''
                    }),
                    credentials: 'include' // Important: include cookies
                });
                
                if (!response.ok) {
                    throw new Error("Failed to register Google user with backend");
                }
                
                const result = await response.json();
                console.log("Backend Google user registration response:", result);
                
                // Store essential data in AsyncStorage
                await AsyncStorage.setItem("userEmail", googleEmail);
                
                if (result.userId) {
                    await AsyncStorage.setItem("userId", String(result.userId));
                }
                
                if (result.role) {
                    await AsyncStorage.setItem("userRole", result.role);
                }
                
                // Now make a request to verify session is active
                await fetch(`${API_BASE_URL}/user/details?email=${encodeURIComponent(googleEmail)}`, {
                    credentials: 'include'
                });
                
                // Navigate to landing page
                router.replace({
                    pathname: "/Landing",
                    params: { email: googleEmail }
                });
            } catch (error) {
                console.error("Error processing Google login:", error);
                Alert.alert("Login Error", error.message || "Failed to process Google login");
            }
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
            
            // First clear any existing userId from storage to avoid using stale data
            await AsyncStorage.removeItem("userId");
            
            const response = await AuthService.login(email, password);
            console.log("Login response received:", response);
            
            if (response && response.message === "Login successful") {
                // Success - store email
                await AsyncStorage.setItem("userEmail", email);
                
                // IMPORTANT: Store userId from response if available
                if (response.userId) {
                    const userId = String(response.userId);
                    await AsyncStorage.setItem("userId", userId);
                    console.log("Stored correct userId from login response:", userId);
                } else {
                    // If userId not in response, try to get it directly from the API
                    try {
                        console.log("Fetching userId for email:", email);
                        const userIdResponse = await fetch(`${API_BASE_URL}/user/getUserId?email=${encodeURIComponent(email)}`);
                        
                        if (userIdResponse.ok) {
                            const userIdData = await userIdResponse.json();
                            
                            if (userIdData && userIdData.userId) {
                                const newUserId = String(userIdData.userId);
                                console.log("Retrieved userId from API:", newUserId);
                                await AsyncStorage.setItem("userId", newUserId);
                            } else {
                                console.warn("No userId found in response");
                            }
                        } else {
                            console.error("Failed to fetch userId:", userIdResponse.status);
                        }
                    } catch (error) {
                        console.error("Error fetching userId:", error);
                    }
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
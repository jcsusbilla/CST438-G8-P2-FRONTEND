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
            
            const username = googleEmail.split('@')[0];
            
            const response = await axios.post(`${API_BASE_URL}/user/register-google-user`, {
                email: googleEmail,
                firstName: firstName || "",
                lastName: lastName || "",
            });
            
            console.log("Registration response:", response.data);
            
            if (response.data && response.data.userId) {
                const newUserId = String(response.data.userId);
                console.log("New user registered with ID:", newUserId);
                await AsyncStorage.setItem("userId", newUserId);
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
            
            await AsyncStorage.setItem("userEmail", googleEmail);
            
            await AsyncStorage.removeItem("userId");
            
            try {
                console.log("Checking if Google user exists:", googleEmail);
                const userIdResponse = await fetch(`${API_BASE_URL}/user/getUserId?email=${encodeURIComponent(googleEmail)}`);
                
                let userId = null;
                
                if (userIdResponse.ok) {
                    const userIdData = await userIdResponse.json();
                    
                    if (userIdData && userIdData.userId) {
                        userId = String(userIdData.userId);
                        console.log("Existing user found with ID:", userId);
                        await AsyncStorage.setItem("userId", userId);
                    } else {
                        console.log("User doesn't exist, registering new account");
                        // User doesn't exist, register them
                        userId = await registerGoogleUser(googleEmail, firstName, lastName);
                    }
                } else {
                    console.log("User doesn't exist or error occurred, registering new account");
                    // User doesn't exist or there was an error, try registering them
                    userId = await registerGoogleUser(googleEmail, firstName, lastName);
                }
                
                if (!userId) {
                    console.error("Failed to get or create a user ID for Google login");
                    Alert.alert("Login Error", "Failed to retrieve or create user account");
                    setLoading(false);
                    return;
                }
            } catch (error) {
                console.error("Error processing Google login:", error);
                Alert.alert("Login Error", "An error occurred during Google login");
                setLoading(false);
                return;
            }
            
            console.log("Redirecting to Landing with Google data");
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
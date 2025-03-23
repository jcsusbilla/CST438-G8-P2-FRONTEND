//@ts-nocheck

import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import * as Google from "expo-auth-session/providers/google"; 
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appStyles from "./styles/appStyles.js";
import { AuthService } from "@/api/apiService"; 
import API_BASE_URL from "@/api/apiConfig";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: "653433989841-i9tjusnnltg34encolsimput0t0nndof.apps.googleusercontent.com", 
        redirectUri: "http://localhost:8081",
        scopes: ["profile", "email"],
        usePKCE: true
    });

    useEffect(() => {
        if (response?.type === "success") {
            handleGoogleSuccessResponse(response);
        }
    }, [response]);

    const handleGoogleSuccessResponse = async (authResponse) => {
        try {
            setLoading(true);
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
            const googleEmail = userData.email;
            const googleName = userData.name || '';
            const [firstName, ...lastNameParts] = googleName.split(' ');
            const lastName = lastNameParts.join(' ');
            
            await AsyncStorage.setItem("userEmail", googleEmail);
            await AsyncStorage.removeItem("userId");
            
            try {
                const userIdResponse = await fetch(`${API_BASE_URL}/user/getUserId?email=${encodeURIComponent(googleEmail)}`);
                
                if (userIdResponse.ok) {
                    const userIdData = await userIdResponse.json();
                    
                    if (userIdData && userIdData.userId) {
                        const newUserId = String(userIdData.userId);
                        await AsyncStorage.setItem("userId", newUserId);
                    }
                }
            } catch (error) {
                console.error("Error fetching userId for Google login:", error);
            }
            
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

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in both fields.");
            return;
        }
    
        try {
            setLoading(true);
            await AsyncStorage.removeItem("userId");
            
            const response = await AuthService.login(email, password);
            
            if (response && response.message === "Login successful") {
                await AsyncStorage.setItem("userEmail", email);
                
                if (response.userId) {
                    const userId = String(response.userId);
                    await AsyncStorage.setItem("userId", userId);
                } else {
                    try {
                        const userIdResponse = await fetch(`${API_BASE_URL}/user/getUserId?email=${encodeURIComponent(email)}`);
                        
                        if (userIdResponse.ok) {
                            const userIdData = await userIdResponse.json();
                            
                            if (userIdData && userIdData.userId) {
                                const newUserId = String(userIdData.userId);
                                await AsyncStorage.setItem("userId", newUserId);
                            }
                        }
                    } catch (error) {
                        console.error("Error fetching userId:", error);
                    }
                }
                
                router.replace(`/Landing?email=${email}`);
            } else {
                Alert.alert("Login Issue", "Received unexpected response from server");
            }
        } catch (error) {
            console.error("Login error:", error);
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
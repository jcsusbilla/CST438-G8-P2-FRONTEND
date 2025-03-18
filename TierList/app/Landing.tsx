import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutUser, fetchUserDetails } from "@/api/userApi"; // Ensure this is imported
import appStyles from "./styles/appStyles.js";

export default function LandingScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const [user, setUser] = useState<{ username: string, firstName: string, lastName: string } | null>(null);
    const [emailStr, setEmailStr] = useState("");

    useEffect(() => {
        const loadEmail = async () => {
            try {
                const storedEmail = email ? email.toString() : await AsyncStorage.getItem("userEmail");
                console.log("Loaded email from storage:", storedEmail);
    
                if (storedEmail) {
                    setEmailStr(storedEmail);
                    getUserData(storedEmail);
                } else {
                    console.log("No email found, redirecting to login.");
                    router.replace("/Login");
                }
            } catch (err) {
                console.error("Error loading email:", err);
                router.replace("/Login");
            }
        };
    
        loadEmail();
    }, []);

    // **Define getUserData function**
    const getUserData = async (emailToFetch: string) => {
        try {
            console.log("Fetching user data for:", emailToFetch);
            const userData = await fetchUserDetails(emailToFetch); // Ensure this function exists in userApi.ts
            console.log("Fetched user data:", userData);
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user details:", error);
            Alert.alert("Error", "Failed to load user details.");
        }
    };

    return (
        <View style={appStyles.container}>
            {user ? (
                <Text style={appStyles.title}>
                    Hello, {user.firstName} {user.lastName}
                </Text>
            ) : (
                <Text>Loading user details...</Text>
            )}

            <TouchableOpacity style={appStyles.createAccountButton} onPress={() => router.push("/Account")}>
                <Text style={appStyles.buttonText}>ACCOUNT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.createAccountButton} onPress={() => router.push("/TierList")}>
                <Text style={appStyles.buttonText}>TIER LIST PAGE</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={appStyles.button}
                onPress={async () => {
                    await AsyncStorage.removeItem("userEmail"); // Clear user data
                    router.replace("/Login");
                }}
            >
                <Text style={appStyles.buttonText}>LOG OUT</Text>
            </TouchableOpacity>
        </View>
    );
}
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import appStyles from "./styles/appStyles.js";
import { logoutUser, fetchUserDetails } from "@/api/userApi";

export default function LandingScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const emailStr = Array.isArray(email) ? email[0] : email || "";                                                     // make sure email is a string
    const [user, setUser] = useState<{ username: string, firstName: string, lastName: string } | null>(null);

    useEffect(() => {
        const getUserData = async () => {
            try {
                if (!emailStr) return;                                                                                  // prevents API call if email is empty
                const userData = await fetchUserDetails(emailStr);
                setUser(userData);
            } catch (error) {
                Alert.alert("Error", "Failed to load user details.");
            }
        };

        getUserData();
    }, [emailStr]);

    return (
        <View style={appStyles.container}>
            {/* only display greeting if user data is available */}
            {user && (
                <Text style={appStyles.title}>
                    Hello, {user.firstName} {user.lastName}
                </Text>
            )}

            <TouchableOpacity style={appStyles.createAccountButton} onPress={() => router.push("/Account")}>
                <Text style={appStyles.buttonText}>ACCOUNT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.createAccountButton} onPress={() => router.push("/TierList")}>
                <Text style={appStyles.buttonText}>TIER LIST PAGE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.createAccountButton} onPress={async () => {
                try {
                    await logoutUser();
                    router.push('/');
                } catch (error) {
                    Alert.alert("Logout error");
                }
            }}>
                <Text style={appStyles.buttonText}>LOGOUT</Text>
            </TouchableOpacity>
        </View>
    );
}

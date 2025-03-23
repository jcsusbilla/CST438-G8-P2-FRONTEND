import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutUser, fetchUserDetails } from "@/api/userApi";
import appStyles from "./styles/appStyles.js";
import { useFocusEffect } from "@react-navigation/native";
import { getUserById } from "@/api/userApi";


export default function LandingScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const [user, setUser] = useState<{ username: string, firstName: string, lastName: string } | null>(null);
    const [emailStr, setEmailStr] = useState("");

      // re-fetch user data every time screen is focused
      useFocusEffect(
        React.useCallback(() => {
          const loadUser = async () => {
            const storedUserId = await AsyncStorage.getItem("userId");
            if (storedUserId) {
              const response = await getUserById(Number(storedUserId));
              if (response?.username) {
                setUser({
                  username: response.username,
                  firstName: response.firstName,
                  lastName: response.lastName,
                });
              }
            }
          };
          loadUser();
        }, [])
      );

    // fetch user details
    const getUserData = async (emailToFetch: string) => {
        try {
            console.log("Fetching user data for:", emailToFetch);
            const userData = await fetchUserDetails(emailToFetch);
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
                    Hello, {user.username}
                </Text>
            ) : (
                <Text>Loading user details...</Text>
            )}

            <TouchableOpacity style={appStyles.createAccountButton} onPress={() => router.push("/Account")}>
                <Text style={appStyles.buttonText}>ACCOUNT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.createAccountButton} onPress={() => router.push("/TierList")}>
                <Text style={appStyles.buttonText}>CREATE TIER LIST</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.createAccountButton} onPress={() => router.push("/PastTierList")}>
                <Text style={appStyles.buttonText}>PREVIOUS TIER LISTS</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[appStyles.button, appStyles.secondaryButton]}
                onPress={async () => {
                    await AsyncStorage.removeItem("userEmail");
                    router.replace("/Login");
                }}
            >
                <Text style={appStyles.buttonText}>LOG OUT</Text>
            </TouchableOpacity>
        </View>
    );
}
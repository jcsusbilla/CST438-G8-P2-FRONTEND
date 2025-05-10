import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutUser, fetchUserDetails } from "@/api/userApi"; // Ensure this is imported
import appStyles from "./styles/appStyles.js";
import API_BASE_URL from "@/api/apiConfig";

export default function LandingScreen() {
	const router = useRouter();
	const { email } = useLocalSearchParams();
	const [user, setUser] = useState<{
		userName: string;
		firstName: string;
		lastName: string;
		role: string;
	} | null>(null);
	const [emailStr, setEmailStr] = useState("");
	const [isAdmin, setIsAdmin] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);

	// First load the email from parameters or storage
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

    // Fetch and verify user ID
    useEffect(() => {
        const fetchCorrectUserId = async () => {
            try {
                if (!emailStr) return;
                
                // Always fetch the correct user ID from the server
                const response = await fetch(`${API_BASE_URL}/user/getUserId?email=${encodeURIComponent(emailStr)}`);
                
                if (!response.ok) {
                    console.error("Failed to fetch user ID from server");
                    return;
                }
                
                const data = await response.json();
                
                if (data && data.userId) {
                    const newUserId = String(data.userId);
                    console.log("✅ Retrieved correct userId from server:", newUserId);
                    
                    // Update state and storage with the correct ID
                    setUserId(newUserId);
                    await AsyncStorage.setItem("userId", newUserId);
                }
            } catch (error) {
                console.error("Error fetching correct user ID:", error);
            }
        };
        
        fetchCorrectUserId();
    }, [emailStr]);

	// Fetch user details
	const getUserData = async (emailToFetch: string) => {
		try {
			console.log("Fetching user data for:", emailToFetch);
			const userData = await fetchUserDetails(emailToFetch);
			console.log("Fetched user data:", userData);
			setUser(userData);

			// This is to check if user is an admin based on their role
			if (userData.role && userData.role.toUpperCase() === "ADMIN") {
				console.log("User has ADMIN role - enabling admin features");
				setIsAdmin(true);
				// This stores role in AsyncStorage for persistence
				await AsyncStorage.setItem("userRole", userData.role);
			}
		} catch (error) {
			console.error("Failed to fetch user details:", error);
			Alert.alert("Error", "Failed to load user details.");
		}
	};

	return (
		<View style={appStyles.container}>
			{user ? (
				<Text style={appStyles.title}>
					Hello, {user.firstName || ""} {user.lastName || ""}
					{isAdmin && " (Admin)"}
				</Text>
			) : (
				<Text>Loading user details...</Text>
			)}

			{isAdmin && (
				<TouchableOpacity style={appStyles.createAccountButton} onPress={() => router.push("/Admin")}>
					<Text style={appStyles.buttonText}>ADMIN DASHBOARD</Text>
				</TouchableOpacity>
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
				style={appStyles.button}
				onPress={async () => {
					await AsyncStorage.removeItem("userEmail");
					await AsyncStorage.removeItem("userRole");
					await AsyncStorage.removeItem("userId");
					router.replace("/Login");
				}}
			>
				<Text style={appStyles.buttonText}>LOG OUT</Text>
			</TouchableOpacity>
		</View>
	);
}
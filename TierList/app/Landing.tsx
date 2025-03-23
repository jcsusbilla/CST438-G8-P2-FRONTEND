import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutUser, fetchUserDetails } from "@/api/userApi"; // Ensure this is imported
import appStyles from "./styles/appStyles.js";

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

    //jc
    useEffect(() => {
        const fetchUserId = async () => {
            const storedUserId = await AsyncStorage.getItem("userId");
            console.log("🔍 Retrieved `userId` from AsyncStorage:", storedUserId);
            if (!storedUserId) {
                console.warn("`userId` is missing in AsyncStorage!");
            }
        };
        fetchUserId();
    }, []);

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
					router.replace("/Login");
				}}
			>
				<Text style={appStyles.buttonText}>LOG OUT</Text>
			</TouchableOpacity>
		</View>
	);
}

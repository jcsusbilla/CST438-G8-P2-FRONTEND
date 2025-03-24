import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutUser, fetchUserDetails } from "@/api/userApi";
import appStyles from "./styles/appStyles.js";
import { useFocusEffect } from "@react-navigation/native";
import { getUserById } from "@/api/userApi";

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
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkUserSession = async () => {
			try {
				setLoading(true);
				const storedEmail = email ? email.toString() : await AsyncStorage.getItem("userEmail");

				if (!storedEmail) {
					router.replace("/Login");
					return;
				}

				setEmailStr(storedEmail);
				const storedId = await AsyncStorage.getItem("userId");
				if (storedId) {
					setUserId(storedId);
				}

				try {
					const userData = await fetchUserDetails(storedEmail);
					setUser(userData);

					if (userData.role && userData.role.toUpperCase() === "ADMIN") {
						setIsAdmin(true);
						await AsyncStorage.setItem("userRole", userData.role);
					}

					if (!storedId) {
						try {
							const response = await fetch(`${API_BASE_URL}/user/getUserId?email=${encodeURIComponent(storedEmail)}`, { credentials: "include" });

							if (response.ok) {
								const data = await response.json();
								if (data && data.userId) {
									const newUserId = String(data.userId);
									setUserId(newUserId);
									await AsyncStorage.setItem("userId", newUserId);
								}
							}
						} catch (error) {
							console.error("Error fetching user ID:", error);
						}
					}
				} catch (error) {
					console.error("Failed to fetch user details:", error);
					Alert.alert("Session Error", "Unable to verify your session. Please log in again.");
					router.replace("/Login");
				}
			} catch (error) {
				console.error("Session check error:", error);
				router.replace("/Login");
			} finally {
				setLoading(false);
			}
		};

		checkUserSession();
	}, []);

	const handleLogout = async () => {
		try {
			await logoutUser().catch((err) => {
				console.warn("Server logout failed, continuing with client logout");
			});

			await AsyncStorage.removeItem("userEmail");
			await AsyncStorage.removeItem("userRole");
			await AsyncStorage.removeItem("userId");

			router.replace("/Login");
		} catch (error) {
			console.error("Logout error:", error);
			await AsyncStorage.multiRemove(["userEmail", "userRole", "userId"]);
			router.replace("/Login");
		}
	};

	if (loading) {
		return (
			<View style={[appStyles.container, { justifyContent: "center", alignItems: "center" }]}>
				<ActivityIndicator size="large" color="#00A86B" />
				<Text style={{ marginTop: 20 }}>Loading your profile...</Text>
			</View>
		);
	}

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

			<TouchableOpacity style={appStyles.button} onPress={handleLogout}>
				<Text style={appStyles.buttonText}>LOG OUT</Text>
			</TouchableOpacity>
		</View>
	);
}

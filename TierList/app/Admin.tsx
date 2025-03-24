// File: TierList/app/Admin.tsx
//@ts-nocheck

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Alert, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appStyles from "./styles/appStyles.js";
import axios from "axios";
import API_BASE_URL from "@/api/apiConfig";

export default function AdminScreen() {
	const router = useRouter();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [userEmail, setUserEmail] = useState("");
	const [userId, setUserId] = useState("");
	const [userRole, setUserRole] = useState("");

	const [createUserModal, setCreateUserModal] = useState(false);
	const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	const [newUsername, setNewUsername] = useState("");
	const [newEmail, setNewEmail] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [newFirstName, setNewFirstName] = useState("");
	const [newLastName, setNewLastName] = useState("");
	const [newRole, setNewRole] = useState("USER");

	// First, load user info from storage
	useEffect(() => {
		const loadUserInfo = async () => {
			try {
				const email = await AsyncStorage.getItem("userEmail");
				const id = await AsyncStorage.getItem("userId");
				const role = await AsyncStorage.getItem("userRole");

				console.log("Admin user info:", { email, id, role });
				
				setUserEmail(email || "");
				setUserId(id || "");
				setUserRole(role || "");

				// If not an admin, redirect back to landing
				if (!email || role !== "ADMIN") {
					console.log("Not an admin user, redirecting");
					Alert.alert("Access Denied", "Admin privileges required");
					router.replace("/Landing");
					return;
				}

				// If we have valid admin user info, fetch users
				if (email && role === "ADMIN") {
					fetchUsers();
				}
			} catch (error) {
				console.error("Error loading user info:", error);
				Alert.alert("Error", "Failed to load user information");
				router.replace("/Landing");
			}
		};

		loadUserInfo();
	}, []);

	// Fetch users with direct API call
	const fetchUsers = async () => {
		try {
			setLoading(true);
			console.log("Fetching all users...");
			
			// Create a simple cookie with user info for authentication
			document.cookie = `userEmail=${encodeURIComponent(userEmail)}; path=/`;
			
			// Make the request with credentials
			const response = await fetch(`${API_BASE_URL}/user/all`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			});
			
			if (!response.ok) {
				throw new Error(`Server returned ${response.status}: ${response.statusText}`);
			}
			
			const data = await response.json();
			console.log(`Fetched ${Array.isArray(data) ? data.length : 0} users`);
			
			if (Array.isArray(data)) {
				setUsers(data);
			} else {
				console.error("Unexpected response format:", data);
				setUsers([]);
			}
		} catch (error) {
			console.error("Error fetching users:", error);
			Alert.alert("Error", `Failed to fetch users: ${error.message}`);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const handleCreateUser = async () => {
		if (!newUsername || !newEmail || !newPassword) {
			Alert.alert("Error", "Username, email, and password are required");
			return;
		}

		try {
			setLoading(true);

			// Create form data object
			const formData = new FormData();
			formData.append("user_name", newUsername);
			formData.append("email", newEmail);
			formData.append("password", newPassword);
			formData.append("first_name", newFirstName || "");
			formData.append("last_name", newLastName || "");

			console.log("Creating new user:", newUsername);

			// Use regular fetch with credentials
			const response = await fetch(`${API_BASE_URL}/user/register`, {
				method: 'POST',
				credentials: 'include',
				body: formData
			});

			const responseText = await response.text();
			console.log("📝 Create user response:", responseText);

			if (response.ok) {
				Alert.alert("Success", "User created successfully");

				// Clear form and close modal
				setNewUsername("");
				setNewEmail("");
				setNewPassword("");
				setNewFirstName("");
				setNewLastName("");
				setNewRole("USER");
				setCreateUserModal(false);

				// Refresh user list
				fetchUsers();
			} else {
				Alert.alert("Error", responseText || "Failed to create user");
			}
		} catch (error) {
			console.error("Error creating user:", error);
			Alert.alert("Error", `Failed to create user: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateUserRole = async (userId, newRole) => {
		try {
			setLoading(true);
			console.log(`🔄 Updating user ${userId} to role ${newRole}`);
			
			// Use fetch with credentials
			const response = await fetch(`${API_BASE_URL}/user/admin/update-role/${userId}?newRole=${newRole}`, {
				method: 'PATCH',
				credentials: 'include',
			});
			
			const responseText = await response.text();
			console.log("🔄 Update role response:", responseText);
			
			if (response.ok) {
				Alert.alert("Success", "User role updated successfully");
				fetchUsers();
			} else {
				Alert.alert("Error", responseText || "Failed to update user role");
			}
		} catch (error) {
			console.error("Error updating user role:", error);
			Alert.alert("Error", `Failed to update user role: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	const handleDisableUser = async (userId) => {
		try {
			setLoading(true);

			const userToUpdate = users.find((u) => u.id === userId);
			const currentStatus = userToUpdate?.active === false ? "inactive" : "active";
			console.log(`Toggling user ${userId} from ${currentStatus} status`);

			// Use fetch with credentials
			const response = await fetch(`${API_BASE_URL}/user/admin/disable-user/${userId}`, {
				method: 'PATCH',
				credentials: 'include',
			});
			
			const responseText = await response.text();
			console.log("🔄 Disable user response:", responseText);
			
			if (response.ok) {
				Alert.alert("Success", `User status updated: ${currentStatus === "active" ? "disabled" : "enabled"}`);
				setTimeout(() => {
					fetchUsers();
				}, 300);
			} else {
				Alert.alert("Error", responseText || "Failed to update user status");
			}
		} catch (error) {
			console.error("Error toggling user status:", error);
			Alert.alert("Error", `Failed to update user status: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	const confirmDelete = (user) => {
		setSelectedUser(user);
		setConfirmDeleteModal(true);
	};

	const handleDeleteUser = async () => {
		if (!selectedUser) return;

		try {
			setLoading(true);
			console.log(`🗑️ Deleting user ${selectedUser.id}`);
			
			// Use fetch with credentials
			const response = await fetch(`${API_BASE_URL}/user/admin/delete-user/${selectedUser.id}`, {
				method: 'DELETE',
				credentials: 'include',
			});
			
			const responseText = await response.text();
			console.log("🗑️ Delete user response:", responseText);
			
			if (response.ok) {
				Alert.alert("Success", "User deleted successfully");
				setConfirmDeleteModal(false);
				setSelectedUser(null);
				fetchUsers();
			} else {
				Alert.alert("Error", responseText || "Failed to delete user");
			}
		} catch (error) {
			console.error("Error deleting user:", error);
			Alert.alert("Error", `Failed to delete user: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = () => {
		setRefreshing(true);
		fetchUsers();
	};

	if (loading && !refreshing) {
		return (
			<View style={[appStyles.container, styles.loadingContainer]}>
				<ActivityIndicator size="large" color="#00A86B" />
				<Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Admin Dashboard</Text>

			<View style={styles.actionRow}>
				<TouchableOpacity style={styles.createButton} onPress={() => setCreateUserModal(true)}>
					<Text style={styles.buttonText}>Create User</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={refreshing}>
					<Text style={styles.buttonText}>{refreshing ? "Refreshing..." : "Refresh"}</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.userListContainer}>
				<Text style={styles.sectionTitle}>User Management ({users.length} Users)</Text>

				{refreshing && <ActivityIndicator size="small" color="#00A86B" style={styles.refreshIndicator} />}

				<FlatList
					data={users}
					keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
					renderItem={({ item }) => (
						<View style={styles.userCard}>
							<View style={styles.userInfo}>
								<Text style={styles.userName}>{item.userName || "Unknown"}</Text>
								<Text style={styles.userEmail}>{item.email || "No email"}</Text>
								<Text style={styles.userDetails}>
									{item.firstName || ""} {item.lastName || ""}
								</Text>
								<Text style={[styles.userRole, item.role === "ADMIN" ? styles.adminRole : styles.userRoleRegular]}>Role: {item.role || "USER"}</Text>
								<Text style={[styles.userStatus, item.active === false || item.active === "false" ? styles.inactiveStatus : styles.activeStatus]}>Status: {item.active === false || item.active === "false" ? "Inactive" : "Active"}</Text>
							</View>

							<View style={styles.actionButtonsRow}>
								<TouchableOpacity style={[styles.actionButton, styles.roleButton]} onPress={() => handleUpdateUserRole(item.id, item.role === "ADMIN" ? "USER" : "ADMIN")}>
									<Text style={styles.actionButtonText}>{item.role === "ADMIN" ? "Make User" : "Make Admin"}</Text>
								</TouchableOpacity>

								<TouchableOpacity style={[styles.actionButton, styles.disableButton]} onPress={() => handleDisableUser(item.id)}>
									<Text style={styles.actionButtonText}>{item.active === false || item.active === "false" ? "Enable" : "Disable"}</Text>
								</TouchableOpacity>

								<TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => confirmDelete(item)}>
									<Text style={styles.actionButtonText}>Delete</Text>
								</TouchableOpacity>
							</View>
						</View>
					)}
					ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
					onRefresh={onRefresh}
					refreshing={refreshing}
				/>
			</View>

			<TouchableOpacity style={styles.backButton} onPress={() => router.replace("/Landing")}>
				<Text style={styles.buttonText}>Back to Dashboard</Text>
			</TouchableOpacity>

			<Modal visible={createUserModal} animationType="slide" transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Create New User</Text>

						<ScrollView style={styles.modalForm}>
							<Text style={styles.inputLabel}>Username*</Text>
							<TextInput style={styles.input} value={newUsername} onChangeText={setNewUsername} placeholder="Enter username" />

							<Text style={styles.inputLabel}>Email*</Text>
							<TextInput style={styles.input} value={newEmail} onChangeText={setNewEmail} placeholder="Enter email" keyboardType="email-address" />

							<Text style={styles.inputLabel}>Password*</Text>
							<TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="Enter password" secureTextEntry />

							<Text style={styles.inputLabel}>First Name</Text>
							<TextInput style={styles.input} value={newFirstName} onChangeText={setNewFirstName} placeholder="Enter first name" />

							<Text style={styles.inputLabel}>Last Name</Text>
							<TextInput style={styles.input} value={newLastName} onChangeText={setNewLastName} placeholder="Enter last name" />

							<Text style={styles.inputLabel}>Role</Text>
							<View style={styles.roleSelector}>
								<TouchableOpacity style={[styles.roleSelectorButton, newRole === "USER" && styles.roleSelectorButtonSelected]} onPress={() => setNewRole("USER")}>
									<Text style={newRole === "USER" ? styles.roleSelectorTextSelected : styles.roleSelectorText}>Regular User</Text>
								</TouchableOpacity>

								<TouchableOpacity style={[styles.roleSelectorButton, newRole === "ADMIN" && styles.roleSelectorButtonSelected]} onPress={() => setNewRole("ADMIN")}>
									<Text style={newRole === "ADMIN" ? styles.roleSelectorTextSelected : styles.roleSelectorText}>Admin</Text>
								</TouchableOpacity>
							</View>
						</ScrollView>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.cancelButton]}
								onPress={() => {
									setCreateUserModal(false);
									setNewUsername("");
									setNewEmail("");
									setNewPassword("");
									setNewFirstName("");
									setNewLastName("");
									setNewRole("USER");
								}}
							>
								<Text style={styles.modalButtonText}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleCreateUser}>
								<Text style={styles.modalButtonText}>Create User</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			<Modal visible={confirmDeleteModal} animationType="slide" transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Confirm Delete</Text>

						{selectedUser && <Text style={styles.confirmText}>Are you sure you want to delete user "{selectedUser.userName}"? This action cannot be undone.</Text>}

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.cancelButton]}
								onPress={() => {
									setConfirmDeleteModal(false);
									setSelectedUser(null);
								}}
							>
								<Text style={styles.modalButtonText}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity style={[styles.modalButton, styles.deleteModalButton]} onPress={handleDeleteUser}>
								<Text style={styles.modalButtonText}>Delete</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	loadingContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		color: "#555",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		color: "#333",
		textAlign: "center",
	},
	actionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 15,
	},
	createButton: {
		backgroundColor: "#00A86B",
		padding: 12,
		borderRadius: 8,
		flex: 3,
		marginRight: 10,
		alignItems: "center",
	},
	refreshButton: {
		backgroundColor: "#4a90e2",
		padding: 12,
		borderRadius: 8,
		flex: 1,
		alignItems: "center",
	},
	refreshIndicator: {
		marginVertical: 10,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	userListContainer: {
		flex: 1,
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 15,
		marginBottom: 15,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 5,
		shadowOffset: { width: 0, height: 2 },
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 15,
		color: "#333",
	},
	userCard: {
		backgroundColor: "#f9f9f9",
		padding: 15,
		borderRadius: 8,
		marginBottom: 10,
		borderLeftWidth: 4,
		borderLeftColor: "#00A86B",
	},
	userInfo: {
		marginBottom: 10,
	},
	userName: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333",
	},
	userEmail: {
		fontSize: 14,
		color: "#666",
		marginBottom: 5,
	},
	userDetails: {
		fontSize: 14,
		color: "#666",
	},
	userRole: {
		fontSize: 14,
		fontWeight: "500",
		color: "#333",
	},
	adminRole: {
		color: "#4a90e2",
		fontWeight: "bold",
	},
	userRoleRegular: {
		color: "#555",
	},
	userStatus: {
		fontSize: 14,
		fontStyle: "italic",
		color: "#666",
	},
	activeStatus: {
		color: "#4CAF50",
		fontWeight: "bold",
	},
	inactiveStatus: {
		color: "#F44336",
		fontStyle: "italic",
	},
	actionButtonsRow: {
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	actionButton: {
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 4,
		marginLeft: 8,
	},
	roleButton: {
		backgroundColor: "#4a90e2",
	},
	disableButton: {
		backgroundColor: "#f5a623",
	},
	deleteButton: {
		backgroundColor: "#e53935",
	},
	actionButtonText: {
		color: "white",
		fontSize: 12,
		fontWeight: "bold",
	},
	emptyText: {
		textAlign: "center",
		marginTop: 20,
		color: "#888",
	},
	backButton: {
		backgroundColor: "#444",
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},

	// Modal styles
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		backgroundColor: "white",
		borderRadius: 10,
		padding: 20,
		width: "90%",
		maxHeight: "80%",
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	modalForm: {
		maxHeight: 400,
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: "bold",
		marginBottom: 5,
		color: "#555",
	},
	input: {
		backgroundColor: "#f0f0f0",
		padding: 12,
		borderRadius: 5,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: "#ddd",
	},
	roleSelector: {
		flexDirection: "row",
		marginBottom: 15,
	},
	roleSelectorButton: {
		flex: 1,
		padding: 12,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#ddd",
	},
	roleSelectorButtonSelected: {
		backgroundColor: "#00A86B",
		borderColor: "#00A86B",
	},
	roleSelectorText: {
		color: "#333",
	},
	roleSelectorTextSelected: {
		color: "white",
		fontWeight: "bold",
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 15,
	},
	modalButton: {
		flex: 1,
		padding: 12,
		borderRadius: 5,
		marginHorizontal: 5,
		alignItems: "center",
	},
	cancelButton: {
		backgroundColor: "#999",
	},
	submitButton: {
		backgroundColor: "#00A86B",
	},
	deleteModalButton: {
		backgroundColor: "#e53935",
	},
	modalButtonText: {
		color: "white",
		fontWeight: "bold",
	},
	confirmText: {
		textAlign: "center",
		marginBottom: 20,
		fontSize: 16,
		lineHeight: 24,
	},
});
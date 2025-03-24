//@ts-nocheck

import React, { useEffect, useState } from "react";
import { View, Text, Modal, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import appStyles from "./styles/appStyles.js";
import { getUserById, updateUsername, updatePassword, deleteUser } from "@/api/userApi";

export default function Account() {
    const router = useRouter();
    const [userId, setUserId] = useState<number | null>(null);
    const [username, setUsername] = useState("");
    const [isUsernameModalVisible, setUsernameModalVisible] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
        const id = await AsyncStorage.getItem("userId");
        if (id) {
            setUserId(Number(id));
            const res = await getUserById(Number(id));
            if (res?.username) {
                setUsername(res.username);
            }
        }
        };
        fetchUser();
    }, []);

    const handleUsernameUpdate = async () => {
        if (!userId || !newUsername.trim()) return;
        const result = await updateUsername(userId, newUsername);
        if (result?.message === "Username updated successfully") {
            setUsername(newUsername);
            setUsernameModalVisible(false);
            Alert.alert("Success", result.message);
        } else {
            Alert.alert("Error", result?.message || "Failed to update username");
        }
    };

    const handlePasswordUpdate = async () => {
        const isValidPassword = (pw: string): boolean => {
            return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(pw);
        };

        if (!userId || !newPassword.trim()) return;

        if (!isValidPassword(newPassword)) {
            setModalMessage("Password must be at least 6 characters long, contain letters, numbers, and a special character.");
            setModalVisible(true);
        return;
        }

        const result = await updatePassword(userId, newPassword);
        if (result?.message === "Password updated successfully") {
            setPasswordModalVisible(false);
            Alert.alert("Success", result.message);
        } else {
            Alert.alert("Error", result?.message || "Failed to update password");
        }
    };

    const confirmDelete = () => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete your account?", [
        { text: "Cancel", style: "cancel" },
        {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
                console.log("Delete button pressed!");
                if (!userId) {
                    console.warn("No userId found!");
                    return;
                }

                const result = await deleteUser(userId);
                console.log("Delete result:", result);

                if (result?.includes("successfully")) {
                    await AsyncStorage.clear();
                    router.replace("/");
                } else {
                    Alert.alert("Error", "Could not delete account.");
                }
            },
        },
        ]);
    };

  return (
    <View style={appStyles.container}>
        <Text style={appStyles.heading}>Your Account</Text>
        <Text style={appStyles.infoText}>Logged in as: <Text style={appStyles.bold}>{username}</Text></Text>

        <TouchableOpacity style={appStyles.button} onPress={() => setUsernameModalVisible(true)}>
            <Text style={appStyles.buttonText}>Edit Username</Text>
        </TouchableOpacity>

        <TouchableOpacity style={appStyles.button} onPress={() => setPasswordModalVisible(true)}>
            <Text style={appStyles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[appStyles.button, appStyles.dangerButton]} onPress={confirmDelete}>
            <Text style={appStyles.buttonText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/Landing")}>
            <Text style={appStyles.buttonText}>BACK</Text>
        </TouchableOpacity>

      {/* username modal */}
        <Modal visible={isUsernameModalVisible} transparent animationType="slide">
            <View style={appStyles.modalContainer}>
                <View style={appStyles.modalCard}>
                    <Text style={appStyles.modalTitle}>Update Username</Text>

                    <TextInput
                    style={appStyles.input}
                    placeholder="New Username"
                    value={newUsername}
                    onChangeText={setNewUsername}
                    />

                    <TouchableOpacity style={appStyles.button} onPress={handleUsernameUpdate}>
                    <Text style={appStyles.buttonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setUsernameModalVisible(false)}>
                    <Text style={appStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>

        {/* password modal */}
        <Modal visible={isPasswordModalVisible} transparent animationType="slide">
            <View style={appStyles.modalContainer}>
                <View style={appStyles.modalCard}>
                    <Text style={appStyles.modalTitle}>Update Password</Text>

                    <TextInput
                    style={appStyles.input}
                    placeholder="New Password"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    />

                    <TouchableOpacity style={appStyles.button} onPress={handlePasswordUpdate}>
                    <Text style={appStyles.buttonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                    <Text style={appStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

        {/* password error modal */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={appStyles.modalOverlay}>
                <View style={appStyles.modalCard}>
                    <Text style={appStyles.modalText}>{modalMessage}</Text>

                    <TouchableOpacity style={appStyles.modalButton} onPress={() => setModalVisible(false)}>
                    <Text style={appStyles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    </View>
  );
}
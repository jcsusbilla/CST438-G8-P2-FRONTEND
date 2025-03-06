import React from "react";
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput} from "react-native";
import appStyles from "./styles/appStyles.js";
import API_URL from "@/api/apiConfig";


export default function LandingScreen() {
    const router = useRouter();
    const { username, firstName, lastName, email } = useLocalSearchParams();
    
    // LOGOUT FUNCTION
    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_URL}/logout`, {
                method: 'GET',
                credentials: 'include'                                                      // important to pass session cookie
            });
    
            if (response.ok) {
                alert('Logged out successfully!');
                router.push('/');
            } else {
                alert('Logout failed.');
            }
        } catch (error) {
            alert('Logout error');
        }
    };

    return (
        <View style={appStyles.container}>
            <Text style={appStyles.title}>Hello, {`${firstName} ${lastName}`}</Text>
            {/* Modify Account Button */}
            <TouchableOpacity style={appStyles.createAccountButton} onPress={() => router.push("/Account")}>
                <Text style={appStyles.buttonText}>ACCOUNT</Text>
            </TouchableOpacity>

            {/* Show current active tier list */}
            {/* open a modal */}

            {/* Tier List Page */}
            <TouchableOpacity style={appStyles.createAccountButton}onPress={() => router.push("/TierList")}>
                <Text style={appStyles.buttonText}>TIER LIST PAGE</Text>

            </TouchableOpacity>

            {/* View all lists */}
            <TouchableOpacity style={appStyles.createAccountButton}>
                <Text style={appStyles.buttonText}>ALL LISTS</Text>
                {/* open modal or new page? */}
            </TouchableOpacity>

            {/* View public lists */}
            <TouchableOpacity style={appStyles.createAccountButton}>
                <Text style={appStyles.buttonText}>PUBLIC LISTS</Text>
                {/* open modal or new page? */}
            </TouchableOpacity>

            {/* Logout button */}
            <TouchableOpacity style={[appStyles.createAccountButton, appStyles.loginButton]} onPress={() => router.push("/")}>
                <Text style={appStyles.buttonText}>LOGOUT</Text>
            </TouchableOpacity>
        </View>
    );
}
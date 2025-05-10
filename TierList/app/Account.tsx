import React from "react";
import { useState } from 'react';
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput} from "react-native";
import appStyles from "./styles/appStyles.js";


export default function AccountScreen() {
    const router = useRouter();
    
    return (
        <View style={appStyles.container}>
            <Text style={appStyles.title}> username's Account</Text>

            <TouchableOpacity style={appStyles.accountButtons}>
                <Text style={appStyles.buttonText}>EDIT USERNAME</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.accountButtons}>
                <Text style={appStyles.buttonText}>EDIT PASSWORD</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.deleteAccountButton}>
                <Text style={appStyles.buttonText}>DELETE ACCOUNT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/Landing")}>
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
}
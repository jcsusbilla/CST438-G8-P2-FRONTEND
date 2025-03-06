import React from "react";
import { useState } from 'react';
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput} from "react-native";
import appStyles from "./styles/appStyles.js";


export default function LoginScreen() {
    const router = useRouter();
    
    return (
        <View style={appStyles.container}>
            <Text style={appStyles.title}>Login</Text>

            {/* prompt user for a username */}
            <TextInput
                style={appStyles.input}
                placeholder="Enter a username"
            />

            {/* prompt user for a password */}
            <TextInput
                style={appStyles.input}
                placeholder="Enter a password"
                secureTextEntry={true}
            />

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/Landing")}>
                <Text style={appStyles.buttonText}>LOG IN</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/")}>
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
}
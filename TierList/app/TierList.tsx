import React from "react";
import { useState } from 'react';
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput} from "react-native";
import appStyles from "./styles/appStyles.js";


export default function TierListScreen() {
    const router = useRouter();

    
    return (
        <View style={appStyles.container}>
            <Text style={appStyles.title}>Active Tier List</Text>

            <Text style={appStyles.title}>Past Tier Lists</Text>

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/")}>
            <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
}
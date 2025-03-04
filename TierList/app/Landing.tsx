import React from "react";
import { useState } from 'react';
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput} from "react-native";
import appStyles from "./styles/appStyles.js";


export default function LandingScreen() {
    const router = useRouter();
    
    return (
        <View style={appStyles.container}>
            <Text style={appStyles.title}>Hello, username</Text>\
                {/* Modify Account Button */}
                <TouchableOpacity style={appStyles.createAccountButton} onPress={() => router.push("/Account")}>
                    <Text style={appStyles.buttonText}>ACCOUNT</Text>
                </TouchableOpacity>

                {/* Show active tier list and past tier list */}
                {/* open a modal */}

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
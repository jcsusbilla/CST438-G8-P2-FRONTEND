import React from "react";
import { useState } from 'react';
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert} from "react-native";
import appStyles from "./styles/appStyles.js";
import { loginUser } from "@/api/userApi";


export default function LoginScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');     // username value
    const [password, setPassword] = useState('');     // password value
    const [email, setEmail] = useState('');           // email value

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("Error", "Please fill in both fields");
            return;
          }
        try {
            const message = await loginUser(email, password);
            Alert.alert('Success! You are logged in.', message);
            router.push({
                pathname: '/Landing',
                params: { username, email }
            });
        } catch (err: any) {
            Alert.alert('Login Failed.', err.message);
        }
    };
    
    return (
        <View style={appStyles.container}>
            <Text style={appStyles.title}>Login</Text>

            {/* prompt user for a username */}
            <TextInput
                style={appStyles.input}
                placeholder="Enter email"
                value = {email}
                onChangeText={setEmail}
            />

            {/* prompt user for a password */}
            <TextInput
                style={appStyles.input}
                placeholder="Enter password"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={handleLogin}>
                <Text style={appStyles.buttonText}>LOG IN</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/")}>
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
}
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import appStyles from "./styles/appStyles.js";
import { registerUser } from "@/api/userApi";

export default function SignUpScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        try {
            await registerUser({ username, email, password, firstName, lastName });
            Alert.alert('Success', 'Account created! Please login.');
            router.push("/Login");
        } catch (err: any) {
            Alert.alert('Registration Failed', err.message);
        }
    };

    return (
        <View style={appStyles.container}>
            <Text style={appStyles.title}>Create Your Account!</Text>

            <TextInput
                style={appStyles.input}
                placeholder="Enter a username"
                value={username}
                onChangeText={setUsername}
            />

            <TextInput
                style={appStyles.input}
                placeholder="Enter email"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={appStyles.input}
                placeholder="Enter a password"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />

            <TextInput
                style={appStyles.input}
                placeholder="Enter firstname "
                value={firstName}
                onChangeText={setFirstName}
            />

            <TextInput
                style={appStyles.input}
                placeholder="Enter last name"
                value={lastName}
                onChangeText={setLastName}
            />

            <TouchableOpacity style={appStyles.signUpButton} onPress={handleRegister}>
                <Text style={appStyles.buttonText}>REGISTER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/Login")}>
                <Text style={appStyles.buttonText}>LOG IN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/")}>
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
}
import React from "react";
import { useState } from 'react';
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert} from "react-native";
import appStyles from "./styles/appStyles.js";
import { registerUser } from "@/api/userApi";

export default function SignUpScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');     // username value
    const [email, setEmail] = useState('');           // email value
    const [password, setPassword] = useState('');     // password value
    const [firstName, setFirstName] = useState('');   // first name value
    const [lastName, setLastName] = useState('');     // last name value
    
    // REGISTRATION
    const handleRegister = async () => {
        // CHECK TO SEE IF PASSWORD IS VALID

        if (!isValidPassword(password)) {
            Alert.alert(
                'Invalid Password',
                'Password must be at least 6 characters long, contain at least one letter, one number, and one special character (!@#$%^&*()_+).'
            );
            return;
        }

        try {
            await registerUser({ username, email, password, firstName, lastName });
            Alert.alert('Success', 'Account created!');
            router.push({
                pathname: '/Landing',
                params: { username, email, firstName, lastName}
            });
        } catch (err: any) {
            Alert.alert('Registration Failed', err.message);
        }
    };
    
    // PASSWORD MINIMUMS
    function isValidPassword(password: string): boolean {
        const minLength = password.length >= 6;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+]/.test(password);
    
        return minLength && hasLetter && hasNumber && hasSpecialChar;
    }


    return (
        <View style={appStyles.container}>
            <Text style={appStyles.title}>Create Your Account!</Text>

            {/* prompt user for a username */}
            <TextInput
                style={appStyles.input}
                placeholder="Enter a username"
                value={username}
                onChangeText={setUsername}
            />

            {/* prompt user for a email */}
            <TextInput
                style={appStyles.input}
                placeholder="Enter email"
                value={email}
                onChangeText={setEmail}
            />            

            {/* prompt user for a password */}
            <TextInput
                style={appStyles.input}
                placeholder="Enter a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry = {true}
            />
            

            {/* prompt user for first name */}
            <TextInput
                style={appStyles.input}
                placeholder="Enter first name"
                value={firstName}
                onChangeText={setFirstName}
            />

            {/* prompt user for last name */}
            <TextInput
                style={appStyles.input}
                placeholder="Enter last name"
                value={lastName}
                onChangeText={setLastName}
            />

            {/* send user entered credentials */}
            <TouchableOpacity style={appStyles.signUpButton} onPress={handleRegister}>
                <Text style={appStyles.buttonText}>REGISTER</Text>
            </TouchableOpacity>

            {/* send user to login page if user already has an account */}
            <Text style={appStyles.smallText}>Already a user?</Text>
            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/Login")}>
                <Text style={appStyles.buttonText}>LOG IN</Text>
            </TouchableOpacity>

            {/* send user to login page if user already has an account */}
            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/")}>
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>

        </View>
    );
}
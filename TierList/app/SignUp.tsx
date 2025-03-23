import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import appStyles from "./styles/appStyles.js";
import { registerUser, loginUser } from "@/api/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);

    // const handleSignUp = async () => {
    //     if (!email || !password || !firstName || !lastName) {
    //         Alert.alert("Error", "Please fill in all fields.");
    //         return;
    //     }
    
    //     try {
    //         setLoading(true);
    //         const response = await signUpUser(email, password, firstName, lastName);
    
    //         if (response && response.message === "Sign up successful") {
    //             console.log("✅ User Data from API:", response);
    
    //             // ✅ Store user details in AsyncStorage
    //             await AsyncStorage.setItem("userId", String(response.userId));
    //             await AsyncStorage.setItem("userEmail", response.email);
    //             await AsyncStorage.setItem("userName", response.userName);
    //             await AsyncStorage.setItem("firstName", response.firstName);
    //             await AsyncStorage.setItem("lastName", response.lastName);
    
    //             router.replace(`/Landing`);
    //         } else {
    //             Alert.alert("Sign Up Failed", response.message || "Unexpected error.");
    //         }
    //     } catch (err) {
    //         Alert.alert("Sign Up Failed", "An error occurred. Please try again.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }
    
        try {
            setLoading(true);
    
            // Define userData with correct keys
            const userData = {
                user_name: username, 
                email, 
                password, 
                first_name: firstName, 
                last_name: lastName
            };
    
            // Register user in database
            const registerResponse = await registerUser(userData);
    
            if (registerResponse.message.includes("User registered successfully")) {
                console.log("User registered successfully, now logging in...");
    
                // Auto login the user after signup
                const loginResponse = await loginUser(email, password);
                
                if (loginResponse.message === "Login successful") {
                    console.log("Login successful after signup.");
    
                    // Save email to AsyncStorage for session persistence
                    await AsyncStorage.setItem("userEmail", email);
    
                    // Redirect to Landing page
                    router.replace(`/Landing?email=${email}`);
                } else {
                    Alert.alert("Login Failed", "Please try logging in manually.");
                }
            } else {
                Alert.alert("Registration Error", registerResponse.message);
            }
        } catch (err) {
            console.error("Signup error:", err);
            Alert.alert("Signup Failed", "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={appStyles.container}>
            <Text style={appStyles.title}>Create Your Account!</Text>

            <TextInput style={appStyles.input} placeholder="Enter a username" value={username} onChangeText={setUsername} />
            <TextInput style={appStyles.input} placeholder="Enter email" value={email} onChangeText={setEmail} />
            <TextInput style={appStyles.input} placeholder="Enter a password" secureTextEntry={true} value={password} onChangeText={setPassword} />
            <TextInput style={appStyles.input} placeholder="Enter first name" value={firstName} onChangeText={setFirstName} />
            <TextInput style={appStyles.input} placeholder="Enter last name" value={lastName} onChangeText={setLastName} />

            <TouchableOpacity style={appStyles.signUpButton} onPress={handleRegister} disabled={loading}>
                <Text style={appStyles.buttonText}>{loading ? "Registering..." : "REGISTER"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/")}>
                <Text style={appStyles.buttonText}>BACK</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[appStyles.button, appStyles.secondaryButton]} onPress={() => router.push("/Login")}>
                <Text style={appStyles.buttonText}>LOG IN</Text>
            </TouchableOpacity>
        </View>
    );
}
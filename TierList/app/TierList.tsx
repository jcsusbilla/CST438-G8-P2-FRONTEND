import React, { useState, useEffect } from "react";
import { Text, View, TextInput, TouchableOpacity, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import API_BASE_URL from "@/api/apiConfig";

export default function TierListScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // Fetch the Tier List ID if available
    const [userId, setUserId] = useState<number | null>(null); // Save logged-in user's ID
    const [tierListTitle, setTierListTitle] = useState("Enter Tier List Title");

    // Define allowed tier values
    type TierType = "S" | "A" | "B" | "C" | "D" | "F";
    type TierListState = Record<TierType, string[]>;

    const [activeTierList, setActiveTierList] = useState<TierListState>({
        S: [], A: [], B: [], C: [], D: [], F: []
    });

    // Fetch logged-in user's ID
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem("userEmail"); // Assuming email is stored
                if (!storedEmail) {
                    console.warn("⚠️ No email found in storage");
                    return;
                }
    
                const response = await fetch(`${API_BASE_URL}/user/getUserId?email=${storedEmail}`);
                const data = await response.json();
    
                if (response.ok && data.userId) {
                    setUserId(data.userId);
                    await AsyncStorage.setItem("userId", String(data.userId));
                    console.log("✅ Fetched & stored `userId`:", data.userId);
                } else {
                    console.error("❌ Failed to fetch user ID:", data);
                }
            } catch (error) {
                console.error("❌ Error fetching user ID:", error);
            }
        };
    
        fetchUserId();
    }, []);

    // Fetch existing TierList data (for editing)
    useEffect(() => {
        if (!id) return;

        const fetchTierList = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/tierlists/${id}`);
                if (!response.ok) throw new Error("Failed to fetch tier list");
                const data = await response.json();

                console.log("📥 Received Tier List Data:", data);

                setTierListTitle(data.title);

                // Ensure `formattedRankings` has correct type
                const formattedRankings: TierListState = { S: [], A: [], B: [], C: [], D: [], F: [] };

                data.rankings.forEach((ranking: { tier: string; item: string }) => {
                    const tier = ranking.tier as TierType; // Explicitly cast as `TierType`
                    if (formattedRankings[tier]) { // Ensure tier exists
                        formattedRankings[tier] = [...formattedRankings[tier], ranking.item];
                    }
                });

                setActiveTierList(formattedRankings);
                console.log("Parsed Tier List Rankings:", formattedRankings);
            } catch (error) {
                console.error("Error fetching tier list:", error);
                Alert.alert("Error", "Failed to load tier list.");
            }
        };

        fetchTierList();
    }, [id]);

    // Handle Adding an Item to a Tier
    const handleAddItem = (tier: TierType, text: string) => {
        if (text.trim()) {
            setActiveTierList(prev => {
                const updatedList = {
                    ...prev,
                    [tier]: [...prev[tier], text.trim()]
                };
                console.log(`Added item: "${text.trim()}" to Tier: ${tier}`, updatedList);
                return updatedList;
            });
        }
    };

    // ✅ Handle Saving Tier List with Correct User ID
    const handleSaveTierList = async () => {
        console.log("🟢 Save Tier List Button Clicked");
    
        if (!userId) {
            console.error("❌ User ID is missing");
            Alert.alert("Error", "User not logged in.");
            return;
        }
    
        const payload = {
            title: tierListTitle,
            subject: "General",
            userId: Number(userId),
            rankings: Object.entries(activeTierList).flatMap(([tier, items]) =>
                items.map(item => ({ tier, item }))
            ),
        };
    
        console.log("📤 Sending Tier List Data:", JSON.stringify(payload, null, 2));
    
        try {
            const response = await fetch(`${API_BASE_URL}/tierlists/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
    
            const responseText = await response.text();
            console.log("🔄 API Response:", responseText);
    
            if (!response.ok) throw new Error("Failed to save tier list");
    
            console.log("✅ Successfully saved Tier List");
            Alert.alert("Success", "Tier list saved successfully!");
            router.push("/Landing");
        } catch (error) {
            console.error("❌ Error saving tier list:", error);
            Alert.alert("Error", "Failed to save tier list.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Active Tier List */}
            <View style={styles.cardLarge}>
                <TextInput
                    style={styles.titleInput}
                    value={tierListTitle}
                    onChangeText={setTierListTitle}
                    placeholder="Enter Tier List Title"
                />
                {Object.entries(activeTierList).map(([tier, items]) => (
                    <View key={tier} style={styles.tierContainerLarge}>
                        <Text style={styles.bold}>{tier}:</Text>
                        <Text style={styles.tierItem}>{items.join(", ")}</Text>
                        <TextInput
                            style={styles.smallInput}
                            placeholder={`Add to ${tier} tier`}
                            onSubmitEditing={(event: { nativeEvent: { text: string } }) => 
                                handleAddItem(tier as TierType, event.nativeEvent.text)
                            }
                        />
                    </View>
                ))}
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.button} onPress={handleSaveTierList}>
                <Text style={styles.buttonText}>Save Tier List</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    cardLarge: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        flex: 1.5,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
        borderBottomWidth: 1,
        paddingBottom: 5,
    },
    tierContainerLarge: {
        marginBottom: 15,
        padding: 10,
        borderRadius: 8,
        backgroundColor: "#e0e0e0",
    },
    bold: {
        fontWeight: "bold",
        fontSize: 18,
    },
    tierItem: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginTop: 5,
    },
    smallInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 5,
        marginTop: 5,
        borderRadius: 5,
        width: "100%",
        alignSelf: "flex-start",
    },
    button: {
        backgroundColor: "#007BFF",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

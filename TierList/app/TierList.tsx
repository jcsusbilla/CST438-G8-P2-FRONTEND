import React, { useState, useEffect } from "react";
import { Text, View, TextInput, TouchableOpacity, Button, StyleSheet, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import API_BASE_URL from "@/api/apiConfig";
import appStyles from "./styles/appStyles.js";


export default function TierListScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // fetch the tier list ID if available
    const [userId, setUserId] = useState<number | null>(null); // save logged-in user's ID
    const [tierListTitle, setTierListTitle] = useState("Enter Tier List Title");

    const subjectOptions = ["Games", "Movies", "Food", "Music", "Anime"];
    const [subject, setSubject] = useState("");

    // define allowed tier values
    type TierType = "S" | "A" | "B" | "C" | "D" | "F";
    type TierListState = Record<TierType, string[]>;

    // Tier content
    const [activeTierList, setActiveTierList] = useState<TierListState>({
        S: [],
        A: [],
        B: [],
        C: [],
        D: [],
        F: [],
    });

    const [inputText, setInputText] = useState<Record<TierType, string>>({
        S: "",
        A: "",
        B: "",
        C: "",
        D: "",
        F: "",
    });

    // fetch logged-in user's ID
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem("userEmail");
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

    // fetch existing TierList data (for editing)
    useEffect(() => {
        if (!id) return;

        const fetchTierList = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/tierlists/${id}`);
                if (!response.ok) throw new Error("Failed to fetch tier list");
                const data = await response.json();

                console.log("📥 Received Tier List Data:", data);

                setTierListTitle(data.title);

                // ensure `formattedRankings` has correct type
                const formattedRankings: TierListState = { S: [], A: [], B: [], C: [], D: [], F: [] };

                data.rankings.forEach((ranking: { tier: string; item: string }) => {
                    const tier = ranking.tier as TierType;
                    if (formattedRankings[tier]) {
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

    const handleAddItem = (tier: TierType, text: string) => {
        if (text.trim()) {
          setActiveTierList(prev => ({
            ...prev,
            [tier]: [...prev[tier], text.trim()]
          }));
          setInputText(prev => ({
            ...prev,
            [tier]: ""
          }));
          console.log(`📥 Added "${text.trim()}" to tier ${tier}`);
        }
      };

      const handleSaveTierList = async () => {
        console.log("🟢 Save Tier List Button Clicked");
    
        if (!userId) {
          console.error("❌ User ID is missing");
          Alert.alert("Error", "User not logged in.");
          return;
        }
    
        const rankings = Object.entries(activeTierList).flatMap(([tier, items]) =>
          items.map(item => ({ tier, item }))
        );
    
        console.log("📦 Rankings to send:", rankings);
    
        const payload = {
          title: tierListTitle,
          subject,
          userId: Number(userId),
          rankings,
        };
    
        console.log("📤 Payload:", JSON.stringify(payload, null, 2));
    
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.cardLarge}>
            <Text style={styles.label}>Select Subject:</Text>
                <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={styles.dropdown}
                >
                {subjectOptions.map((option) => (
                    <option key={option} value={option}>
                    {option}
                    </option>
                ))}
                </select>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter Tier List Title"
              value={tierListTitle}
              onChangeText={setTierListTitle}
    
            />
    
            {Object.entries(activeTierList).map(([tier, items]) => (
              <View key={tier} style={styles.tierContainerLarge}>
                <Text style={styles.bold}>{tier}:</Text>
                <Text style={styles.tierItem}>{items.join(", ")}</Text>
    
                <TextInput
                  style={styles.smallInput}
                  placeholder={`Add to ${tier} tier`}
                  value={inputText[tier as TierType]}
                  onChangeText={text =>
                    setInputText(prev => ({ ...prev, [tier as TierType]: text }))
                  }
                />
    
                <Button
                  title="Add"
                  onPress={() =>
                    handleAddItem(tier as TierType, inputText[tier as TierType])
                  }
                />
              </View>
            ))}
          </View>
    
          <TouchableOpacity style={styles.button} onPress={handleSaveTierList}>
            <Text style={styles.buttonText}>Save Tier List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, appStyles.secondaryButton]} onPress={() => router.push("/Landing")}>
              <Text style={appStyles.buttonText}>BACK</Text>
          </TouchableOpacity>
        </ScrollView>
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
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    dropdown: {
        width: "100%",
        padding: 8,
        fontSize: 16,
        borderRadius: 5,
        marginBottom: 15,
    },
    subjectInput: {
        fontSize: 18,
        color: "#333",
        borderBottomWidth: 1,
        borderColor: "#ccc",
        marginBottom: 15,
        paddingBottom: 5,
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
    scrollContainer: {
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    
});

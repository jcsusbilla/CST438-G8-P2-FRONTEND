// import React, { useState, useEffect } from "react";
// import { Text, View, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
// import { useRouter } from "expo-router";
// import API_BASE_URL from "@/api/apiConfig";
// import appStyles from "./styles/appStyles.js";

// export default function PastTierList() {
//     const router = useRouter();
//     const [tierLists, setTierLists] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Fetch tier lists from backend
//     useEffect(() => {
//         const fetchTierLists = async () => {
//             try {
//                 const response = await fetch(`${API_BASE_URL}/tierlists/all`, {
//                     method: "GET",
//                     headers: { "Content-Type": "application/json" },
//                 });

//                 if (!response.ok) {
//                     throw new Error(`HTTP error! Status: ${response.status}`);
//                 }

//                 const data = await response.json();
//                 setTierLists(data);
//             } catch (error) {
//                 console.error("Error fetching tier lists:", error);
//                 Alert.alert("Error", "Failed to load tier lists.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchTierLists();
//     }, []);

//     return (
//         <View style={appStyles.container}>
//             <Text style={appStyles.title}>Past Tier Lists</Text>

//             {loading ? (
//                 <Text>Loading...</Text>
//             ) : tierLists.length === 0 ? (
//                 <Text>No past tier lists found.</Text>
//             ) : (
//                 <FlatList
//                     data={tierLists}
//                     keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())} // ✅ Fallback for undefined `id`
//                     renderItem={({ item }) => (
//                         <TouchableOpacity
//                             style={appStyles.listItem}
//                             onPress={() => router.push(`/TierList/${item.id || "unknown"}`)} // ✅ Prevents crash if `id` is missing
//                         >
//                             <Text style={appStyles.listItemText}>{item.title ? item.title : "Untitled"} - {item.subject ? item.subject : "No Subject"}</Text>
//                         </TouchableOpacity>
//                     )}
//                 />
//             )}
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#fff",
//     padding: 15,
//     marginBottom: 15,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 5,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   tierContainer: {
//     marginBottom: 10,
//   },
//   tierTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   tierItems: {
//     fontSize: 14,
//     color: "#333",
//   },
// });
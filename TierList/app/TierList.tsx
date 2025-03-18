// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet, Button, Alert } from "react-native";
// import { fetchTierLists, createTierList } from "@/api/userApi";

// export default function TierListScreen() {
//   const [tierLists, setTierLists] = useState([]);

//   useEffect(() => {
//     loadTierLists();
//   }, []);

//   const loadTierLists = async () => {
//     try {
//       const data = await fetchTierLists();
//       setTierLists(data);
//     } catch (error) {
//       Alert.alert("Error", "Failed to load tier lists.");
//     }
//   };

//   const addNewTierList = async () => {
//     try {
//       const newTierList = { name: "New Tier List", tiers: { S: ["Item X"], A: ["Item Y"] } };
//       await createTierList(newTierList);
//       loadTierLists();
//     } catch (error) {
//       Alert.alert("Error", "Failed to create tier list.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Tier Lists</Text>
//       {tierLists.map((list) => (
//         <View key={list.id} style={styles.card}>
//           <Text style={styles.cardTitle}>{list.name}</Text>
//         </View>
//       ))}
//       <Button title="Create Tier List" onPress={addNewTierList} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
//   card: { backgroundColor: "#fff", padding: 15, marginBottom: 10, borderRadius: 8 },
//   cardTitle: { fontSize: 18, fontWeight: "bold" },
// });
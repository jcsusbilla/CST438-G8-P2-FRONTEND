import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TierListScreen() {
  const [activeTierList] = useState({
    S: ["Item 1", "Item 2"],
    A: ["Item 3", "Item 4"],
    B: ["Item 5"],
    C: ["Item 6"],
    D: ["Item 7"],
    F: ["Item 8"],
  });

  const [pastLists] = useState([
    { id: 1, name: "Example 0", tiers: { S: ["Item A", "Item B"], A: ["Item C"] } },
    { id: 2, name: "Example 1", tiers: { S: ["X"], A: ["Y", "Z"] } },
  ]);

  return (
    <View style={[styles.container, { flexDirection: "row", justifyContent: "space-between" }]}>
      {/* Active Tier List */}
      <View style={styles.card}>
        <Text style={styles.title}>Active Tier List</Text>
        {Object.entries(activeTierList).map(([tier, items]) => (
          <Text key={tier} style={styles.cardText}>
            <Text style={styles.bold}>{tier}:</Text> {items.join(", ")}
          </Text>
        ))}
      </View>

      {/* Past Tier Lists */}
      <View style={styles.card}>
        <Text style={styles.title}>Past Tier Lists</Text>
        {pastLists.map((list) => (
          <View key={list.id} style={styles.pastListContainer}>
            <Text style={styles.cardTitle}>{list.name}</Text>
            {Object.entries(list.tiers).map(([tier, items]) => (
              <Text key={tier} style={styles.cardText}>
                <Text style={styles.bold}>{tier}:</Text> {items.join(", ")}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  pastListContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
});

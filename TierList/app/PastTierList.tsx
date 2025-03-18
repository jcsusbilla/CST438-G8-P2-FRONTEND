import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Button, Alert } from "react-native";


interface TierList {
  title: string;
  tiers: {
    [key: string]: string[];
  };
}

export default function ViewPastTierList() {
  const [pastTierLists, setPastTierLists] = useState<TierList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // hard coded example...
    // Replace with actual fetched data
    setTimeout(() => {
      const mockPastTierLists: TierList[] = [
        {
          title: "My First Tier List",
          tiers: {
            S: ["Item 1", "Item 2"],
            A: ["Item 3"],
            B: ["Item 4"],
            C: [],
            D: [],
            F: ["Item 5"],
          },
        },
        {
          title: "Top 5 Movies",
          tiers: {
            S: ["Inception", "The Dark Knight"],
            A: ["Interstellar", "The Matrix"],
            B: ["Titanic"],
            C: [],
            D: [],
            F: [],
          },
        },
      ];
      setPastTierLists(mockPastTierLists);
      setLoading(false);
    }, 2000); // fetching data
  }, []);

  const handleViewDetails = (tierList: TierList) => {
    console.log(`Viewing details for: ${tierList.title}`);
    Alert.alert(
      "Tier List Details",
      `Viewing details for: ${tierList.title}`,
      [
        {
          text: "OK",
          onPress: () => console.log("OK pressed"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Past Tier Lists</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <ScrollView>
          {pastTierLists.map((tierList, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{tierList.title}</Text>
              {Object.entries(tierList.tiers).map(([tier, items]) => (
                <View key={tier} style={styles.tierContainer}>
                  <Text style={styles.tierTitle}>{tier}:</Text>
                  <Text style={styles.tierItems}>{items.join(", ") || "No items"}</Text>
                </View>
              ))}
              <Button
                title="View Details"
                onPress={() => handleViewDetails(tierList)}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tierContainer: {
    marginBottom: 10,
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tierItems: {
    fontSize: 14,
    color: "#333",
  },
});

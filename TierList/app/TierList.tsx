import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function TierListScreen() {
  var [tierListTitle, setTierListTitle] = useState("Enter Tier List Title");
  const [activeTierList, setActiveTierList] = useState<{
    [key: string]: string[];
  }>({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  });

  const handleAddItem = (tier: string, text: string) => {
    if (text.trim()) {
      setActiveTierList((prev) => ({
        ...prev,
        [tier]: [...prev[tier], text.trim()],
      }));
    }
  };

  const handleSaveTierList = () => {
    // log the data to the console.
    console.log("Saving Tier List:", { tierListTitle, activeTierList });
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
              onSubmitEditing={(event) => handleAddItem(tier, event.nativeEvent.text)}
            />
          </View>
        ))}
      </View>

      {/* Save Button */}
      <Button title="Save Tier List" onPress={handleSaveTierList} />
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
});

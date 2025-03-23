import React, { useEffect, useState } from "react";
import {  View, Text, ScrollView, StyleSheet, Modal, TouchableOpacity, Pressable,} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "@/api/apiConfig";
import appStyles from "./styles/appStyles.js";

export default function PastTierList() {
  const router = useRouter();
  const [tierLists, setTierLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchTierLists = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const response = await fetch(`${API_BASE_URL}/tierlists/user/${storedUserId}/with-rankings`);
        const result = await response.json();
        setTierLists(result.tierLists || []);
      } catch (error) {
        console.error("❌ Error fetching tier lists:", error);
      }
    };

    fetchTierLists();
  }, []);

  const openModal = (list: any) => {
    setSelectedList(list);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedList(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {tierLists.map((list, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => openModal(list)}
            style={styles.card}
          >
            <Text style={styles.title}>{list.title}</Text>
            <Text style={styles.subject}>Subject: {list.subject}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* modal for rankings */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedList?.title}</Text>
            <Text style={styles.modalSubject}>Subject: {selectedList?.subject}</Text>

            <Text style={styles.rankingsHeader}>Rankings:</Text>
            {selectedList?.rankings?.length > 0 ? (
              selectedList.rankings.map((ranking: any, idx: number) => (
                <Text key={idx} style={styles.rankingItem}>
                  {ranking.tier}: {ranking.item}
                </Text>
              ))
            ) : (
              <Text style={styles.noRankings}>No rankings available</Text>
            )}

            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={[styles.button, appStyles.secondaryButton]} onPress={() => router.push("/Landing")}>
        <Text style={appStyles.buttonText}>BACK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subject: {
    fontSize: 16,
    color: "#555",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubject: {
    fontSize: 16,
    marginBottom: 12,
    color: "#555",
  },
  rankingsHeader: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 6,
  },
  rankingItem: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  noRankings: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#888",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
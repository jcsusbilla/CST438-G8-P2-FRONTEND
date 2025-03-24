import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "@/api/apiConfig";
import { useRouter } from "expo-router";

export default function PastTierList() {
  const router = useRouter();
  const [tierLists, setTierLists] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // First, get the user's email and ID from AsyncStorage
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        const id = await AsyncStorage.getItem("userId");
        
        setUserEmail(email);
        setUserId(id);
        
        console.log("User info from AsyncStorage:", { email, id });
      } catch (err) {
        console.error("Error retrieving user info:", err);
      }
    };
    
    getUserInfo();
  }, []);

  // Once we have the user info, fetch the tier lists
  useEffect(() => {
    const fetchTierLists = async () => {
      // Only proceed if we have a userId or userEmail
      if (!userId && !userEmail) {
        console.log("Waiting for user info...");
        return;
      }
      
      try {
        setLoading(true);
        
        // If we don't have a userId yet but we have an email, try to get the userId
        let effectiveUserId = userId;
        if (!effectiveUserId && userEmail) {
          console.log("Attempting to fetch userId using email:", userEmail);
          try {
            const response = await fetch(`${API_BASE_URL}/user/getUserId?email=${encodeURIComponent(userEmail)}`);
            if (response.ok) {
              const data = await response.json();
              if (data.userId) {
                effectiveUserId = String(data.userId);
                setUserId(effectiveUserId);
                console.log("Retrieved userId:", effectiveUserId);
                // Store it for future use
                await AsyncStorage.setItem("userId", effectiveUserId);
              }
            }
          } catch (error) {
            console.error("Error fetching userId from email:", error);
          }
        }

        if (!effectiveUserId) {
          console.error("Still no user ID available");
          setLoading(false);
          setTierLists([]);
          return;
        }
        
        console.log(`Fetching tier lists for user ID: ${effectiveUserId}`);
        
        // IMPORTANT: Using the tierlists/user/{userId} endpoint instead of user-tier-lists
        // This endpoint specifically returns tier lists created by the user
        const response = await fetch(`${API_BASE_URL}/tierlists/user/${effectiveUserId}/with-rankings`);
        
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          console.error(`API Error: ${response.status}`);
          setTierLists([]);
          setLoading(false);
          return;
        }
        
        const result = await response.json();
        console.log("API Response:", result);
        
        // Make sure we're accessing the correct property from the response
        if (result.tierLists) {
          console.log(`Found ${result.tierLists.length} tier lists`);
          setTierLists(result.tierLists);
        } else {
          console.log("No tierLists property in response, checking for other formats");
          
          // Alternative response format handling
          if (Array.isArray(result)) {
            console.log(`Found ${result.length} tier lists (array format)`);
            setTierLists(result);
          } else {
            console.log("Unexpected response format:", result);
            setTierLists([]);
          }
        }
      } catch (error) {
        console.error("Error fetching tier lists:", error);
        setTierLists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTierLists();
  }, [userId, userEmail]);

  const openModal = (list: any) => {
    console.log("Opening modal for list:", list);
    setSelectedList(list);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedList(null);
    setModalVisible(false);
  };

  const handleBackToLanding = () => {
    router.replace("/Landing");
  };

  const handleCreateTierList = () => {
    router.push("/TierList");
  };

  // Helper function to determine if a tier list is valid (has id, title)
  const isValidTierList = (list: any) => {
    return list && list.id !== undefined && list.title;
  };

  // Filter out any invalid tier lists
  const validTierLists = tierLists.filter(isValidTierList);

  if (loading) {
    return (
      <View style={[styles.screen, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={styles.loadingText}>Loading your tier lists...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Tier Lists</Text>
      </View>

      {validTierLists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't created any tier lists yet</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateTierList}>
            <Text style={styles.buttonText}>Create Your First Tier List</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {validTierLists.map((list, index) => (
            <TouchableOpacity
              key={`${list.id || index}`}
              onPress={() => openModal(list)}
              style={styles.card}
            >
              <Text style={styles.title}>{list.title}</Text>
              <Text style={styles.subject}>Subject: {list.subject}</Text>
              <Text style={styles.rankingsCount}>
                {list.rankings?.length || 0} items ranked
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.backButton} onPress={handleBackToLanding}>
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </TouchableOpacity>

      {/* Modal for Rankings */}
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
              <ScrollView style={styles.rankingsContainer}>
                {['S', 'A', 'B', 'C', 'D', 'F'].map(tier => {
                  const tierItems = selectedList.rankings
                    .filter((r: any) => r.tier === tier)
                    .map((r: any) => r.item);
                    
                  if (tierItems.length === 0) return null;
                  
                  return (
                    <View key={tier} style={styles.tierGroup}>
                      <Text style={[styles.tierLabel, 
                        tier === 'S' ? styles.sTier : 
                        tier === 'A' ? styles.aTier :
                        tier === 'B' ? styles.bTier :
                        tier === 'C' ? styles.cTier :
                        tier === 'D' ? styles.dTier : styles.fTier
                      ]}>
                        Tier {tier}
                      </Text>
                      {tierItems.map((item: string, idx: number) => (
                        <Text key={idx} style={styles.rankingItem}>• {item}</Text>
                      ))}
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.noRankings}>No rankings available</Text>
            )}

            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#555",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#00A86B",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
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
    borderLeftWidth: 4,
    borderLeftColor: "#00A86B",
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
  rankingsCount: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButton: {
    backgroundColor: "#444",
    margin: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#e53935",
    textAlign: "center",
    marginBottom: 20,
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
    maxHeight: "80%",
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
    marginBottom: 12,
  },
  rankingsContainer: {
    maxHeight: 300,
  },
  tierGroup: {
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
  },
  tierLabel: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: "flex-start",
    color: "#fff",
  },
  sTier: {
    backgroundColor: "#FF8000", // Gold/Orange
  },
  aTier: {
    backgroundColor: "#FF0000", // Red
  },
  bTier: {
    backgroundColor: "#FF00FF", // Pink/Magenta
  },
  cTier: {
    backgroundColor: "#0000FF", // Blue
  },
  dTier: {
    backgroundColor: "#008000", // Green
  },
  fTier: {
    backgroundColor: "#808080", // Gray
  },
  rankingItem: {
    fontSize: 14,
    color: "#333",
    marginLeft: 16,
    marginBottom: 4,
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
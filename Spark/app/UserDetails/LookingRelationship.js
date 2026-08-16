import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpdateRelationshipGoalMutation } from "../../services/apiSlice";

const LookingRelationshiop = () => {
  const router = useRouter();

  // Selected Option State
  const [selectedGoal, setSelectedGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const [updateRelationshipGoal] = useUpdateRelationshipGoalMutation();

  const relationshipGoals = [
    { id: "long_term", title: "Long-term partner" },
    { id: "long_short_ok", title: "Long-term, open to short" },
    { id: "short_long_ok", title: "Short-term, open to long" },
    { id: "short_fun", title: "Short-term fun" },
    { id: "new_friends", title: "New friends" },
    { id: "figuring_out", title: "Still figuring it out" },
  ];

  // Back Button Navigation
  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(
      () => {
        if (router.canGoBack()) {
          router.back();
        }
      },
      Platform.OS === "android" ? 50 : 0,
    );
  };

  useEffect(() => {
    // record this page as last visited so fallback can return here
    AsyncStorage.setItem("lastVisitedRoute", "/UserDetails/LookingRelationship").catch(() => {});
  }, []);

  // Next Screen Navigation
const handleNext = async () => {
    if (!selectedGoal) return;

    const relationshipLabel =
      relationshipGoals.find((item) => item.id === selectedGoal)?.title || selectedGoal;

    setLoading(true);
    try {
      const payload = {
        relationshipGoal: relationshipLabel,
      };

      const response = await updateRelationshipGoal(payload).unwrap();
      if (response?.success) {
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "RELATIONSHIP_GOAL_COMPLETED"
        );
        router.replace("/UserDetails/StudyingPage");
      }
    } catch (error) {
      console.error("Error updating relationship goal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Top Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: "85%" }]} />
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Content Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What are you{"\n"}looking for?</Text>
        <Text style={styles.subtitle}>
          {"All good if it changes. There's something for everyone."}
        </Text>

        {/* Vertical Line-by-Line List Container */}
        <View style={styles.listContainer}>
          {relationshipGoals.map((item) => {
            const isSelected = selectedGoal === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => setSelectedGoal(item.id)}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    isSelected && styles.cardTitleSelected,
                  ]}
                >
                  {item.title}
                </Text>

                {isSelected && (
                  <Feather
                    name="check"
                    size={20}
                    color="#FF4081"
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Gradient Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={selectedGoal ? 0.85 : 1}
          disabled={!selectedGoal}
        >
          <LinearGradient
            colors={
              selectedGoal
                ? ["#FF4081", "#7C4DFF"]
                : ["rgba(255, 64, 129, 0.35)", "rgba(124, 77, 255, 0.35)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  !selectedGoal && styles.buttonTextDisabled,
                ]}
            >
              Next
            </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
      

export default LookingRelationshiop;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0B14",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },

  // Progress Bar
  progressTrack: {
    width: 120,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF4081",
    borderRadius: 2,
  },

  // Scroll Content Body
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#A1A1AA",
    marginTop: 12,
    marginBottom: 32,
    lineHeight: 22,
  },

  // Stacked Line-by-Line List Layout
  listContainer: {
    gap: 14,
  },
  card: {
    width: "100%", // Full width for line-by-line display
    height: 58,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardSelected: {
    borderColor: "#FF4081",
    backgroundColor: "rgba(255, 64, 129, 0.08)",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cardTitleSelected: {
    color: "#FFFFFF",
  },
  checkIcon: {
    marginLeft: 10,
  },

  // Sticky Footer Button
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#0D0B14",
  },
  gradientButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.4)",
  },
});
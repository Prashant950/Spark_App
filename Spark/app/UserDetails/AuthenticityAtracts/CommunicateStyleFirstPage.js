import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Keyboard,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {useEffect} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpdateVibePreferencesMutation } from "../../../services/apiSlice";

const CommunicateStyleFirstPage = () => {
  const router = useRouter();

  // Selected Interests State
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [updateVibePreferences] = useUpdateVibePreferencesMutation();


useEffect(() => {
    AsyncStorage.setItem("lastVisitedRoute", "/UserDetails/AuthenticityAtracts/CommunicateStyleFirstPage").catch(() => {});
  }, []); 
  
  
  // Interests List
  const interests = [
    { id: "music", label: "Music" },
    { id: "travel", label: "Travel" },
    { id: "fitness", label: "Fitness" },
    { id: "cooking", label: "Cooking" },
    { id: "gaming", label: "Gaming" },
    { id: "art", label: "Art" },
    { id: "photography", label: "Photography" },
    { id: "cinema", label: "Cinema" },
    { id: "coffee", label: "Coffee" },
    { id: "yoga", label: "Yoga" },
    { id: "dancing", label: "Dancing" },
    { id: "pets", label: "Pets" },
    { id: "nature", label: "Nature" },
    { id: "reading", label: "Reading" },
    { id: "fashion", label: "Fashion" },
    { id: "tech", label: "Tech" },
    { id: "foodie", label: "Foodie" },
    { id: "sports", label: "Sports" },
  ];

  // Toggle Interest Selection
  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const selectedCount = selectedInterests.length;
  const isFormValid = selectedCount >= 5;

  // Back Button Handler
  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(
      () => {
        router.back();
      },
      Platform.OS === "android" ? 50 : 0,
    );
  };

  // Next Screen Navigation
  const handleNext = async () => {
    if (!isFormValid) return;

    try {
      setSaving(true);
      const response = await updateVibePreferences({ vibePreferences: selectedInterests }).unwrap();

      if (response?.success) {
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "ESSENTIALS_COMMUNICATION_STYLE_COMPLETED"
        );
        router.push("/UserDetails/AuthenticityAtracts/CommunicateSecondPage");
      } else {
        console.warn("Vibe preferences update did not succeed:", response);
      }
    } catch (error) {
      console.error("Error updating vibe preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Top Header & Progress Line */}
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
          <View style={[styles.progressFill, { width: "40%" }]} />
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Main Scroll Area */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{"What's your vibe?"}</Text>
        <Text style={styles.subtitle}>
          Select at least 5 interests to find your perfect spark.
        </Text>

        {/* 2-Column Interest Cards Grid */}
        <View style={styles.gridContainer}>
          {interests.map((item) => {
            const isSelected = selectedInterests.includes(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => toggleInterest(item.id)}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <Text
                  style={[
                    styles.cardText,
                    isSelected && styles.cardTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleNext}
          activeOpacity={isFormValid && !saving ? 0.85 : 1}
          disabled={!isFormValid || saving}
        >
          <LinearGradient
            colors={
              isFormValid
                ? ["#FF4081", "#7C4DFF"]
                : ["rgba(255, 64, 129, 0.35)", "rgba(124, 77, 255, 0.35)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <View style={styles.buttonContent}>
              <Text
                style={[
                  styles.buttonText,
                  !isFormValid && styles.buttonTextDisabled,
                ]}
              >
                {saving ? "Saving..." : `Next ${selectedCount}/5`}
              </Text>
              <Feather
                name="arrow-right"
                size={20}
                color={isFormValid ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)"}
                style={{ marginLeft: 8 }}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CommunicateStyleFirstPage;

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

  // Scroll Content
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
    marginBottom: 28,
    lineHeight: 22,
  },

  // Grid
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  card: {
    width: "48%", // 2 Columns
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardSelected: {
    borderColor: "#FFFFFF", // Border turns white when clicked
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#FFFFFF",
  },
  cardTextSelected: {
    fontWeight: "600", // Medium bold text when selected
    color: "#FFFFFF",
  },

  // Footer Button
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
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpdateGenderMutation } from "../services/apiSlice";

const ChooseGender = () => {
  const router = useRouter();

  // Selected Option State ("man", "woman", "beyond_binary")
  const [selectedGender, setSelectedGender] = useState("");
  // Toggle for showing gender on profile
  const [showOnProfile, setShowOnProfile] = useState(true);
  const [loading, setLoading] = useState(false);

  const [updateGender] = useUpdateGenderMutation();

  const genderOptions = [
    { id: "man", label: "Man" },
    { id: "woman", label: "Woman" },
    { id: "beyond_binary", label: "Beyond\nbinary" },
  ];

  const handleNext = () => {
    if (selectedGender) {
      // Navigate to next screen (e.g. EnterInterests)
      router.push("/EnterInterests");
    }
  };

  const handleGenderSubmit = async () => {
    setLoading(true);

    if (!selectedGender) {
      console.warn("Please select a gender option before proceeding.");
      setLoading(false);
      return;
    }

    const normalizedGender =
      selectedGender === "man"
        ? "Man"
        : selectedGender === "woman"
          ? "Woman"
          : selectedGender === "beyond_binary"
            ? "Beyond Binary"
            : selectedGender;

    try {
      const response = await updateGender({ gender: normalizedGender }).unwrap();

      if (response?.success) {
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "GENDER_COMPLETED"
        );
        router.replace("/UserDetails/WhoInterested");
      }
    } catch (error) {
      console.error("Error updating gender:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AsyncStorage.setItem("lastVisitedRoute", "/ChooseGender").catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/EnterDOB");
            }
          }}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title & Subtitle */}
        <Text style={styles.title}>{"What's your gender?"}</Text>
        <Text style={styles.subtitle}>
          {
            "Select all that describe you to help us show your profile to the right people. You can add more details if you'd like."
          }
        </Text>

        {/* Gender Selection Cards */}
        <View style={styles.optionsContainer}>
          {genderOptions.map((option) => {
            const isSelected = selectedGender === option.id;
            const isBeyondBinary = option.id === "beyond_binary";

            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.8}
                onPress={() => setSelectedGender(option.id)}
                style={[
                  styles.optionCard,
                  isBeyondBinary
                    ? styles.optionCardLarge
                    : styles.optionCardMedium,
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>

                {/* Radio Circle Indicator */}
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Toggle Switch Area */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Show gender on profile</Text>
          <Switch
            value={showOnProfile}
            onValueChange={setShowOnProfile}
            trackColor={{ false: "#2A2634", true: "#FF4081" }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#2A2634"
          />
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleGenderSubmit}
          activeOpacity={selectedGender ? 0.85 : 1}
          disabled={!selectedGender}
        >
          <LinearGradient
            colors={
              selectedGender
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
                  !selectedGender && styles.buttonTextDisabled,
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
};

export default ChooseGender;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0B14",
  },

  // Header Bar
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
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1D132B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF4081",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: "#F06292",
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
  },

  // Scroll Body
  scrollContent: {
    paddingHorizontal: 24,
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

  // Options Section
  optionsContainer: {
    gap: 16,
    marginBottom: 36,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  // Dynamic Height Controls
  optionCardMedium: {
    height: 72,
  },
  optionCardLarge: {
    minHeight: 92,
    paddingVertical: 14,
  },
  optionCardSelected: {
    borderColor: "#F06292",
    backgroundColor: "rgba(240, 98, 146, 0.08)",
    shadowColor: "#F06292",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  optionLabel: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  optionLabelSelected: {
    color: "#FFFFFF",
  },

  // Custom Radio Button
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    borderColor: "#F06292",
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F06292",
  },

  // Toggle Row
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  // Sticky Footer Button
  footer: {
    paddingHorizontal: 24,
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

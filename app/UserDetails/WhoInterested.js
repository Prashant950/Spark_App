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
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpdateWhoInterestedMutation } from "../../services/apiSlice";

const WhoInterested = () => {
  const router = useRouter();

  // Selected options state
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateWhoInterested] = useUpdateWhoInterestedMutation();

  const options = [
    { id: "Men", label: "Men" },
    { id: "Women", label: "Women" },
    { id: "Beyond Binary", label: "Beyond binary" },
    { id: "Everyone", label: "Everyone" },
  ];

  // Option selection handler
  const handleSelect = (id) => {
    if (id === "Everyone") {
      // Toggle 'Everyone' or select all options
      if (selectedOptions.includes("Everyone")) {
        setSelectedOptions([]);
      } else {
        setSelectedOptions(["Men", "Women", "Beyond Binary", "Everyone"]);
      }
    } else {
      let updated = [...selectedOptions];
      // Remove 'everyone' if toggling an individual option
      updated = updated.filter((item) => item !== "Everyone");

      if (updated.includes(id)) {
        updated = updated.filter((item) => item !== id);
      } else {
        updated.push(id);
      }

      // If all three individual options are selected, automatically include 'everyone'
      if (
        updated.includes("Men") &&
        updated.includes("Women") &&
        updated.includes("Beyond Binary")
      ) {
        updated.push("Everyone");
      }

      setSelectedOptions(updated);
    }
  };

  // Back Button Navigation
  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(
      () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/ChooseGender");
        }
      },
      Platform.OS === "android" ? 50 : 0,
    );
  };

  useEffect(() => {
    AsyncStorage.setItem("lastVisitedRoute", "/UserDetails/WhoInterested").catch(() => {});
  }, []);

  // Next Screen Navigation
  const handleWhoInterested = async () => {
    if (!selectedOptions.length) return;

    const preference = selectedOptions.includes("Everyone")
      ? "Everyone"
      : selectedOptions[selectedOptions.length - 1];

    setLoading(true);

    try {
      const response = await updateWhoInterested({ showMe: preference }).unwrap();
      if (response?.success) {
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "SHOW_ME_COMPLETED"
        );
        router.replace("/UserDetails/DistancePreference");
      }
    } catch (error) {
      console.error("Error updating who interested:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSelected = selectedOptions.length > 0;

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
          <View style={[styles.progressFill, { width: "70%" }]} />
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Who are you{"\n"}interested in{"\n"}seeing?
        </Text>
        <Text style={styles.subtitle}>
          Select all that apply to help us recommend the right people for you.
        </Text>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const active = selectedOptions.includes(option.id);

            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.8}
                onPress={() => handleSelect(option.id)}
                style={[styles.optionCard, active && styles.optionCardSelected]}
              >
                <Text
                  style={[
                    styles.optionText,
                    active && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>

                {active && (
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

        {/* Info Link */}
        <TouchableOpacity activeOpacity={0.7} style={styles.infoLinkContainer}>
          <Text style={styles.infoLinkText}>
            Learn how Spark uses this info.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Gradient Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleWhoInterested}
          activeOpacity={isSelected ? 0.85 : 1}
          disabled={!isSelected}
        >
          <LinearGradient
            colors={
              isSelected
                ? ["#FF4081", "#7C4DFF"]
                : ["rgba(255, 64, 129, 0.35)", "rgba(124, 77, 255, 0.35)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text
              style={[
                styles.buttonText,
                !isSelected && styles.buttonTextDisabled,
              ]}
            >
              Next
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WhoInterested;

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

  // Header Progress Bar
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
    marginTop: 14,
    marginBottom: 32,
    lineHeight: 22,
  },

  // Options List
  optionsContainer: {
    gap: 16,
    marginBottom: 28,
  },
  optionCard: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  optionCardSelected: {
    borderColor: "#FF4081",
    backgroundColor: "rgba(255, 64, 129, 0.08)",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  checkIcon: {
    marginLeft: 10,
  },

  // Info Link
  infoLinkContainer: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  infoLinkText: {
    fontSize: 15,
    color: "#4FC3F7",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Footer Button
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

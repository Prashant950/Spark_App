import { Feather, MaterialIcons } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";

const Orientation = () => {
  const router = useRouter();

  // Multi-selection state for orientation options
  const [selectedOrientations, setSelectedOrientations] = useState([]);
  // Profile visibility checkbox state
  const [showOnProfile, setShowOnProfile] = useState(false);

  const orientationOptions = [
    {
      id: "straight",
      title: "Straight",
      description:
        "A person who is exclusively attracted to members of the opposite gender",
    },
    {
      id: "gay",
      title: "Gay",
      description:
        "An umbrella term used to describe someone who is attracted to members of their gender",
    },
    {
      id: "lesbian",
      title: "Lesbian",
      description:
        "A woman who is emotionally, romantically, or sexually attracted to other women and non-binary people",
    },
    {
      id: "bisexual",
      title: "Bisexual",
      description:
        "A person who has potential for emotional, romantic or sexual attraction to people of more than one gender",
    },
    {
      id: "asexual",
      title: "Asexual",
      description:
        "A person who experiences little or no sexual attraction to others",
    },
    {
      id: "queer",
      title: "Queer",
      description:
        "An umbrella term used to describe individuals who are not heterosexual",
    },
  ];

  // Toggle selection (Allowing multiple selections)
  const toggleSelection = (id) => {
    if (selectedOrientations.includes(id)) {
      setSelectedOrientations(
        selectedOrientations.filter((item) => item !== id),
      );
    } else {
      setSelectedOrientations([...selectedOrientations, id]);
    }
  };

  // Back Button Navigation
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
  const handleNext = () => {
    router.push("/EnterInterests"); // Update with your next route
  };

  // Skip Navigation
  const handleSkip = () => {
    router.push("/EnterInterests"); // Update with your next route
  };

  const isSelectedAny = selectedOrientations.length > 0;

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

        {/* Center Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: "60%" }]} />
        </View>

        {/* Top Right Skip Button */}
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{"What's your sexual orientation?"}</Text>
        <Text style={styles.subtitle}>
          Select all that describe you to reflect your identity.
        </Text>

        {/* Option Cards */}
        <View style={styles.optionsContainer}>
          {orientationOptions.map((option) => {
            const isSelected = selectedOrientations.includes(option.id);

            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.8}
                onPress={() => toggleSelection(option.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <View style={styles.cardTextContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>

                {/* Check Icon Indicator */}
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

        {/* Checkbox: Show on profile */}
        <TouchableOpacity
          style={styles.checkboxRow}
          activeOpacity={0.8}
          onPress={() => setShowOnProfile(!showOnProfile)}
        >
          <MaterialIcons
            name={showOnProfile ? "check-box" : "check-box-outline-blank"}
            size={24}
            color={showOnProfile ? "#FF4081" : "rgba(255, 255, 255, 0.4)"}
          />
          <Text style={styles.checkboxLabel}>
            Show sexual orientation on profile
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky Bottom Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.push("/UserDetails/WhoInterested")}
          activeOpacity={isSelectedAny ? 0.85 : 1}
          disabled={!isSelectedAny}
        >
          <LinearGradient
            colors={
              isSelectedAny
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
                !isSelectedAny && styles.buttonTextDisabled,
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

export default Orientation;

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

  skipText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Scroll Area
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#A1A1AA",
    marginTop: 12,
    marginBottom: 28,
    lineHeight: 22,
  },

  // Option Cards
  optionsContainer: {
    gap: 16,
    marginBottom: 28,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  optionCardSelected: {
    borderColor: "#FF4081",
    backgroundColor: "rgba(255, 64, 129, 0.08)",
  },
  cardTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 13,
    color: "#A1A1AA",
    lineHeight: 18,
  },
  checkIcon: {
    marginLeft: 8,
  },

  // Checkbox Section
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 10,
  },

  // Sticky Bottom Footer
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

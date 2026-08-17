import {
    Feather,
    FontAwesome5,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Keyboard,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { useUpdateInterestsMutation } from "../../services/apiSlice";

const UsersSecondPageLifeStyle = () => {
  const router = useRouter();

  // Selection States for 3 categories
  const [Interest, setInterest] = useState("Social smoker");
  const [Hobby, setHobby] = useState("Every day");
  const [Hobby2, setHobby2] = useState("Dog");

  const[loading, setLoading] = useState(false);
  const [storedAuthUser, setStoredAuthUser] = useState(null);

  const authUser = useSelector((state) => state.auth?.user);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUserJson = await AsyncStorage.getItem("user");
        if (storedUserJson) {
          setStoredAuthUser(JSON.parse(storedUserJson));
        }
      } catch (error) {
        console.error("Error loading stored auth user:", error);
      }
    };

    loadStoredUser();
  }, []);

  const resolvedAuthUser = authUser || storedAuthUser;
  const displayName =
    resolvedAuthUser?.fullName?.trim() || "there";
  const firstName = displayName || displayName;

  const [updateInterests] = useUpdateInterestsMutation();

  // Lifestyle Categories Data
  const categories = [
    {
      id: "Interest",
      title: "How often do you Interest?",
      icon: <MaterialCommunityIcons name="smoking" size={18} color="#A1A1AA" />,
      options: [
        "Leather crafting",
        "Wood carving",
        "Drone photography",
        "Fishing",
        "Trying to quit",
      ],
      current: Interest,
      setter: setInterest,
    },
    {
      id: "Hobby",
      title: "Do you have any hobbies?",
      icon: <FontAwesome5 name="dumbbell" size={16} color="#A1A1AA" />,
      options: ["Model building", "3D printing", "Survival skills", "Never"],
      current: Hobby,
      setter: setHobby,
    },
    {
      id: "Hobby2",
      title: "Do you have any hobbies?",
      icon: <FontAwesome5 name="dog" size={16} color="#A1A1AA" />,
      options: [
        "Chess",
        "Jewelry making",
        "Dance",
        "Photography",
        "Travel journaling",
        "Painting",
        "Gardening",
        "Other",
        "Coding",
        "Listening to music",
        "Learning a new language",
        "Cooking",
      ],
      current: Hobby2,
      setter: setHobby2,
    },
  ];

  // Calculate selected count
  const selectedCount = [Interest, Hobby, Hobby2].filter(
    (item) => item !== "",
  ).length;
  const isAnySelected = selectedCount > 0;

  // Navigation Handlers
  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(
      () => {
        router.back();
      },
      Platform.OS === "android" ? 50 : 0,
    );
  };

  const handleSkip = () => {
    router.push("/UserDetails/AuthenticityAtracts/CommunicateStyleFirstPage"); // Update with your next screen route
  };

  const handleSubmitInterests = async () => {
    if (!isAnySelected) return;

    try {
      setLoading(true);
      const selectedInterests = [Interest, Hobby, Hobby2].filter(
        (item) => item && item.trim() !== "",
      );

      const response = await updateInterests({ interests: selectedInterests }).unwrap();

      if (response?.success) {
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "INTERESTS_COMPLETED"
        );
        router.push("/UserDetails/AuthenticityAtracts/CommunicateStyleFirstPage");
      } else {
        console.warn("Interests update did not succeed:", response);
      }
    } catch (error) {
      console.error("Error updating interests:", error);
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
          <View style={[styles.progressFill, { width: "95%" }]} />
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
        <Text style={styles.title}>
          {`Let's talk lifestyle habits, ${firstName}`}
        </Text>
        <Text style={styles.subtitle}>
          Do their habits match yours? You go first.
        </Text>

        {/* Categories List */}
        {categories.map((category, index) => (
          <View key={category.id} style={styles.categoryContainer}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              {category.icon}
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>

            {/* Options Chips */}
            <View style={styles.chipsContainer}>
              {category.options.map((option) => {
                const isSelected = category.current === option;

                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.8}
                    onPress={() => category.setter(isSelected ? "" : option)}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Divider Line except for last element */}
            {index < categories.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>

      {/* Footer Gradient Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSubmitInterests}
          activeOpacity={isAnySelected ? 0.85 : 1}
          disabled={!isAnySelected}
        >
          <LinearGradient
            colors={
              isAnySelected
                ? ["#FF4081", "#7C4DFF"]
                : ["rgba(255, 64, 129, 0.35)", "rgba(124, 77, 255, 0.35)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.buttonText,
                !isAnySelected && styles.buttonTextDisabled,
              ]}
            >
              Next {selectedCount}/3
            </Text>
          )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UsersSecondPageLifeStyle;

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

  skipText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Scroll Content Body
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
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
    marginTop: 10,
    marginBottom: 32,
    lineHeight: 22,
  },

  // Category Section
  categoryContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginLeft: 10,
  },

  // Chips Layout
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  chipSelected: {
    borderColor: "#FF4081",
    backgroundColor: "#FFFFFF", // Highlighted white card as seen in image
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chipTextSelected: {
    color: "#0D0B14", // Dark text when selected
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginTop: 24,
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.4)",
  },
});

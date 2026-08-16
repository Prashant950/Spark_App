import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Platform,
  Keyboard,ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useUpdateCreativityInterestsMutation} from "../../../services/apiSlice";

const Creativity = () => {
  const router = useRouter();

   useEffect(() => {
    AsyncStorage.setItem("lastVisitedRoute", "/UserDetails/UsersInterests10Pages/Creativity").catch(() => {});
  }, []);


  // Multi-selection state for interests (Max 10)
  const [selectedInterests, setSelectedInterests] = useState([]);
  const[loading,setLoading]=useState(false);
  const [updateCreativityInterests] = useUpdateCreativityInterestsMutation();

  // Expand / Collapse State for Categories
  const [expandedCategories, setExpandedCategories] = useState({
    creativity: false,
    favourites: false,
    food: false,
  });

  // Interest Categories Data
  const categories = [
    {
      id: "creativity",
      title: "Creativity",
      initialOptions: [
        "Trainers",
        "Poetry",
        "Freelancing",
        "Photography",
        "Language exchange",
      ],
      extraOptions: ["Writing", "Design", "Painting", "Crafts", "DIY"],
    },
    {
      id: "favourites",
      title: "Fan favourites",
      initialOptions: [
        "'90s kid",
        "Comic Con",
        "Harry Potter",
        "NBA",
        "MLB",
        "Dungeons & Dragons",
      ],
      extraOptions: ["Marvel", "Anime", "Gaming", "Cosplay", "Star Wars"],
    },
    {
      id: "food",
      title: "Food and drink",
      initialOptions: [
        "Maggi",
        "Biryani",
        "Sushi",
        "Food tours",
        "Foodie",
        "Brunch",
        "Açaí",
        "Street food",
      ],
      extraOptions: ["Pizza", "Coffee", "Baking", "Tacos", "Wine"],
    },
  ];

  // Toggle selection (Up to 10 max)
  const toggleSelection = (item) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      if (selectedInterests.length < 10) {
        setSelectedInterests([...selectedInterests, item]);
      }
    }
  };

  // Toggle category expansion
  const toggleExpand = (id) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedCount = selectedInterests.length;
  const isAnySelected = selectedCount > 0;

  // Navigation Handlers
  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      router.back();
    }, Platform.OS === "android" ? 50 : 0);
  };

  const handleNext = async () => {
    setLoading(true);
  if (!isAnySelected) return;

  try {
    const response = await updateCreativityInterests({
      passions: selectedInterests,
    }).unwrap();

    if (response?.success) {
      await AsyncStorage.setItem(
        "onboardingStep",
        response?.user?.onboardingStep || "CREATIVITY_COMPLETED"
      );
      router.push("/UserDetails/UserPhoto");
    }
  } catch (error) {
    console.error("Error saving creativity interests:", error);
  }
};

  const handleSkip = () => {
    router.push("/UserDetails/UserPhoto"); // Update with your next screen route
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
          <View style={[styles.progressFill, { width: "80%" }]} />
        </View>

        {/* Top Right Skip Button */}
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content Body */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What are you into?</Text>
        <Text style={styles.subtitle}>
          Add up to 10 interests to your profile to help you find people who share
          what you love.
        </Text>

        {/* Categories Sections */}
        {categories.map((category) => {
          const isExpanded = expandedCategories[category.id];
          const displayOptions = isExpanded
            ? [...category.initialOptions, ...category.extraOptions]
            : category.initialOptions;

          return (
            <View key={category.id} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category.title}</Text>

              {/* Chips Layout */}
              <View style={styles.chipsContainer}>
                {displayOptions.map((option) => {
                  const isSelected = selectedInterests.includes(option);

                  return (
                    <TouchableOpacity
                      key={option}
                      activeOpacity={0.8}
                      onPress={() => toggleSelection(option)}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                      ]}
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

              {/* Show More / Show Less Trigger */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleExpand(category.id)}
                style={styles.showMoreRow}
              >
                <View style={styles.dividerLine} />
                <View style={styles.showMoreButton}>
                  <Text style={styles.showMoreText}>
                    {isExpanded ? "Show less" : "Show more"}
                  </Text>
                  <Feather
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#A1A1AA"
                    style={{ marginLeft: 4 }}
                  />
                </View>
                <View style={styles.dividerLine} />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Sticky Bottom Next Button with Count */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleNext}
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
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  !isAnySelected && styles.buttonTextDisabled,
                ]}
            >
              Next {selectedCount}/10
            </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Creativity;

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
    marginBottom: 28,
    lineHeight: 22,
  },

  // Category Container
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 14,
  },

  // Chips Layout
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  chipSelected: {
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF", // Highlighted white pill box
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

  // Show More Row with Divider Lines
  showMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  showMoreText: {
    fontSize: 14,
    color: "#A1A1AA",
    fontWeight: "600",
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
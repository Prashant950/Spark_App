import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { useUpdateEssentialsAndCommunicationStyleMutation } from "../../../services/apiSlice";

const CommunicateSecondPage = () => {
  const router = useRouter();

  // Selection States
  // 1. Multi-Select for Communication Style (Array so user can select 2 or more)
  const [commStyle, setCommStyle] = useState(["Big texter"]);
  // 2. Single or Multi Select for Music / Instruments
  const [musicPref, setMusicPref] = useState("Guitar");
  // 3. Multi-Select for Likes & Interests
  const [likes, setLikes] = useState(["Driving", "Swimming"]);

  const [isLoading, setIsLoading] = useState(false);

  const [updateEssentialsAndCommunicationStyle] = useUpdateEssentialsAndCommunicationStyleMutation();


useEffect(() => {
    AsyncStorage.setItem("lastVisitedRoute", "/UserDetails/AuthenticityAtracts/CommunicateStyleSecondPage").catch(() => {});
  }, []); 

  // Communication Options
  const commOptions = [
    {
      id: "Big texter",
      label: "Big texter",
      icon: <Ionicons name="chatbubbles-outline" size={22} color="#FFFFFF" />,
    },
    {
      id: "Phone caller",
      label: "Phone caller",
      icon: <Feather name="phone-call" size={20} color="#FFFFFF" />,
    },
    {
      id: "Video chatter",
      label: "Video chatter",
      icon: <Feather name="video" size={20} color="#FFFFFF" />,
    },
    {
      id: "In person",
      label: "In person",
      icon: <Ionicons name="people-outline" size={22} color="#FFFFFF" />,
    },
    {
      id: "Whatsapp Chat",
      label: "Whatsapp Chat",
      icon: <Feather name="message-circle" size={20} color="#FFFFFF" />,
    },
  ];

  // Musical Instrument & Music Options
  const musicOptions = [
    "Guitar",
    "Piano",
    "Violin",
    "Listen Music",
  ];

  // What do you like Options
  const likesOptions = [
    "Watching sports",
    "Driving",
    "Museum visits",
    "Gardening",
    "Swimming",
  ];

  // Toggle Function for Communication Style (Multi-select)
  const toggleCommStyle = (id) => {
    if (commStyle.includes(id)) {
      setCommStyle(commStyle.filter((item) => item !== id));
    } else {
      setCommStyle([...commStyle, id]);
    }
  };

  // Toggle Function for What do you like (Multi-select)
  const toggleLikes = (option) => {
    if (likes.includes(option)) {
      setLikes(likes.filter((item) => item !== option));
    } else {
      setLikes([...likes, option]);
    }
  };

  // Navigation Handlers
  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      router.back();
    }, Platform.OS === "android" ? 50 : 0);
  };

  const handleSkip = () => {
    router.push("/UserDetails/AuthenticityAtracts/ComunicateThirdPage");
  };

  const handleNext = async () => {
    try {
      setIsLoading(true);
      // Backend payload structure:
      const payload = {
        communicationStyle: commStyle, // Array e.g. ["Big texter", "In person"]
        musicPreference: musicPref,     // String e.g. "Guitar"
        interests: likes,               // Array e.g. ["Driving", "Swimming"]
      };

      const response = await updateEssentialsAndCommunicationStyle(payload).unwrap();

      await AsyncStorage.setItem(
        "onboardingStep",
        response?.user?.onboardingStep || "ESSENTIALS_COMMUNICATION_STYLE_COMPLETED2"
      );

      // Next Page Push
      router.push("/UserDetails/AuthenticityAtracts/ComunicateThirdPage");
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsLoading(false);
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

        {/* Top Right Skip Button */}
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Scroll Body */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>The Essentials</Text>
        <Text style={styles.subtitle}>
          Your lifestyle choices help us refine your matches.
        </Text>

        {/* SECTION 1: Communication Style (Multi-Select) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {"What's your communication style?"}
          </Text>
          <Text style={styles.sectionSubtitle}>Select one or more</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {commOptions.map((item) => {
              const isSelected = commStyle.includes(item.id);

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => toggleCommStyle(item.id)}
                  style={[
                    styles.commCard,
                    isSelected && styles.cardSelected,
                  ]}
                >
                  <View style={styles.iconWrapper}>{item.icon}</View>
                  <Text style={styles.commLabel}>{item.label}</Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SECTION 2: Musical Instrument & Listen Music */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Playing a Musical Instrument / Music
          </Text>
          <View style={styles.pillsContainer}>
            {musicOptions.map((option) => {
              const isSelected = musicPref === option;

              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.8}
                  onPress={() => setMusicPref(isSelected ? "" : option)}
                  style={[
                    styles.pillCard,
                    isSelected && styles.cardSelected,
                  ]}
                >
                  <Text style={styles.pillText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SECTION 3: What do you like? (Multi-Select List) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What do you like?</Text>
          <View style={styles.listContainer}>
            {likesOptions.map((option) => {
              const isSelected = likes.includes(option);

              return (
                <TouchableOpacity
                  key={option}
                  activeOpacity={0.8}
                  onPress={() => toggleLikes(option)}
                  style={[
                    styles.listCard,
                    isSelected && styles.cardSelected,
                  ]}
                >
                  <Text style={styles.listText}>{option}</Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={22}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          disabled={isLoading}
        >
          <LinearGradient
            colors={["#FF4081", "#7C4DFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Next</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CommunicateSecondPage;

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
  skipText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#A1A1AA",
  },

  // Scroll Content Body
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
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
    marginTop: 10,
    marginBottom: 32,
    lineHeight: 22,
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#A1A1AA",
    marginBottom: 12,
  },

  // Section 1: Horizontal Cards
  horizontalScroll: {
    gap: 12,
    paddingRight: 10,
  },
  commCard: {
    position: "relative",
    width: 105,
    height: 110,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  iconWrapper: {
    marginBottom: 10,
  },
  commLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF4081",
    justifyContent: "center",
    alignItems: "center",
  },

  // Section 2: Pills Layout
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  pillCard: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  pillText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Section 3: List Cards Layout
  listContainer: {
    gap: 12,
    marginTop: 10,
  },
  listCard: {
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
  listText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Common Selection Style
  cardSelected: {
    borderColor: "#FF4081",
    backgroundColor: "rgba(255, 64, 129, 0.12)",
  },

  // Footer Gradient Button
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
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
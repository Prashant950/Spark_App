import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const Welcomepage = () => {
  const router = useRouter();

  // Rules list configuration
  const rules = [
    {
      id: "1",
      title: "Be yourself.",
      description:
        "Make sure your photos, age and bio are true to who you are.",
    },
    {
      id: "2",
      title: "Stay safe.",
      description:
        "Don't be too quick to give out personal information. ",
      link: "Date Safely",
    },
    {
      id: "3",
      title: "Play it cool.",
      description:
        "Respect others and treat them as you would like to be treated.",
    },
    {
      id: "4",
      title: "Be proactive.",
      description: "Always report bad behavior.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header Close Icon */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/login");
            }
          }}
          activeOpacity={0.7}
        >
          <Feather name="x" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Rules Section */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Spark App Icon/Logo */}
        <View style={styles.logoWrapper}>
          <Image
            source={require("../assets/images/logo.png")} // Replace with your actual logo path
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Headings */}
        <Text style={styles.title}>Welcome to{"\n"}Spark.</Text>
        <Text style={styles.subtitle}>Please follow these house rules.</Text>

        {/* Rules Cards Container */}
        <View style={styles.rulesContainer}>
          {rules.map((rule) => (
            <View key={rule.id} style={styles.ruleCard}>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
              <Text style={styles.ruleDescription}>
                {rule.description}
                {rule.link && (
                  <Text
                    style={styles.ruleLink}
                    onPress={() => {
                      /* Handle Safety Link Action */
                    }}
                  >
                    {rule.link}
                  </Text>
                )}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={async () => {
            await AsyncStorage.setItem("onboardingStep", "EMAIL_VERIFIED");
            await AsyncStorage.setItem("lastVisitedRoute", "/EnterName");
            router.replace("/EnterName");
          }}
        >
          <LinearGradient
            colors={["#FF4081", "#7C4DFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>I agree</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Welcomepage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0B14",
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  // Logo Icon Box with Glow
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#161320",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  logoImage: {
    width: 36,
    height: 36,
  },

  // Typography
  title: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#B6B2B2",
    marginTop: 10,
    marginBottom: 28,
  },

  // Rule Cards
  rulesContainer: {
    gap: 16,
  },
  ruleCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
  },
  ruleTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F06292",
    marginBottom: 8,
  },
  ruleDescription: {
    fontSize: 14,
    color: "#B6B2B2",
    lineHeight: 22,
  },
  ruleLink: {
    color: "#4DB6AC",
    textDecorationLine: "underline",
    fontWeight: "600",
  },

  // Sticky Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#0D0B14",
  },
  gradientButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
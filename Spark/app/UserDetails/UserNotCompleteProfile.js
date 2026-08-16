import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  Platform,ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCompleteOnboardingMutation } from "../../services/apiSlice";

const UserNotCompleteProfile = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [completeOnboarding] = useCompleteOnboardingMutation();

   useEffect(() => {
        AsyncStorage.setItem("lastVisitedRoute", "/UserDetails/UserNotCompleteProfile").catch(() => {});
      }, []);

  // Complete Now Action (Triggers Video Selfie / Biometric Check)
  const handleCompleteNow = () => {
    setLoading(true);
    console.log("Navigating to Face Check...");
    router.push("/UserDetails/FaceVerification"); // Update with your face verification screen route
  };

  // Maybe Later Action (Finish Onboarding -> Go to Main App Tabs)
  const handleMaybeLater = async () => {
    try {
      const response = await completeOnboarding().unwrap();
      if (response?.success) {
        await AsyncStorage.setItem("onboardingStep", "PROFILE_COMPLETE");
      }
    } catch (error) {
      console.warn("Complete onboarding warning:", error);
    } finally {
      router.replace("/(user)/swipe");
    }
  };

  // Learn More Policy Handler
  const handleLearnMore = () => {
    Alert.alert(
      "Photo Verification",
      "Face Check uses video selfie technology to ensure you are the actual person in your profile photos. Your biometric data is encrypted and processed securely according to our Privacy Policy.",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Center 3D Blue Verified Badge Graphic */}
        <View style={styles.badgeContainer}>
          <View style={styles.outerBadge}>
            <LinearGradient
              colors={["#0099FF", "#0055FF"]}
              style={styles.gradientBadge}
            >
              <MaterialIcons name="verified" size={80} color="#FFFFFF" />
            </LinearGradient>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{"Let's keep it real"}</Text>

        {/* Primary Description */}
        <Text style={styles.description}>
          For more authentic connections, users in your region are required to
          complete a biometric Face Check with a video selfie. This helps
          prevent fraud, detect duplicate accounts, and enforce our terms. If
          your profile photos match your Face Check, you will get a Photo
          Verified badge.{" "}
          <Text style={styles.learnMoreLink} onPress={handleLearnMore}>
            Learn more
          </Text>
        </Text>

        {/* Sub-disclaimer */}
        <Text style={styles.subtext}>
          {"Your profile won't be visible to others until you complete this step."}
        </Text>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.footer}>
        {/* Gradient Primary Action Button */}
        <TouchableOpacity activeOpacity={0.85} onPress={handleCompleteNow}>
          <LinearGradient
            colors={["#FF4081", "#7C4DFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Complete now</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary Action Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleMaybeLater}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UserNotCompleteProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0B14",
  },

  // Main Content Scroll Body
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Verified Badge Illustration Container
  badgeContainer: {
    marginBottom: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  outerBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowColor: "#0088FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientBadge: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  // Texts
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: "#D1D5DB",
    textAlign: "center",
    lineHeight: 23,
    fontWeight: "400",
    marginBottom: 28,
  },
  learnMoreLink: {
    color: "#4FC3F7",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  subtext: {
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 22,
  },

  // Footer Actions Area
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 24,
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
    marginBottom: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  // Maybe Later Button
  secondaryButton: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  Platform,
  Keyboard,ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCompleteAvoidSomeoneMutation } from "../../services/apiSlice";

const AvoidSomeone = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [completeAvoidSomeone] = useCompleteAvoidSomeoneMutation();

  // Close / Dismiss Screen Handler
  const handleClose = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      router.back();
    }, Platform.OS === "android" ? 50 : 0);
  };

  useEffect(() => {
        AsyncStorage.setItem("lastVisitedRoute", "/UserDetails/AvoidSomeone").catch(() => {});
      }, []);
      

  // Privacy Link Handler
  const handleLearnMore = () => {
    Alert.alert(
      "Contact Privacy",
      "Spark accesses your device contacts to let you select specific people you wish to block. Your contacts are encrypted and never stored publicly or used for marketing."
    );
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const response = await completeAvoidSomeone().unwrap();
      if (response?.success) {
        await AsyncStorage.setItem("onboardingStep", "AVOID_SOMEONE_COMPLETED");
      }
    } catch (error) {
      console.warn("AvoidSomeone step save warning:", error);
    } finally {
      setLoading(false);
      router.push("/UserDetails/UserNotCompleteProfile");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header Bar with 'X' Close Icon */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content Body */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Want to avoid someone you know on Spark?
        </Text>

        <Text style={styles.paragraph}>
          {"It's easy – share your device's contacts with Spark when using this\n          feature to pick who you want to avoid."}
        </Text>

        <Text style={styles.paragraph}>
         {" We'll store your blocked contacts to stop you from seeing each other if your contact has an account with the same info you provide. You can stop sharing contacts with us in your settings."}
        </Text>
      </ScrollView>

      {/* Footer Area */}
      <View style={styles.footer}>
        {/* Learn More Policy Link */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLearnMore}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            Learn more here, including how Spark processes your contacts.
          </Text>
        </TouchableOpacity>

        {/* Gradient Continue Button */}
        <TouchableOpacity activeOpacity={0.85} onPress={handleContinue}>
          <LinearGradient
            colors={["#FF4081", "#7C4DFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AvoidSomeone;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0B14",
  },

  // Header Bar
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },

  // Scroll Body Content
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
    marginBottom: 28,
  },
  paragraph: {
    fontSize: 16,
    color: "#D1D5DB",
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: "400",
  },

  // Footer Section
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: "#0D0B14",
  },

  // Policy Link
  linkContainer: {
    marginBottom: 24,
  },
  linkText: {
    fontSize: 15,
    color: "#4FC3F7",
    fontWeight: "600",
    lineHeight: 22,
    textDecorationLine: "underline",
  },

  // Gradient CTA Button
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
});
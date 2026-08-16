import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Platform,
  Keyboard,
  KeyboardAvoidingView,ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUpdateBioMutation } from "../../services/apiSlice";
const MAX_BIO_LENGTH = 500;

const UserEnterAbout = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [updateBio,{isLoading}] = useUpdateBioMutation();

  // Bio state & expanded state
  const [bio, setBio] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const isValidInput = bio.trim().length > 0;

  // Toggle Textarea Expansion
  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Back Navigation
  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      }
    }, Platform.OS === "android" ? 50 : 0);
  };

  useEffect(() => {
    AsyncStorage.setItem("lastVisitedRoute", "/UserDetails/UserEnterAbout").catch(() => {});
  }, []);

  // Next Screen Navigation
 const handleNext = async () => {
    setLoading(true);
    if (!isValidInput || isLoading) return;

    Keyboard.dismiss();

    try {
      const response = await updateBio({ bio: bio.trim() }).unwrap();

      if (response?.success) {
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "BIO_COMPLETED"
        );
        router.push("/UserDetails/UserEnableLocation");
      }
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };

  // Skip Navigation
  const handleSkip = async () => {
    Keyboard.dismiss();
    try {
      const response = await updateBio({ bio: "" }).unwrap();
      if (response?.success) {
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "BIO_COMPLETED"
        );
      }
    } catch (e) {
      console.error("Error skipping bio:", e);
    } finally {
      router.push("/UserDetails/UserEnableLocation");
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
          <View style={[styles.progressFill, { width: "90%" }]} />
        </View>

        {/* Top Right Skip Button */}
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Title */}
          <Text style={styles.title}>
            Share more about{"\n"}yourself
          </Text>
          <Text style={styles.subtitle}>
            Write a bio to help your profile stand out and spark conversations.
          </Text>

          {/* About Me Card Wrapper */}
          <View style={styles.aboutCardWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggleExpand}
              style={[
                styles.aboutCard,
                isExpanded && styles.aboutCardActive,
              ]}
            >
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>About me</Text>
                <Text style={styles.cardDescription}>
                  Introduce yourself to make a strong impression.
                </Text>
              </View>

              {/* Floating Plus / Check Circle Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={toggleExpand}
                style={[
                  styles.plusButtonCircle,
                  isExpanded && styles.plusButtonActive,
                ]}
              >
                <Feather
                  name={isExpanded ? "minus" : "plus"}
                  size={20}
                  color={isExpanded ? "#FFFFFF" : "#0D0B14"}
                />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Expandable Multiline Bio Textarea */}
            {isExpanded && (
              <View style={styles.textareaContainer}>
                <TextInput
                  style={styles.textarea}
                  placeholder="Write something interesting about yourself..."
                  placeholderTextColor="rgba(255, 255, 255, 0.35)"
                  value={bio}
                  onChangeText={(text) => {
                    if (text.length <= MAX_BIO_LENGTH) {
                      setBio(text);
                    }
                  }}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  autoFocus
                  selectionColor="#FF4081"
                />

                {/* Character Counter */}
                <Text style={styles.charCounter}>
                  {bio.length}/{MAX_BIO_LENGTH}
                </Text>
              </View>
            )}
          </View>

          {/* Match Tip Banner */}
          <View style={styles.tipBox}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color="#FF4081"
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Adding a short intro about you could lead to{" "}
              <Text style={styles.tipHighlight}>25% more matches</Text>
            </Text>
          </View>
        </ScrollView>

        {/* Footer Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleNext}
            activeOpacity={isValidInput ? 0.85 : 1}
            disabled={!isValidInput}
          >
            <LinearGradient
              colors={
                isValidInput
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
                  !isValidInput && styles.buttonTextDisabled,
                ]}
              >
                Next
              </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UserEnterAbout;

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

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
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
    marginTop: 10,
    marginBottom: 32,
    lineHeight: 22,
  },

  // About Card
  aboutCardWrapper: {
    marginBottom: 28,
  },
  aboutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    position: "relative",
  },
  aboutCardActive: {
    borderColor: "#FF4081",
    backgroundColor: "rgba(255, 64, 129, 0.08)",
  },
  cardTextContent: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#A1A1AA",
    lineHeight: 20,
  },

  // Floating Action Circle Button
  plusButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  plusButtonActive: {
    backgroundColor: "#FF4081",
  },

  // Multiline Textarea
  textareaContainer: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "#FF4081",
    padding: 16,
  },
  textarea: {
    minHeight: 120,
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
  },
  charCounter: {
    fontSize: 12,
    color: "#A1A1AA",
    textAlign: "right",
    marginTop: 8,
    fontWeight: "600",
  },

  // Tip Box
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  tipIcon: {
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 20,
    fontWeight: "500",
  },
  tipHighlight: {
    color: "#FF4081",
    fontWeight: "700",
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
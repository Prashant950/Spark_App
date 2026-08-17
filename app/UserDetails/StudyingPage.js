import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpdateCollegeMutation } from "../../services/apiSlice";

const StudyingPage = () => {
  const router = useRouter();

  const [collegeName, setCollegeName] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const[loading,setLoading]=useState(false);

  const [updateCollege] = useUpdateCollegeMutation();

  const isValidInput = collegeName.trim().length > 0;

  // Smooth Back Navigation
  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(
      () => {
        if (router.canGoBack()) {
          router.back();
        }
      },
      Platform.OS === "android" ? 50 : 0,
    );
  };

  useEffect(() => {
    AsyncStorage.setItem("lastVisitedRoute", "/UserDetails/StudyingPage").catch(() => {});
  }, []);

  // Next Screen Navigation
  const handleNext = () => {
    if (isValidInput) {
      Keyboard.dismiss();
      router.push("/EnterInterests"); // Update with your next screen route
    }
  };
  const handleSkip = () => {
    router.push("/UserDetails/UsersFirstPageLifestyle"); // Update with your next screen route
  }
  
  const handleSubmitStudying = async () => {
    try {
      setLoading(true);
      const payload = {
        college: collegeName.trim(),
      };
      console.log("StudyingPage: sending college payload", payload);

      const response = await updateCollege(payload).unwrap();
      // console.log("StudyingPage: updateCollege response", response);

      if (response?.success) {
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "STUDYING_COMPLETED"
        );
        router.replace("/UserDetails/UsersFirstPageLifestyle");
      } else {
        console.warn("College update did not succeed", response);
      }
    } catch (error) {
      console.error("Error updating college:", error);
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

        {/* Center Progress Bar */}
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
          bounces={false}
        >
          {/* Main Title */}
          <Text style={styles.title}>If studying is your{"\n"}thing...</Text>

          {/* Underlined College / University Input Box */}
          <View
            style={[
              styles.inputContainer,
              isFocused && styles.inputContainerFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Enter college/university name"
              placeholderTextColor="rgba(255, 255, 255, 0.35)"
              value={collegeName}
              onChangeText={setCollegeName}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleNext}
              selectionColor="#FF4081"
            />

            {/* Clear Input Button ('X' icon) */}
            {collegeName.length > 0 && (
              <TouchableOpacity
                onPress={() => setCollegeName("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="rgba(255, 255, 255, 0.4)"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Subtitle / Disclaimer */}
          <Text style={styles.subtext}>
            {"This is how it'll appear on your profile."}
          </Text>

          {/* Gradient Action Button */}
          <TouchableOpacity
            onPress={handleSubmitStudying}
            activeOpacity={isValidInput ? 0.85 : 1}
            disabled={!isValidInput}
            style={styles.buttonWrapper}
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
                <ActivityIndicator color="#fff" />
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default StudyingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0B14",
  },

  // Header
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
    marginBottom: 40,
  },

  // Input Container (Underlined Bottom Border)
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "rgba(255, 255, 255, 0.25)",
    paddingBottom: 10,
    marginBottom: 12,
  },
  inputContainerFocused: {
    borderBottomColor: "#FF4081",
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  subtext: {
    fontSize: 14,
    color: "#A1A1AA",
    marginBottom: 40,
  },

  // Button Wrapper directly below input
  buttonWrapper: {
    marginTop: 20,
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

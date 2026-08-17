import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Keyboard,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSendEmailOTPMutation } from "../services/apiSlice";

const EnterEmail = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const validateEmail = (inputEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(inputEmail);
  };
  const isValidEmail = emailRegex.test(email);

  const [sendEmailOTP, { isLoading }] = useSendEmailOTPMutation();

  const topPadding =
    Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 12;

  const handleSendOTP = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      // Call RTK Query Mutation
      const response = await sendEmailOTP({ email: trimmedEmail }).unwrap();

      if (response?.success) {
        // Redirect to OTP Verification Screen with email parameter
        router.push({
          pathname: "/EmailOTPVerify",
          params: { email: trimmedEmail },
        });
      }
    } catch (error) {
      Alert.alert(
        "Failed to Send OTP",
        error?.data?.message || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: topPadding }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
      >
        <Ionicons name="arrow-back" size={34} color="#fff" />
      </TouchableOpacity>

      {/* Heading */}
      <Text style={styles.heading}> {"What's your email?"}</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);

            const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

            if (regex.test(text.trim())) {
              Keyboard.dismiss(); // Close keyboard
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          returnKeyType="done"
          placeholder="your@gmail.com"
          placeholderTextColor="#BDBDBD"
          style={styles.input}
          onSubmitEditing={() => {
            if (isValidEmail) {
              Keyboard.dismiss();
            }
          }}
        />
      </View>

      {/* Description */}
      <Text style={styles.description}>
        {
          "We'll send you a code to verify your email. You may need to check your spam email folder."
        }
      </Text>

      {/* Validation Error */}
      {email.length > 0 && !isValidEmail && (
        <Text style={styles.error}>Please enter a valid email address.</Text>
      )}

      {/* Next Button */}
      <TouchableOpacity
        activeOpacity={isValidEmail && !isLoading ? 0.85 : 1}
        disabled={!isValidEmail || isLoading}
        style={styles.buttonWrapper}
        onPress={handleSendOTP}
      >
        <LinearGradient
          colors={
            isValidEmail && !isLoading
              ? ["#FF4081", "#7C4DFF"]
              : ["rgba(255, 64, 129, 0.35)", "rgba(124, 77, 255, 0.35)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.buttonText,
                !isValidEmail && styles.buttonTextDisabled,
              ]}
            >
              Next
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EnterEmail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 25,
  },

  backButton: {
    marginTop: 15,
    marginBottom: 40,
  },

  heading: {
    color: "#fff",
    fontSize: 55,
    fontWeight: "700",
    marginBottom: 60,
  },

  inputContainer: {
    borderBottomWidth: 2,
    borderBottomColor: "#6E6666",
    marginBottom: 28,
  },

  input: {
    color: "#fff",
    fontSize: 22,
    paddingBottom: 12,
  },

  description: {
    color: "#B6B2B2",
    fontSize: 16,
    lineHeight: 30,
  },
  buttonWrapper: {
    width: "100%",
    marginTop: "auto",
    marginBottom: 20,
  },
  gradientButton: {
    height: 54,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.4)",
  },

  error: {
    color: "#ff4d4d",
    marginTop: 15,
    fontSize: 15,
  },

  button: {
    position: "absolute",
    bottom: 35,
    left: 25,
    right: 25,
    height: 62,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
});

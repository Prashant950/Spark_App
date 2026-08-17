import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useUserfullnameMutation } from "../services/apiSlice";

const EnterName = () => {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [userfullname, { isLoading }] = useUserfullnameMutation();

  const isValidName = fullName.trim().length >= 2;

  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/Welcomepage");
      }
    }, Platform.OS === "android" ? 50 : 0);
  };

  useEffect(() => {
    AsyncStorage.setItem("lastVisitedRoute", "/EnterName").catch(() => {});
  }, []);

  const handlesubmitName = async () => {
    if (isLoading || !fullName.trim()) {
      return;
    }
    try {
      const response = await userfullname({ fullName }).unwrap();
      if (response?.success) {
        const updatedUser = response?.user;
        if (updatedUser?.fullName) {
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        }
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "NAME_COMPLETED"
        );
        router.replace("/EnterDOB");
      }
    } catch (error) {
      console.error("Error updating full name:", error);
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
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* KeyboardAvoidingView adds smooth shift up */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Main Title */}
          <Text style={styles.title}>{"What's your Full name.?"}</Text>
          <Text style={styles.subtitle}>
            {"This is how it'll appear on your profile. Can't change it later."}
          </Text>

          {/* Input Box */}
          <View
            style={[
              styles.inputBox,
              isFocused && styles.inputBoxFocused,
            ]}
          >
            <Feather
              name="user"
              size={20}
              color={isFocused ? "#F06292" : "rgba(255, 255, 255, 0.4)"}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Full Name"
              placeholderTextColor="rgba(244, 143, 177, 0.4)"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              selectionColor="#F06292"
            />
          </View>

          {/* Button Shifted Directly Below Input */}
          <TouchableOpacity onPress={handlesubmitName}
            activeOpacity={isValidName && !isLoading ? 0.85 : 1}
            disabled={!isValidName || isLoading}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={
                isValidName
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
                  (!isValidName || isLoading) && styles.buttonTextDisabled,
                ]}
              >
                {isLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : "NEXT"}
              </Text>
              <Feather
                name="arrow-right"
                size={18}
                color={isValidName ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)"}
                style={styles.buttonIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EnterName;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0B14",
  },

  header: {
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

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },

  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#A1A1AA",
    marginTop: 12,
    marginBottom: 32,
    lineHeight: 22,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(240, 98, 146, 0.3)",
    paddingHorizontal: 18,
  },
  inputBoxFocused: {
    borderColor: "#F06292",
    backgroundColor: "rgba(240, 98, 146, 0.08)",
    shadowColor: "#F06292",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  // Button directly below input (marginTop: 28)
  buttonWrapper: {
    marginTop: 28, 
  },
  gradientButton: {
    height: 54,
    borderRadius: 27,
    flexDirection: "row",
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
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.4)",
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
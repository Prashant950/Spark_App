import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSendOTPMutation } from "../services/apiSlice";

const EnterMobile = () => {
  const [phone, setPhone] = useState("");
  const router = useRouter();
  const [sendOTP, { isLoading }] = useSendOTPMutation();

  const topPadding = Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 12;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: topPadding }]}> 
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/login");
          }
        }}
        hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
      >
        <Ionicons name="arrow-back" size={34} color="#fff" />
      </TouchableOpacity>

      {/* Heading */}
      <Text style={styles.heading}>Can we get your{"\n"}number?</Text>

      {/* Number Row */}
      <View style={styles.row}>
        {/* Country */}
        <TouchableOpacity style={styles.countryContainer}>
          <Text style={styles.countryText}>IN +91</Text>
          <MaterialIcons name="arrow-drop-down" size={28} color="#9E9E9E" />
        </TouchableOpacity>

        {/* Phone */}
        <View style={styles.phoneContainer}>
          <TextInput
            value={phone}
            onChangeText={(text) => {
              const value = text.replace(/[^0-9]/g, "");
              setPhone(value);

              if (value.length === 10) {
                Keyboard.dismiss(); // Close keyboard
              }
            }}
            keyboardType="number-pad"
            textContentType="telephoneNumber"
            returnKeyType="done"
            maxLength={10}
            placeholder="Enter mobile number"
            placeholderTextColor="#BDBDBD"
            style={styles.input}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        {"By entering your number and tapping 'Next', you agree to get account (e.g. verification codes, activity updates, profile alerts) and promotional texts from Spark. Texts may be automated. Consent not required for purchase."}
      </Text>

      {/* Bottom Button */}
      <TouchableOpacity
        disabled={!phone || isLoading}
        onPress={async () => {
          if (!phone) return;

          try {
            const response = await sendOTP({ phoneNumber: phone }).unwrap();
            if (response?.success) {
              router.push({ pathname: "/MobileOTPVerify", params: { phoneNumber: phone } });
            }
          } catch (error) {
            console.error("Send OTP error:", error);
            Alert.alert(
              "Failed to Send OTP",
              error?.data?.message || "Something went wrong. Please try again."
            );
          }
        }}
        style={[
          styles.nextButton,
          { backgroundColor: phone && !isLoading ? "#EF1C24" : "#403939" },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.nextText, { color: phone ? "#fff" : "#9D9494" }]}>
            Next
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EnterMobile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 28,
  },

  backButton: {
    marginTop: 20,
    marginBottom: 40,
  },

  heading: {
    color: "#fff",
    fontSize: 54,
    fontWeight: "700",
    lineHeight: 65,
    marginBottom: 55,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
   primaryButton: {
    height: 64,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(255, 91, 196, 0.35)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },

  countryContainer: {
    width: "30%",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#666",
    paddingBottom: 10,
  },

  countryText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "500",
  },

  phoneContainer: {
    width: "64%",
    borderBottomWidth: 2,
    borderBottomColor: "#666",
  },

  input: {
    color: "#fff",
    fontSize: 19,
    paddingBottom: 10,
  },

  description: {
    color: "#B8B8B8",
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 32,
  },

  nextButton: {
    position: "absolute",
    bottom: 35,
    left: 28,
    right: 28,
    height: 62,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },

  nextText: {
    fontSize: 24,
    fontWeight: "700",
  },
});

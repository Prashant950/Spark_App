import React, { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDispatch } from "react-redux";
import { useVerifyOTPMutation } from "../services/apiSlice";
import { setCredentials } from "../features/authSlice";

const MobileOTPVerify = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { phoneNumber } = useLocalSearchParams();
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();

  // State for 4 OTP digits
  const [otp, setOtp] = useState(["", "", "", ""]);
  
  // Timer State (60 seconds)
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // References for the 4 TextInput boxes
  const inputRefs = useRef([]);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle Digit Change & Auto Focus Next Box
  const handleChangeText = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto push to next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Dismiss keyboard when all 4 digits are entered
    if (text && index === 3 && newOtp.every((digit) => digit !== "")) {
      Keyboard.dismiss();
    }
  };

  // Handle Backspace / Delete
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move focus back to previous box if current box is empty
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  // Handle Resend Action
  const handleResend = () => {
    if (canResend) {
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  // Format Timer into mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isComplete = otp.every((digit) => digit !== "");

  const getNextOnboardingRoute = (step) => {
    const routeMap = {
      EMAIL_VERIFIED: "/Welcomepage",
      NAME_COMPLETED: "/EnterName",
      DOB_COMPLETED: "/EnterDOB",
      GENDER_COMPLETED: "/ChooseGender",
      SHOW_ME_COMPLETED: "/UserDetails/WhoInterested",
      DISTANCE_COMPLETED: "/UserDetails/DistancePreference",
      RELATIONSHIP_GOAL_COMPLETED: "/UserDetails/LookingRelationship",
      STUDYING_COMPLETED: "/UserDetails/StudyingPage",
      LIFESTYLE_COMPLETED: "/UserDetails/UsersFirstPageLifestyle",
      INTERESTS_COMPLETED: "/UserDetails/UsersSecondPageLifeStyle",
      ESSENTIALS_COMMUNICATION_STYLE_COMPLETED: "/UserDetails/AuthenticityAtracts/CommunicateStyleFirstPage",
      ESSENTIALS_COMMUNICATION_STYLE_COMPLETED2: "/UserDetails/AuthenticityAtracts/CommunicateSecondPage",
      ESSENTIALS_COMMUNICATION_STYLE_COMPLETED3: "/UserDetails/AuthenticityAtracts/ComunicateThirdPage",
      CREATIVITY_COMPLETED: "/UserDetails/UsersInterests10Pages/Creativity",
      PHOTOS_COMPLETED: "/UserDetails/UserPhoto",
      BIO_COMPLETED: "/UserDetails/UserEnterAbout",
      LOCATION_COMPLETED: "/UserDetails/UserEnableLocation",
      AVOID_SOMEONE_COMPLETED: "/UserDetails/AvoidSomeone",
      PROFILE_COMPLETE: "/(user)/swipe",
    };

    return routeMap[step] || "/Welcomepage";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/EnterMobile");
            }
          }}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={{ width: 40 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Verify your{"\n"}number</Text>

        {/* Number with Edit Icon */}
        <View style={styles.phoneContainer}>
          <Text style={styles.subtitle}>Enter the 4-digit code sent to </Text>
          <TouchableOpacity
            style={styles.numberWrapper}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.phoneNumber}>+91 ••••• ••123</Text>
            <MaterialIcons
              name="edit"
              size={16}
              color="#F06292"
              style={styles.editIcon}
            />
          </TouchableOpacity>
        </View>

        {/* 4-Digit OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxActive : null,
              ]}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              selectionColor="#F06292"
            />
          ))}
        </View>

        {/* Resend Code Timer */}
        <View style={styles.timerContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendActive}>Resend code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend code in{" "}
              <Text style={styles.timerBold}>{formatTime(timer)}</Text>
            </Text>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={isComplete && !isVerifying ? 0.85 : 1}
          disabled={!isComplete || isVerifying}
          onPress={async () => {
            if (!phoneNumber) {
              Alert.alert("Error", "Phone number missing. Please try again.");
              return;
            }

            try {
              const code = otp.join("");
              const response = await verifyOTP({ phoneNumber, otp: code }).unwrap();

              if (response?.success) {
                const nextStep = response?.user?.onboardingStep || "EMAIL_VERIFIED";
                const nextRoute = getNextOnboardingRoute(nextStep);

                console.log("Phone verify response:", response);
                console.log("Phone auth token:", response?.token ? response.token.slice(0, 20) + "..." : "missing");
                dispatch(setCredentials({ user: response.user, token: response.token }));
                await AsyncStorage.setItem("onboardingStep", nextStep);
                await AsyncStorage.setItem("lastVisitedRoute", nextRoute);
                router.replace(nextRoute);
              }
            } catch (error) {
              console.error("Phone OTP verify error:", error);
              Alert.alert(
                "Verification Failed",
                error?.data?.message || "Invalid or expired OTP. Please try again."
              );
            }
          }}
        >
          <LinearGradient
            colors={
              isComplete && !isVerifying
                ? ["#FF4081", "#7C4DFF"]
                : ["rgba(255, 64, 129, 0.35)", "rgba(124, 77, 255, 0.35)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Verify & Continue</Text>
                <Feather name="arrow-right" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MobileOTPVerify;

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

  // Content Body
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  phoneContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 36,
  },
  subtitle: {
    fontSize: 14,
    color: "#A1A1AA",
  },
  numberWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F06292",
  },
  editIcon: {
    marginLeft: 4,
  },

  // OTP Input Boxes
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  otpBox: {
    width: 58,
    height: 64,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  otpBoxActive: {
    borderColor: "#7C4DFF",
    backgroundColor: "rgba(124, 77, 255, 0.1)",
  },

  // Timer
  timerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    color: "#A1A1AA",
  },
  timerBold: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  resendActive: {
    fontSize: 14,
    color: "#F06292",
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  // Gradient Submit Button
  gradientButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
});
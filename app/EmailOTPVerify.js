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
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router"; // 👈 Updated Import
import { useDispatch } from "react-redux";
import {
  useVerifyEmailOTPMutation,
  useSendEmailOTPMutation,
} from "../services/apiSlice";
import { setCredentials } from "../features/authSlice";

const EmailOTPVerify = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // 1. Correct way to access email passed from previous screen
  const { email } = useLocalSearchParams();

  // 2. Updated State for 6 OTP digits matching backend
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Timer State (60 seconds)
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // RTK Query Mutations
  const [verifyEmailOTP, { isLoading: isVerifying }] = useVerifyEmailOTPMutation();
  const [sendEmailOTP, { isLoading: isResending }] = useSendEmailOTPMutation();

  // References for the 6 TextInput boxes
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

  // Handle Digit Entry & Auto Focus Next Box
  const handleChangeText = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Focus next box automatically for 6 digits (index 0 to 4)
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Dismiss keyboard when all 6 digits are filled
    if (text && index === 5 && newOtp.every((digit) => digit !== "")) {
      Keyboard.dismiss();
    }
  };

  // Handle Backspace / Delete
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  // Handle Resend Email OTP
  const handleResend = async () => {
    if (canResend && email) {
      try {
        const res = await sendEmailOTP({ email }).unwrap();
        if (res?.success) {
          Alert.alert("Success", "A new OTP has been sent to your email.");
          setTimer(60);
          setCanResend(false);
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }
      } catch (error) {
        Alert.alert(
          "Error",
          error?.data?.message || "Failed to resend OTP. Try again."
        );
      }
    }
  };

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

  // 3. Fixed Verification Handler
  const handleVerifyOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Email address missing. Please go back and try again.");
      return;
    }

    try {
      const code = otp.join("");
      const response = await verifyEmailOTP({
        email,
        otp: code,
      }).unwrap();

      if (response?.success) {
        const nextStep = response?.user?.onboardingStep || "EMAIL_VERIFIED";
        const nextRoute = getNextOnboardingRoute(nextStep);

        console.log("Email verify response:", response);
        console.log("Email auth token:", response?.token ? response.token.slice(0, 20) + "..." : "missing");
        dispatch(setCredentials({ user: response.user, token: response.token }));
        await AsyncStorage.setItem("onboardingStep", nextStep);
        await AsyncStorage.setItem("lastVisitedRoute", nextRoute);
        router.replace(nextRoute);
      } else {
        Alert.alert("Invalid OTP", "The code you entered is incorrect.");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Alert.alert(
        "Verification Failed",
        error?.data?.message || "Invalid or expired OTP. Please try again."
      );
    }
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
              router.replace("/EnterEmail");
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
        <Text style={styles.title}>Check your{"\n"}email</Text>

         <Text style={styles.subtitle}>
          {"We've sent a 6-digit verification code to your email address."}
        </Text>

        {/* 6-Digit OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
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
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              <Text style={styles.resendActive}>
                {isResending ? "Resending..." : "Resend code"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend code in <Text style={styles.timerHighlight}>{formatTime(timer)}</Text>
            </Text>
          )}
          <Text style={styles.didntReceiveText}>{"Didn't receive the code?"}</Text>
        </View>

        {/* Dynamic Gradient Verify Button */}
        <TouchableOpacity
          activeOpacity={isComplete && !isVerifying ? 0.85 : 1}
          disabled={!isComplete || isVerifying}
          style={styles.buttonWrapper}
          onPress={handleVerifyOTP}
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
              <Text
                style={[
                  styles.buttonText,
                  !isComplete && styles.buttonTextDisabled,
                ]}
              >
                Verify & Continue
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EmailOTPVerify;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0B14",
  },
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#A1A1AA",
    textAlign: "center",
    marginTop: 14,
    marginBottom: 36,
    lineHeight: 22,
  },
  emailHighlight: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // 6-Digit OTP Layout Adjustment
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8, // Reduced gap to cleanly fit 6 boxes on mobile screens
    marginBottom: 32,
  },
  otpBox: {
    width: 44, // Reduced width for 6 boxes
    height: 52,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  otpBoxFilled: {
    borderColor: "#F06292",
    backgroundColor: "rgba(240, 98, 146, 0.08)",
    elevation: 3,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  timerText: {
    fontSize: 15,
    color: "#F06292",
    fontWeight: "600",
  },
  timerHighlight: {
    color: "#F06292",
    fontWeight: "700",
  },
  resendActive: {
    fontSize: 15,
    color: "#F06292",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  didntReceiveText: {
    fontSize: 14,
    color: "#A1A1AA",
    marginTop: 8,
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
});
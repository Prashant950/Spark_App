import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useVerifyFaceStatusMutation } from "../../services/apiSlice";

const FaceVerification = () => {
  const router = useRouter();
  const cameraRef = useRef(null);

  useEffect(() => {
    AsyncStorage.setItem(
      "lastVisitedRoute",
      "/UserDetails/FaceVerification",
    ).catch(() => {});
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const [permission, requestPermission] = useCameraPermissions();
  const [verifying, setVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);

  const [faceVerified, setFaceVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const [verifyFaceStatus] = useVerifyFaceStatusMutation();

  // Back Button Navigation
  const handleBack = () => {
    router.back();
  };

  // Start Live Face Capture & Verification Simulation
  const handleVerifyFace = async () => {
    if (!cameraRef.current || verifying) return;

    try {
      setVerifying(true);

      // 1. Live Frame Capture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });

      // 2. Prepare Multipart FormData Payload for Android/iOS
      const formData = new FormData();
      const uri = photo.uri;
      const filename = uri.split("/").pop() || "live_selfie.jpg";

      formData.append("selfie", {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        name: filename,
        type: "image/jpeg",
      });

      // 3. API Call to Upload Selfie & Save in DB
      const response = await verifyFaceStatus(formData).unwrap();

      if (response?.success) {
        setVerifying(false);
        setVerificationDone(true);

        await AsyncStorage.setItem("onboardingStep", "PROFILE_COMPLETE");
        await AsyncStorage.setItem("isPhotoSelfiVerified", "true");
        await AsyncStorage.setItem("lastVisitedRoute", "/(user)/swipe");

        Alert.alert(
          "Verification Successful! 🎉",
          "Your selfie has been uploaded and verified.",
          [
            {
              text: "Continue to App",
              onPress: () => router.replace("/(user)/swipe"),
            },
          ],
        );
      }
    } catch (error) {
      console.error("Selfie Upload / Verification Error:", error);
      setVerifying(false);
      Alert.alert(
        "Verification Failed",
        error?.data?.message ||
          "Could not upload live selfie. Please try again.",
      );
    }
  };

  // Handle Camera Permission Loading State
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF4081" />
      </SafeAreaView>
    );
  }

  // Handle Camera Permission Denied State
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />
        <View style={styles.permissionContent}>
          <Ionicons name="camera-outline" size={64} color="#FF4081" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionSub}>
            Spark needs camera access to record a quick video selfie for your
            face verification badge.
          </Text>
          <TouchableOpacity activeOpacity={0.85} onPress={requestPermission}>
            <LinearGradient
              colors={["#FF4081", "#7C4DFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Grant Permission</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Face Check</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {/* Instruction Texts */}
        <Text style={styles.title}>Position your face in the frame</Text>
        <Text style={styles.subtitle}>
          Make sure your face is clearly visible and well-lit.
        </Text>

        {/* Camera Live Oval Viewfinder */}
        <View style={styles.cameraFrameWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.cameraView}
            facing="front"
            animateShutter={false}
          >
            {/* Oval Mask Overlay */}
            <View
              style={[
                styles.ovalOverlay,
                verificationDone && styles.ovalOverlaySuccess,
              ]}
            >
              {verifying && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF4081" />
                  <Text style={styles.loadingText}>Verifying Face...</Text>
                </View>
              )}

              {verificationDone && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={80}
                  color="#FF4081"
                />
              )}
            </View>
          </CameraView>
        </View>

        {/* Guideline Note */}
        <View style={styles.guidelineRow}>
          <Feather name="shield" size={16} color="#A1A1AA" />
          <Text style={styles.guidelineText}>
            This video selfie will not be shown on your public profile.
          </Text>
        </View>
      </View>

      {/* Bottom Sticky Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={verifying ? 1 : 0.85}
          disabled={verifying}
          onPress={handleVerifyFace}
        >
          <LinearGradient
            colors={
              verifying
                ? ["rgba(255, 64, 129, 0.5)", "rgba(124, 77, 255, 0.5)"]
                : ["#FF4081", "#7C4DFF"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>
              {verifying
                ? "Processing..."
                : verificationDone
                  ? "Verified ✓"
                  : "I'm Ready"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FaceVerification;

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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Content Area
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#A1A1AA",
    textAlign: "center",
    marginBottom: 28,
  },

  // Camera Viewfinder
  cameraFrameWrapper: {
    width: 260,
    height: 340,
    borderRadius: 130,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FF4081",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  cameraView: {
    width: "100%",
    height: "100%",
  },
  ovalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  ovalOverlaySuccess: {
    backgroundColor: "rgba(13, 11, 20, 0.75)",
  },

  loadingContainer: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    borderRadius: 12,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
  },

  // Guideline Note
  guidelineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    paddingHorizontal: 12,
  },
  guidelineText: {
    fontSize: 13,
    color: "#A1A1AA",
    marginLeft: 8,
    textAlign: "center",
  },

  // Permission Screen
  permissionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 20,
    marginBottom: 10,
  },
  permissionSub: {
    fontSize: 14,
    color: "#A1A1AA",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },

  // Sticky Bottom Footer
  footer: {
    paddingHorizontal: 24,
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
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

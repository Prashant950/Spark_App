import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
    Keyboard,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpdateDistancePreferenceMutation } from "../../services/apiSlice";

const DistancePreference = () => {
  const router = useRouter();

  // Distance state defaulted to 80 km (Min: 2 km, Max: 100 km)
  const [distance, setDistance] = useState(80);
  const [loading, setLoading] = useState(false);
  const [updateDistancePreference] = useUpdateDistancePreferenceMutation();

  // Back Button Navigation
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
    AsyncStorage.setItem("lastVisitedRoute", "/UserDetails/DistancePreference").catch(() => {});
  }, []);

  // Next Screen Navigation
 const handleSubmitDistancePreference = async () => {
    setLoading(true);
    try {
      const payload = {
        distancePreference: Number(distance),
      };

      const response = await updateDistancePreference(payload).unwrap();
      if (response?.success) {
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "DISTANCE_COMPLETED"
        );
        router.replace("/UserDetails/LookingRelationship");
      }
    } catch (error) {
      console.error("Error updating distance preference:", error);
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

        {/* Top Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: "80%" }]} />
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your distance{"\n"}preference?</Text>
        <Text style={styles.subtitle}>
          Use the slider to set the maximum distance you would like potential
          matches to be located.
        </Text>

        {/* Distance Value Header */}
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderLabel}>Distance preference</Text>
          <Text style={styles.sliderValue}>{distance} km</Text>
        </View>

        {/* Interactive Distance Slider */}
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={2}
            maximumValue={100}
            step={1}
            value={distance}
            onValueChange={(val) => setDistance(val)}
            minimumTrackTintColor="#FF4081"
            maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
            thumbTintColor="#FF4081"
          />
        </View>
      </ScrollView>

      {/* Footer Area */}
      <View style={styles.footer}>
        <Text style={styles.footerDisclaimer}>
          You can change preferences later in Settings
        </Text>

        {/* Gradient Next Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmitDistancePreference}
        >
          <LinearGradient
            colors={["#FF4081", "#7C4DFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Next</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DistancePreference;

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

  // Scroll Content
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
  },
  subtitle: {
    fontSize: 15,
    color: "#A1A1AA",
    marginTop: 14,
    marginBottom: 44,
    lineHeight: 22,
  },

  // Slider Header Row
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Slider Container
  sliderContainer: {
    width: "100%",
    justifyContent: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },

  // Footer Section
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: "#0D0B14",
  },
  footerDisclaimer: {
    fontSize: 14,
    color: "#A1A1AA",
    textAlign: "center",
    marginBottom: 18,
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

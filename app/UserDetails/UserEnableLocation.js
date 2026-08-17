import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUpdateLocationMutation } from "../../services/apiSlice";

const UserEnableLocation = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);

  const [updateLocation] = useUpdateLocationMutation();

  useEffect(() => {
    AsyncStorage.setItem(
      "lastVisitedRoute",
      "/UserDetails/UserEnableLocation",
    ).catch(() => {});
  }, []);

  // Handle Requesting Location Permission & Saving to Database

  // const handleAllowLocation = async () => {
  //   try {
  //     setLoading(true);

  //     // 1. Device ka System GPS Switch Check Karein
  //     let isGpsEnabled = await Location.hasServicesEnabledAsync();

  //     if (!isGpsEnabled) {
  //       // Android par automatic 'Turn On Location' system dialog pop-up open karega
  //       if (Platform.OS === "android") {
  //         try {
  //           await Location.enableNetworkProviderAsync();
  //           isGpsEnabled = await Location.hasServicesEnabledAsync();
  //         } catch (e) {
  //           console.warn("User rejected turning on GPS dialog",e);
  //         }
  //       }

  //       if (!isGpsEnabled) {
  //         Alert.alert(
  //           "GPS Disabled",
  //           "Aapke phone ki Location/GPS band hai. Kripya control center se Location ON karein."
  //         );
  //         setLoading(false);
  //         return;
  //       }
  //     }

  //     // 2. App Level Permission Ask / Check
  //     const { status } = await Location.requestForegroundPermissionsAsync();

  //     if (status !== "granted") {
  //       Alert.alert(
  //         "Permission Required",
  //         "Spark app ko matches dikhane ke liye location ki zarurat hai."
  //       );
  //       setLoading(false);
  //       return;
  //     }

  //     // 3. Position Get Karein (Low Accuracy se quick response milta hai)
  //     const userLocation = await Location.getCurrentPositionAsync({
  //       accuracy: Location.Accuracy.Balanced,
  //     });

  //     const lat = userLocation.coords.latitude;
  //     const lng = userLocation.coords.longitude;

  //     // 4. Save to Backend DB
  //     const response = await updateLocation({
  //       latitude: lat,
  //       longitude: lng,
  //     }).unwrap();

  //     if (response?.success) {
  //       await AsyncStorage.setItem("onboardingStep", "LOCATION_COMPLETED");
  //       router.push("/UserDetails/AvoidSomeone");
  //     }
  //   } catch (error) {
  //     console.error("Error enabling location:", error);
  //     Alert.alert(
  //       "Location Error",
  //       "Current location nahi mil saki. Kripya check karein ki GPS ON hai."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleAllowLocation = async () => {
    try {
      setLoading(true);

      // 1. App Level Permission Maangein / Check Karein
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Spark ko aapke aas-paas ke matches dikhane ke liye location permission chahiye.",
        );
        setLoading(false);
        return;
      }

      // 2. Check karein ki Phone ka main GPS Switch ON hai ya OFF
      let isGpsEnabled = await Location.hasServicesEnabledAsync();

      if (!isGpsEnabled) {
        // Android par ye system dialog pop-up open karega: "Turn ON Location Services"
        if (Platform.OS === "android") {
          try {
            await Location.enableNetworkProviderAsync();
            // Re-check system GPS status after dialog interaction
            isGpsEnabled = await Location.hasServicesEnabledAsync();
          } catch (e) {
            console.warn("User dismissed location enable prompt", e);
          }
        }

        if (!isGpsEnabled) {
          Alert.alert(
            "GPS Disabled",
            "Your phone’s main Location/GPS switch is turned off please ON, OR again Click Enable Button.",
          );
          setLoading(false);
          return;
        }
      }

      // 3. Location Fetch Karein (Balanced Accuracy & Fallback to Last Known)
      let lat, lng;
      try {
        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = userLocation.coords.latitude;
        lng = userLocation.coords.longitude;
      } catch (fetchErr) {
        console.error("Error fetching current location:", fetchErr);
        // Agar current position milne me timeout ho, toh Last Known Position use karein
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          lat = lastKnown.coords.latitude;
          lng = lastKnown.coords.longitude;
        } else {
          throw new Error("Could not fix location coordinates.");
        }
      }

      // 4. Save Location to Database via RTK Query Mutation
      const response = await updateLocation({
        latitude: lat,
        longitude: lng,
      }).unwrap();

      if (response?.success) {
        const onboardingStep = await AsyncStorage.getItem("onboardingStep");
        const isPhotoSelfiVerified = await AsyncStorage.getItem(
          "isPhotoSelfiVerified",
        );
        router.push("/UserDetails/AvoidSomeone");

        if (
          onboardingStep === "PROFILE_COMPLETE" ||
          isPhotoSelfiVerified === "true"
        ) {
          await AsyncStorage.setItem("onboardingStep", "PROFILE_COMPLETE");
          router.replace("/(user)/swipe");
        } else {
          // Agar baki onboarding step baaki hain
          await AsyncStorage.setItem("onboardingStep", "LOCATION_COMPLETED");
          router.push("/UserDetails/AvoidSomeone");
        }
      }
    } catch (error) {
      console.error("Error enabling location:", error);
      Alert.alert(
        "Location Error",
        "Current location fetch nahi ho saki. Kripya check karein ki GPS Switch ON hai.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHowLocationUsed = () => {
    Alert.alert(
      "Location Privacy",
      "We use your precise location to show potential matches near you and filter distance preferences. Your exact address is never shared.",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Main Container Content */}
      <View style={styles.content}>
        {/* Text Header */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>So, are you from around{"\n"}here?</Text>
          <Text style={styles.subtitle}>
            {
              "Set your location to see who's in your area or beyond. You won't be able to match with people otherwise."
            }
          </Text>
        </View>

        {/* Center Illustration Circle */}
        <View style={styles.illustrationContainer}>
          <View style={styles.outerCircle}>
            <Ionicons name="location-sharp" size={48} color="#FF4081" />
          </View>
        </View>

        {/* Bottom Actions Area */}
        <View style={styles.footer}>
          {/* Gradient Allow Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleAllowLocation}
            disabled={loading}
          >
            <LinearGradient
              colors={["#FF4081", "#7C4DFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>
                {loading ? "Enabling..." : "Allow"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Privacy Link Trigger */}
          <TouchableOpacity
            onPress={handleHowLocationUsed}
            activeOpacity={0.7}
            style={styles.infoRow}
          >
            <Text style={styles.infoText}>How is my location{"\n"}used?</Text>
            <Feather
              name="arrow-down"
              size={18}
              color="#FFFFFF"
              style={styles.infoIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UserEnableLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0B14",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 24,
  },

  // Header Texts
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 34,
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
    marginTop: 16,
    lineHeight: 22,
  },

  // Center Illustration
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  outerCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#F3F4F6", // Light circle background from design
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },

  // Bottom Actions
  footer: {
    width: "100%",
  },
  gradientButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 28,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  // How Location Used Row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
  },
  infoIcon: {
    marginLeft: 8,
  },
});

import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  Platform,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useUploadUserPhotosMutation } from "../../services/apiSlice";

const MAX_PHOTOS = 15;
const MIN_PHOTOS_REQUIRED = 7;

const UserPhoto = () => {
  const router = useRouter();

  // Stores array of image URIs or null for empty slots
  const [photos, setPhotos] = useState(Array(MAX_PHOTOS).fill(null));

  const [uploadUserPhotos, { isLoading }] = useUploadUserPhotosMutation();

  // Count uploaded photos
  const uploadedCount = photos.filter((photo) => photo !== null).length;
  const isFormValid = uploadedCount >= MIN_PHOTOS_REQUIRED;

  // Pick Image Function
  const handlePickImage = async (index) => {
    // Request Media Permissions
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please grant gallery permissions to upload your profile photos.",
      );
      return;
    }

    // Launch Image Library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newPhotos = [...photos];
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  // Remove Photo Function
  const handleRemoveImage = (index) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

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
    AsyncStorage.setItem("lastVisitedRoute", "/UserDetails/UserPhoto").catch(
      () => {},
    );
  }, []);

  // Next Navigation
  const handleNext = async () => {
    if (!isFormValid || isLoading) return;

    try {
      // 1. Valid URIs Filter karein
      const selectedPhotos = photos.filter((p) => p !== null);

      // 2. React Native Compatible Multipart FormData Payload
      const formData = new FormData();

      selectedPhotos.forEach((uri, index) => {
        // Clean URI logic for Android and iOS
        let fileUri = uri;

        if (Platform.OS === "ios") {
          // iOS ke liye path clean karein (file:// replace aur space encoding fix)
          fileUri = uri.replace("file://", "");
        }

        // Extension and Filename extraction
        const filename = uri.split("/").pop() || `photo_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1].toLowerCase() : "jpg";

        // Precise MIME type mapping for iOS / Android image uploaders
        let mimeType = "image/jpeg";
        if (ext === "png") mimeType = "image/png";
        else if (ext === "webp") mimeType = "image/webp";
        else if (ext === "heic" || ext === "heif") mimeType = "image/heic"; // iOS Camera native format

        // Append file object into FormData
        formData.append("photos", {
          uri: Platform.OS === "android" ? fileUri : `file://${fileUri}`, // iOS requires file:// prefix restored in object
          name: filename,
          type: mimeType,
        });
      });

      // 3. API Call via RTK Query
      const response = await uploadUserPhotos(formData).unwrap();

      if (response?.success) {
        // AsyncStorage Update
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "PHOTOS_COMPLETED",
        );

        // Navigate to Bio / About Screen
        router.push("/UserDetails/UserEnterAbout");
      }
    } catch (error) {
      console.error("Cross-Platform Photo Upload Error:", error);
      Alert.alert(
        "Upload Error",
        error?.data?.message || "Failed to upload photos. Please try again.",
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
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Top Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: "100%" }]} />
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Add your recent{"\n"}pics</Text>
        <Text style={styles.subtitle}>
          Upload {MIN_PHOTOS_REQUIRED} photos to start. Add more to make your
          profile stand out.
        </Text>

        {/* 3-Column Image Grid */}
        <View style={styles.gridContainer}>
          {photos.map((photoUri, index) => {
            const hasPhoto = photoUri !== null;

            return (
              <View key={index} style={styles.cardWrapper}>
                {hasPhoto ? (
                  // Uploaded Image Card
                  <View style={styles.photoCard}>
                    <Image
                      source={{ uri: photoUri }}
                      style={styles.photoImage}
                    />

                    {/* Delete 'X' Button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleRemoveImage(index)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Empty Upload Slot Card
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handlePickImage(index)}
                    style={styles.emptyCard}
                  >
                    <View style={styles.addIconCircle}>
                      <Ionicons name="add" size={24} color="#FF4081" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Gradient Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={isFormValid ? 0.85 : 1}
          disabled={!isFormValid}
        >
          <LinearGradient
            colors={
              isFormValid
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
                !isFormValid && styles.buttonTextDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                `Next (${uploadedCount}/${MIN_PHOTOS_REQUIRED})`
              )}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UserPhoto;

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

  // Scroll Content Body
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
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
    marginTop: 12,
    marginBottom: 28,
    lineHeight: 22,
  },

  // Grid Layout (3 Columns)
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },
  cardWrapper: {
    width: "31%", // 3 items per row
    aspectRatio: 3 / 4, // Modern vertical photo ratio
  },

  // Uploaded Photo Card
  photoCard: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "visible",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    resizeMode: "cover",
  },

  // Top-Right 'X' Delete Button
  deleteButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#000000",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 4,
  },

  // Empty Slot Card
  emptyCard: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 64, 129, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Sticky Bottom Footer
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

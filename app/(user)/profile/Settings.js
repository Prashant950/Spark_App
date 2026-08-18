import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} from "../../../services/apiSlice";

export default function SettingsScreen() {
  const router = useRouter();

  const [globalDiscovery, setGlobalDiscovery] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);
  const [distanceUnit, setDistanceUnit] = useState("Km");
  const [phone, setPhone] = useState("919616964306");
  const [locationStr, setLocationStr] = useState("Bengaluru, India");

  const { data: profileData } = useGetMyProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();
  const [deleteAccountApi] = useDeleteAccountMutation();

  useEffect(() => {
    if (profileData) {
      const user = profileData.profile || profileData.user || {};
      if (user.phone) setPhone(user.phone);
      if (user.location?.city) {
        setLocationStr(`${user.location.city}, ${user.location.country || "India"}`);
      }
      if (user.discoverySettings) {
        setGlobalDiscovery(user.discoverySettings.global ?? false);
        setMaxDistance(user.discoverySettings.maxDistance || 50);
        setDistanceUnit(user.discoverySettings.distanceUnit || "Km");
      }
    }
  }, [profileData]);

  // Sync settings when slider/toggle changes
  const saveDiscoverySettings = async (settings) => {
    try {
      await updateProfile({
        discoverySettings: {
          global: settings.global ?? globalDiscovery,
          maxDistance: settings.distance ?? maxDistance,
          distanceUnit: settings.unit ?? distanceUnit,
        },
      }).unwrap();
    } catch (_err) {
      console.error("Failed to sync settings.");
    }
  };

  // 🟢 Real Logout Handler: Clears token & storage, then redirects to login
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove([
              "token",
              "user",
              "role",
              "onboardingStep",
              "lastVisitedRoute",
            ]);
            router.replace("/login");
          } catch (_err) {
            router.replace("/login");
          }
        },
      },
    ]);
  };

  // 🟢 Real Account Deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccountApi().unwrap();
              await AsyncStorage.clear();
              router.replace("/login");
            } catch (_err) {
              await AsyncStorage.clear();
              router.replace("/login");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subscription Badges Banner */}
        <View style={styles.plansSection}>
          <TouchableOpacity style={styles.planBadgeCard} activeOpacity={0.8}>
            <Text style={styles.planTitle}>SPARK PLATINUM</Text>
            <Text style={styles.planSub}>Priority Likes, see who Likes You, and more</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.planBadgeCard} activeOpacity={0.8}>
            <Text style={[styles.planTitle, { color: "#FFD700" }]}>SPARK GOLD</Text>
            <Text style={styles.planSub}>See who Likes You & more!</Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <Text style={styles.groupHeader}>Account settings</Text>
        <View style={styles.groupCard}>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Phone Number</Text>
            <Text style={styles.settingValue}>{phone} ›</Text>
          </TouchableOpacity>
        </View>

        {/* Discovery Settings */}
        <Text style={styles.groupHeader}>Discovery Settings</Text>
        <View style={styles.groupCard}>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Location</Text>
            <Text style={styles.settingValue}>{locationStr} ›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Global</Text>
              <Text style={styles.settingSubText}>
                Going global will allow you to see people nearby and from around the world.
              </Text>
            </View>
            <Switch
              value={globalDiscovery}
              onValueChange={(val) => {
                setGlobalDiscovery(val);
                saveDiscoverySettings({ global: val });
              }}
              trackColor={{ false: "#3A3A3C", true: "#FF4081" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          {/* Distance Slider */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeaderRow}>
              <Text style={styles.settingLabel}>Maximum distance</Text>
              <Text style={styles.sliderValueText}>
                {maxDistance}{distanceUnit.toLowerCase()}.
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={2}
              maximumValue={100}
              step={1}
              value={maxDistance}
              onValueChange={(val) => setMaxDistance(val)}
              onSlidingComplete={(val) => saveDiscoverySettings({ distance: val })}
              minimumTrackTintColor="#FF4081"
              maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
              thumbTintColor="#FF4081"
            />
          </View>
        </View>

        {/* Distance Unit Segment Toggle */}
        <Text style={styles.groupHeader}>Show Distances in</Text>
        <View style={styles.unitToggleRow}>
          <TouchableOpacity
            style={[styles.unitBtn, distanceUnit === "Km" && styles.unitBtnActive]}
            onPress={() => {
              setDistanceUnit("Km");
              saveDiscoverySettings({ unit: "Km" });
            }}
          >
            <Text style={styles.unitBtnText}>Km.</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitBtn, distanceUnit === "Mi" && styles.unitBtnActive]}
            onPress={() => {
              setDistanceUnit("Mi");
              saveDiscoverySettings({ unit: "Mi" });
            }}
          >
            <Text style={styles.unitBtnText}>Mi.</Text>
          </TouchableOpacity>
        </View>

        {/* Logout & Delete Actions */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0B14" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  plansSection: { gap: 12, marginVertical: 16 },
  planBadgeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  planTitle: { fontSize: 16, fontWeight: "900", color: "#FFFFFF", letterSpacing: 1 },
  planSub: { fontSize: 13, color: "#A1A1AA", marginTop: 4 },
  groupHeader: { fontSize: 14, fontWeight: "700", color: "#8E8E93", marginTop: 20, marginBottom: 8, paddingLeft: 4 },
  groupCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  settingLabel: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  settingValue: { fontSize: 15, color: "#8E8E93", fontWeight: "600" },
  settingSubText: { fontSize: 12, color: "#8E8E93", marginTop: 4, lineHeight: 16 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  divider: { height: 1, backgroundColor: "rgba(255, 255, 255, 0.08)", marginVertical: 14 },
  sliderContainer: { marginTop: 4 },
  sliderHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  sliderValueText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  slider: { width: "100%", height: 30 },
  unitToggleRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 18,
    padding: 4,
    marginBottom: 28,
  },
  unitBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 14 },
  unitBtnActive: { backgroundColor: "#FF2A55" },
  unitBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  actionBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 40,
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  deleteText: { fontSize: 16, fontWeight: "700", color: "#FF5252" },
});
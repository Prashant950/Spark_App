import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGetMyProfileQuery } from "../../../services/apiSlice";

const { height } = Dimensions.get("window");

export default function ProfileIndexScreen() {
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);
  const [isBoostsModalOpen, setIsBoostsModalOpen] = useState(false);

  // Fetch real user data from backend
  const { data: profileData, isLoading, refetch } = useGetMyProfileQuery();
  const user = profileData?.profile || profileData?.user || {};

  const photos = user.photos || [];
  const primaryPhoto =
    photos[0]?.url ||
    (typeof photos[0] === "string" ? photos[0] : null) ||
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop";

  const getAge = (dateVal) => {
    if (!dateVal) return 24;
    const birth = new Date(dateVal);
    if (isNaN(birth.getTime())) return 24;
    const ageDiff = Date.now() - birth.getTime();
    return Math.abs(new Date(ageDiff).getUTCFullYear() - 1970) || 24;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#FF4081" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfoRow}
          activeOpacity={0.8}
          onPress={() => setIsPreviewOpen(true)}
        >
          <Image source={{ uri: primaryPhoto }} style={styles.avatarImage} />
          <Text style={styles.userName}>{user.fullName || user.name || "Prashant"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsButton}
          activeOpacity={0.7}
          onPress={() => router.push("/(user)/profile/Settings")}
        >
          <Feather name="settings" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editProfileBtn}
          activeOpacity={0.8}
          onPress={() => router.push("/(user)/profile/EditProfile")}
        >
          <Text style={styles.editProfileText}>Edit profile</Text>
        </TouchableOpacity>

        {/* Completion Progress Bar */}
        <View style={styles.progressMeterContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "77%" }]} />
          </View>
          <Text style={styles.progressPercentText}>77%</Text>
        </View>
        <Text style={styles.completionSubtitle}>
          Complete your profile to be seen by more people!
        </Text>

        {/* Recommendation Cards */}
        <View style={styles.cardSection}>
          <TouchableOpacity
            style={styles.recommendCard}
            activeOpacity={0.8}
            onPress={() => setVerifyStep(1)}
          >
            <Ionicons name="shield-checkmark" size={26} color="#FF4081" />
            <View style={styles.recommendTextContainer}>
              <Text style={styles.recommendTitle}>Get verified</Text>
              <Text style={styles.recommendSub}>{"Verify your profile to build trust with others."}</Text>
            </View>
            <View style={styles.radioDotCircle} />
          </TouchableOpacity>
        </View>

        {/* Quick Action Circles */}
        <View style={styles.quickActionsRow}>
          {/* Super Likes */}
          <TouchableOpacity
            style={styles.actionCircleWrapper}
            activeOpacity={0.8}
            onPress={() => router.push("/(user)/profile/SuperLikes")}
          >
            <View style={styles.actionCircle}>
              <FontAwesome name="star" size={22} color="#00E5FF" />
            </View>
            <Text style={styles.actionTitle}>0 Super Likes</Text>
            <Text style={styles.actionSub}>Get more</Text>
            <View style={styles.plusIconBadge}>
              <Ionicons name="add" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* My Boosts */}
          <TouchableOpacity
            style={styles.actionCircleWrapper}
            activeOpacity={0.8}
            onPress={() => setIsBoostsModalOpen(true)}
          >
            <View style={styles.actionCircle}>
              <Ionicons name="flash" size={22} color="#E040FB" />
            </View>
            <Text style={styles.actionTitle}>My Boosts</Text>
            <Text style={styles.actionSub}>Get more</Text>
            <View style={styles.plusIconBadge}>
              <Ionicons name="add" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Subscriptions */}
          <TouchableOpacity
            style={styles.actionCircleWrapper}
            activeOpacity={0.8}
            onPress={() => router.push("/(user)/profile/Subscriptions")}
          >
            <View style={styles.actionCircle}>
              <MaterialCommunityIcons name="fire" size={24} color="#FF2A55" />
            </View>
            <Text style={styles.actionTitle}>Subscriptions</Text>
            <View style={styles.plusIconBadge}>
              <Ionicons name="add" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Spark Gold Upgrade Banner */}
        <TouchableOpacity
          style={styles.upgradeBanner}
          activeOpacity={0.85}
          onPress={() => router.push("/(user)/profile/Subscriptions")}
        >
          <View style={styles.bannerTopRow}>
            <View style={styles.brandBadgeRow}>
              <Text style={styles.brandText}>SPARK</Text>
              <View style={styles.goldBadge}>
                <Text style={styles.goldBadgeText}>GOLD</Text>
              </View>
            </View>
            <View style={styles.upgradeBtn}>
              <Text style={styles.upgradeBtnText}>UPGRADE</Text>
            </View>
          </View>

          <View style={styles.featureList}>
            <View style={styles.featureRowHeader}>
              <Text style={styles.featureHeaderTitle}>{"What's Included"}</Text>
              <View style={styles.columnHeaderRow}>
                <Text style={styles.colLabel}>Free</Text>
                <Text style={styles.colLabelGold}>Gold</Text>
              </View>
            </View>
            <View style={styles.featureItemRow}>
              <Text style={styles.featureName}>See Who Likes You</Text>
              <View style={styles.iconsPair}>
                <Feather name="lock" size={14} color="#8E8E93" />
                <Feather name="check" size={16} color="#FFD700" />
              </View>
            </View>
            <View style={styles.featureItemRow}>
              <Text style={styles.featureName}>Top Picks</Text>
              <View style={styles.iconsPair}>
                <Feather name="lock" size={14} color="#8E8E93" />
                <Feather name="check" size={16} color="#FFD700" />
              </View>
            </View>
          </View>
          <Text style={styles.seeAllFeaturesText}>See All Features</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FULL PROFILE PREVIEW OVERLAY MODAL */}
      <Modal visible={isPreviewOpen} animationType="slide" onRequestClose={() => setIsPreviewOpen(false)}>
        <SafeAreaView style={styles.modalDarkContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Photo */}
            <View style={styles.previewPhotoWrapper}>
              <Image source={{ uri: primaryPhoto }} style={styles.previewImage} />
              <View style={styles.previewOverlay}>
                <Text style={styles.previewNameText}>
                  {user.fullName || "User"} {getAge(user.birthDate || user.dob)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.downArrowBtn}
                onPress={() => setIsPreviewOpen(false)}
                activeOpacity={0.8}
              >
                <Feather name="arrow-down" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Profile Info Details */}
            <View style={styles.previewDetailsContainer}>
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Looking for</Text>
                <Text style={styles.previewSectionValue}>
                  👁️ {user.relationshipGoal || user.lookingFor || "Long-term partner"}
                </Text>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>About me</Text>
                <Text style={styles.previewSectionValue}>{user.bio || "Hello"}</Text>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Essentials</Text>
                <Text style={styles.previewSectionValue}>📍 {user.location?.city || "Less than a mile away"}</Text>
                <Text style={styles.previewSectionValue}>👤 {user.gender || "Man"}</Text>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Lifestyle</Text>
                <Text style={styles.previewSectionValue}>🏋️ {user.lifestyle?.workout || "Every day"}</Text>
                <Text style={styles.previewSectionValue}>🍷 {user.lifestyle?.drinking || "Sober curious"}</Text>
                <Text style={styles.previewSectionValue}>🐶 {user.lifestyle?.pets || "Dog"}</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* VERIFICATION POPUP 1 */}
      <Modal visible={verifyStep === 1} transparent animationType="fade">
        <View style={styles.popupBackdrop}>
          <View style={styles.popupCard}>
            <MaterialCommunityIcons name="decagram" size={60} color="#00E5FF" />
            <Text style={styles.popupTitle}>Get photo verified</Text>
            <Text style={styles.popupSub}>
              {" Confirm that you're the person in your photos with a facial scan to receive a special badge."}
            </Text>
            <TouchableOpacity style={styles.popupPrimaryBtn} onPress={() => setVerifyStep(2)}>
              <Text style={styles.popupPrimaryText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupSecondaryBtn} onPress={() => setVerifyStep(0)}>
              <Text style={styles.popupSecondaryText}>No Thanks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VERIFICATION POPUP 2 */}
      <Modal visible={verifyStep === 2} transparent animationType="fade">
        <View style={styles.popupBackdrop}>
          <View style={styles.popupCard}>
            <Ionicons name="checkmark-circle" size={54} color="#00E5FF" />
            <Text style={styles.popupTitle}>How it works</Text>
            <Text style={styles.popupSub}>
              Our tech compares the face geometry in your video selfie to the faces in your profile pics.
            </Text>
            <TouchableOpacity style={styles.popupPrimaryBtn} onPress={() => setVerifyStep(3)}>
              <Text style={styles.popupPrimaryText}>I understand</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupSecondaryBtn} onPress={() => setVerifyStep(0)}>
              <Text style={styles.popupSecondaryText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VERIFICATION POPUP 3 */}
      <Modal visible={verifyStep === 3} transparent animationType="fade">
        <View style={styles.popupBackdrop}>
          <View style={styles.popupCard}>
            <Ionicons name="shield-checkmark" size={54} color="#00E5FF" />
            <Text style={styles.popupTitle}>How can I unverify?</Text>
            <Text style={styles.popupSub}>
              If you wish to remove your photo verified badge, you may do so in Settings.
            </Text>
            <TouchableOpacity
              style={styles.popupPrimaryBtn}
              onPress={() => {
                setVerifyStep(0);
                router.push("UserDetails/FaceVerification");
              }}
            >
              <Text style={styles.popupPrimaryText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupSecondaryBtn} onPress={() => setVerifyStep(0)}>
              <Text style={styles.popupSecondaryText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MY BOOSTS DRAWER */}
      <Modal visible={isBoostsModalOpen} transparent animationType="slide">
        <TouchableOpacity
          style={styles.drawerBackdrop}
          activeOpacity={1}
          onPress={() => setIsBoostsModalOpen(false)}
        >
          <View style={styles.drawerCard}>
            <View style={styles.drawerHeaderRow}>
              <Text style={styles.drawerTitle}>My Boosts</Text>
              <TouchableOpacity onPress={() => setIsBoostsModalOpen(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.drawerSub}>
              Be a top profile in your area for 30 minutes to get more matches
            </Text>

            <TouchableOpacity
              style={styles.drawerOptionRow}
              onPress={() => {
                setIsBoostsModalOpen(false);
                router.push("/(user)/profile/Boosts");
              }}
            >
              <Ionicons name="flash" size={22} color="#E040FB" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.drawerOptionTitle}>Boosts</Text>
                <Text style={styles.drawerOptionSub}>0 left</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  userInfoRow: { flexDirection: "row", alignItems: "center" },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: "#FF4081",
  },
  userName: { fontSize: 22, fontWeight: "900", color: "#FFFFFF" },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  editProfileBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  editProfileText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  progressMeterContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#FF2A55", borderRadius: 3 },
  progressPercentText: { fontSize: 14, fontWeight: "800", color: "#FF2A55" },
  completionSubtitle: { fontSize: 14, color: "#A1A1AA", marginTop: 8, marginBottom: 24 },
  cardSection: { gap: 12, marginBottom: 28 },
  recommendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  recommendTextContainer: { flex: 1, marginLeft: 14, paddingRight: 8 },
  recommendTitle: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  recommendSub: { fontSize: 13, color: "#A1A1AA", marginTop: 2 },
  radioDotCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "rgba(255, 255, 255, 0.3)" },
  quickActionsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  actionCircleWrapper: { width: "30%", alignItems: "center", position: "relative" },
  actionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionTitle: { fontSize: 13, fontWeight: "700", color: "#FFFFFF", textAlign: "center" },
  actionSub: { fontSize: 11, color: "#A1A1AA", marginTop: 2 },
  plusIconBadge: {
    position: "absolute",
    top: -2,
    right: 18,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0D0B14",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeBanner: { backgroundColor: "#161320", borderRadius: 22, padding: 18, borderWidth: 1.5, borderColor: "#FFD700", marginBottom: 60 },
  bannerTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  brandBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandText: { fontSize: 22, fontWeight: "900", color: "#FFFFFF", letterSpacing: 1 },
  goldBadge: { backgroundColor: "#FFD700", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  goldBadgeText: { fontSize: 10, fontWeight: "900", color: "#000000" },
  upgradeBtn: { backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  upgradeBtnText: { fontSize: 12, fontWeight: "800", color: "#000000" },
  featureList: { borderTopWidth: 1, borderTopColor: "rgba(255, 255, 255, 0.1)", paddingTop: 14 },
  featureRowHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  featureHeaderTitle: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
  columnHeaderRow: { flexDirection: "row", gap: 16 },
  colLabel: { fontSize: 12, fontWeight: "700", color: "#8E8E93" },
  colLabelGold: { fontSize: 12, fontWeight: "800", color: "#FFD700" },
  featureItemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 6 },
  featureName: { fontSize: 14, color: "#FFFFFF", fontWeight: "600" },
  iconsPair: { flexDirection: "row", alignItems: "center", gap: 22 },
  seeAllFeaturesText: { fontSize: 14, fontWeight: "800", color: "#FFD700", textAlign: "center", marginTop: 14 },

  modalDarkContainer: { flex: 1, backgroundColor: "#0D0B14" },
  previewPhotoWrapper: { width: "100%", height: height * 0.6, position: "relative" },
  previewImage: { width: "100%", height: "100%" },
  previewOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: "rgba(0,0,0,0.4)" },
  previewNameText: { fontSize: 32, fontWeight: "900", color: "#FFFFFF" },
  downArrowBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewDetailsContainer: { padding: 20 },
  previewSection: { marginBottom: 20 },
  previewSectionTitle: { fontSize: 16, fontWeight: "800", color: "#8E8E93", marginBottom: 6 },
  previewSectionValue: { fontSize: 16, color: "#FFFFFF", fontWeight: "600", marginVertical: 2 },

  popupBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 24 },
  popupCard: { backgroundColor: "#1C1C1E", borderRadius: 24, padding: 24, width: "100%", alignItems: "center" },
  popupTitle: { fontSize: 22, fontWeight: "900", color: "#FFFFFF", marginTop: 14, marginBottom: 8 },
  popupSub: { fontSize: 14, color: "#A1A1AA", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  popupPrimaryBtn: { width: "100%", height: 50, backgroundColor: "#FFFFFF", borderRadius: 25, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  popupPrimaryText: { color: "#000000", fontSize: 16, fontWeight: "800" },
  popupSecondaryBtn: { width: "100%", height: 44, justifyContent: "center", alignItems: "center" },
  popupSecondaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  drawerBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  drawerCard: { backgroundColor: "#1C1C1E", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 40 },
  drawerHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  drawerTitle: { fontSize: 20, fontWeight: "900", color: "#FFFFFF" },
  drawerSub: { fontSize: 14, color: "#A1A1AA", marginTop: 6, marginBottom: 20 },
  drawerOptionRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 16 },
  drawerOptionTitle: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  drawerOptionSub: { fontSize: 13, color: "#A1A1AA", marginTop: 2 },
});
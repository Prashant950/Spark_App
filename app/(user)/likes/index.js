import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FontAwesome,
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  useGetLikesReceivedQuery,
  useGetMutualMatchesQuery,
  useSendLikeOrSuperlikeMutation,
} from "../../../services/apiSlice";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const TOP_PICKS_DATA = [
  {
    id: 1,
    name: "Aditya, 30",
    timeLeft: "24h left",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Pooja, 27",
    timeLeft: "24h left",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
  },
];

export default function LikesScreen() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState("likes"); // 'likes' | 'matches' | 'top_picks'
  const [selectedUser, setSelectedUser] = useState(null);
  const [matchCelebration, setMatchCelebration] = useState(null);

  // 1. Fetch Real Received Likes from Backend
  const {
    data: likesData,
    isLoading: likesLoading,
    refetch: refetchLikes,
  } = useGetLikesReceivedQuery(undefined, { pollingInterval: 3000 });

  // 2. Fetch Mutual Friends / Matches List
  const {
    data: matchesData,
    isLoading: matchesLoading,
    refetch: refetchMatches,
  } = useGetMutualMatchesQuery(undefined, { pollingInterval: 3000 });

  // 3. Send Like Mutation for "Like Back"
  const [sendLikeAction, { isLoading: isLikingBack }] =
    useSendLikeOrSuperlikeMutation();

  const likesList = likesData?.likes || [];
  const matchesList = matchesData?.matches || [];

  const handleOpenPaywall = () => {
    router.push("(user)/likes/LikePaymentScreen");
  };

  const getAge = (dateVal) => {
    if (!dateVal) return 24;
    const birthDate = new Date(dateVal);
    const ageDiff = Date.now() - birthDate.getTime();
    return Math.abs(new Date(ageDiff).getUTCFullYear() - 1970) || 24;
  };

  // 🟢 Like Back Handler (Converts Like to Mutual Match)
  const handleLikeBack = async (targetUser) => {
    if (!targetUser?._id) return;
    try {
      const response = await sendLikeAction({
        receiverId: targetUser._id,
        type: "LIKE",
      }).unwrap();

      setSelectedUser(null);

      if (response?.isMatch) {
        setMatchCelebration(targetUser);
        refetchLikes();
        refetchMatches();
      }
    } catch (err) {
      console.error("Like Back Error:", err);
    }
  };

  const openDirectChat = (userId) => {
    if (!userId) return;
    setSelectedUser(null);
    setMatchCelebration(null);
    router.push({
      pathname: "/(user)/chat",
      params: { userId: String(userId) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Screen Header with Floating Gold Badge */}
      <View style={styles.topHeaderRow}>
        <Text style={styles.headerTitle}>Interested In You</Text>

        {/* 🌟 Compact Floating Gold Subscription Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleOpenPaywall}
          style={styles.goldBadgeBtn}
        >
          <LinearGradient
            colors={["#FFD700", "#FFA000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.goldGradient}
          >
            <FontAwesome name="star" size={12} color="#000" style={{ marginRight: 4 }} />
            <Text style={styles.goldBadgeText}>Spark Gold</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Sub Tabs Navigation */}
      <View style={styles.tabBarContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveSubTab("likes")}
          style={[
            styles.subTabButton,
            activeSubTab === "likes" && styles.subTabButtonActive,
          ]}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === "likes" && styles.subTabTextActive,
            ]}
          >
            {likesList.length} Likes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveSubTab("matches")}
          style={[
            styles.subTabButton,
            activeSubTab === "matches" && styles.subTabButtonActive,
          ]}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === "matches" && styles.subTabTextActive,
            ]}
          >
            Mutual ({matchesList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveSubTab("top_picks")}
          style={[
            styles.subTabButton,
            activeSubTab === "top_picks" && styles.subTabButtonActive,
          ]}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === "top_picks" && styles.subTabTextActive,
            ]}
          >
            Top Picks
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🟢 SUB TAB 1: REAL LIKES & SUPERLIKES RECEIVED */}
      {activeSubTab === "likes" && (
        <View style={{ flex: 1 }}>
          {likesLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#FF4081" />
              <Text style={styles.loaderText}>Loading your likes...</Text>
            </View>
          ) : likesList.length === 0 ? (
            <View style={styles.tabContentCenter}>
              <View style={styles.heartWrapper}>
                <LinearGradient
                  colors={["#FF4081", "#FF5252"]}
                  style={styles.heartGradientCircle}
                >
                  <FontAwesome name="heart" size={80} color="#FFFFFF" />
                </LinearGradient>
              </View>

              <Text style={styles.emptyTitle}>No Likes Yet</Text>
              <Text style={styles.emptyText}>
                Swipe more profiles to get discovered and receive likes!
              </Text>
            </View>
          ) : (
            <FlatList
              data={likesList}
              keyExtractor={(item) => item._id}
              numColumns={2}
              contentContainerStyle={styles.gridScrollContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const sender = item.sender;
                if (!sender) return null;
                const isSuperLike = item.type === "SUPERLIKE";

                return (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.profileCard,
                      isSuperLike && styles.superlikeCardBorder,
                    ]}
                    onPress={() => setSelectedUser(sender)}
                  >
                    <Image
                      source={{
                        uri:
                          sender.photos?.[0]?.url ||
                          "https://via.placeholder.com/300x400",
                      }}
                      style={styles.cardImage}
                    />

                    {/* Superlike / Like Badge */}
                    <View
                      style={[
                        styles.likeTypeBadge,
                        { backgroundColor: isSuperLike ? "#00E5FF" : "#FF4081" },
                      ]}
                    >
                      <FontAwesome
                        name={isSuperLike ? "star" : "heart"}
                        size={10}
                        color={isSuperLike ? "#000" : "#FFF"}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.likeTypeText,
                          { color: isSuperLike ? "#000" : "#FFF" },
                        ]}
                      >
                        {isSuperLike ? "SUPER LIKE" : "LIKED YOU"}
                      </Text>
                    </View>

                    {/* Bottom Info Overlay */}
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.85)"]}
                      style={styles.cardGradientOverlay}
                    >
                      <Text style={styles.profileName} numberOfLines={1}>
                        {sender.fullName}, {getAge(sender.birthDate)}
                      </Text>
                      <Text style={styles.cardSubDetail} numberOfLines={1}>
                        {sender.jobTitle || sender.location?.city || "Nearby"}
                      </Text>

                      {/* Tap to View Button */}
                      <View style={styles.viewProfileChip}>
                        <Text style={styles.viewProfileText}>View Profile ↗</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}

      {/* 🟢 SUB TAB 2: MUTUAL FRIENDS / MATCHED USERS */}
      {activeSubTab === "matches" && (
        <View style={{ flex: 1 }}>
          {matchesLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#FF4081" />
            </View>
          ) : matchesList.length === 0 ? (
            <View style={styles.tabContentCenter}>
              <Ionicons name="people-outline" size={80} color="#7E828A" />
              <Text style={styles.emptyTitle}>No Mutual Matches</Text>
              <Text style={styles.emptyText}>
                When you and someone else like each other, they will appear here!
              </Text>
            </View>
          ) : (
            <FlatList
              data={matchesList}
              keyExtractor={(item) => item._id}
              numColumns={2}
              contentContainerStyle={styles.gridScrollContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const partner = item.receiver;
                if (!partner) return null;

                return (
                  <View style={styles.profileCard}>
                    <Image
                      source={{
                        uri:
                          partner.photos?.[0]?.url ||
                          "https://via.placeholder.com/300x400",
                      }}
                      style={styles.cardImage}
                    />

                    {/* Matched Pill */}
                    <View style={styles.matchPill}>
                      <Text style={styles.matchPillText}>🎉 MUTUAL</Text>
                    </View>

                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.85)"]}
                      style={styles.cardGradientOverlay}
                    >
                      <Text style={styles.profileName} numberOfLines={1}>
                        {partner.fullName}
                      </Text>

                      {/* Direct Chat Button */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.directChatBtn}
                        onPress={() => openDirectChat(partner._id)}
                      >
                        <Ionicons
                          name="chatbubble-ellipses"
                          size={16}
                          color="#FFFFFF"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.directChatBtnText}>Chat Now</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                );
              }}
            />
          )}
        </View>
      )}

      {/* 🟢 SUB TAB 3: TOP PICKS GRID VIEW */}
      {activeSubTab === "top_picks" && (
        <ScrollView
          contentContainerStyle={styles.gridScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.topPicksSubtext}>
            Curated daily profiles just for you!
          </Text>
          <View style={styles.gridRow}>
            {TOP_PICKS_DATA.map((item) => (
              <View key={item.id} style={styles.profileCard}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardGradientOverlay}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.timeTag}>{item.timeLeft}</Text>
                </View>
                <View style={styles.starCircle}>
                  <FontAwesome name="star" size={14} color="#FFFFFF" />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* 🟢 FULL PROFILE INSPECTION MODAL (View Photos, Bio & Like Back) */}
      <Modal visible={!!selectedUser} animationType="slide">
        <View style={styles.profileModalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />

          {/* Modal Header */}
          <View style={styles.profileModalHeader}>
            <Text style={styles.profileModalTitle}>
              {selectedUser?.fullName}, {getAge(selectedUser?.birthDate)}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedUser(null)}
              style={styles.profileDownArrowBtn}
            >
              <Ionicons name="arrow-down" size={20} color="#000000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Photos Carousel */}
            {(selectedUser?.photos || []).map((photo, index) => (
              <View key={index} style={styles.heroImageWrapper}>
                <Image
                  source={{
                    uri: photo.url || "https://via.placeholder.com/600x800",
                  }}
                  style={styles.profileHeroImage}
                />
              </View>
            ))}

            {/* Profile Details Sections */}
            {selectedUser?.bio ? (
              <View style={styles.detailsCardSection}>
                <View style={styles.sectionHeaderRow}>
                  <Feather name="info" size={18} color="#A1A1AA" />
                  <Text style={styles.sectionHeaderTitle}>About</Text>
                </View>
                <Text style={styles.bioText}>{selectedUser.bio}</Text>
              </View>
            ) : null}

            <View style={styles.detailsCardSection}>
              <View style={styles.sectionHeaderRow}>
                <Feather name="briefcase" size={18} color="#A1A1AA" />
                <Text style={styles.sectionHeaderTitle}>Work & Education</Text>
              </View>
              <Text style={styles.sectionHeaderValue}>
                {selectedUser?.jobTitle || "Professional"}{" "}
                {selectedUser?.company ? `at ${selectedUser.company}` : ""}
              </Text>
            </View>

            <View style={[styles.detailsCardSection, { marginBottom: 120 }]}>
              <View style={styles.sectionHeaderRow}>
                <Feather name="map-pin" size={18} color="#A1A1AA" />
                <Text style={styles.sectionHeaderTitle}>Location</Text>
              </View>
              <Text style={styles.sectionHeaderValue}>
                {selectedUser?.location?.city || "Nearby"}
              </Text>
            </View>
          </ScrollView>

          {/* Floating Bottom Like Back Bar */}
          <View style={styles.floatingBottomBar}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.modalCancelBtn}
              onPress={() => setSelectedUser(null)}
            >
              <Ionicons name="close" size={28} color="#FF4B4B" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.likeBackMainBtn}
              disabled={isLikingBack}
              onPress={() => handleLikeBack(selectedUser)}
            >
              <Ionicons
                name="heart"
                size={24}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.likeBackBtnText}>
                {isLikingBack ? "Matching..." : "Like Back & Connect"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🟢 MATCH CELEBRATION POPUP */}
      <Modal visible={!!matchCelebration} transparent animationType="slide">
        <View style={styles.matchModalContainer}>
          <LinearGradient
            colors={["#FF4081", "#7C4DFF"]}
            style={styles.matchGradient}
          >
            <MaterialCommunityIcons name="heart-flash" size={80} color="#FFFFFF" />
            <Text style={styles.matchTitle}>{"IT'S A MUTUAL MATCH!"}</Text>
            <Text style={styles.matchSubtitle}>
              You and {matchCelebration?.fullName} are now connected.
            </Text>

            <Image
              source={{
                uri:
                  matchCelebration?.photos?.[0]?.url ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.matchAvatar}
            />

            <View style={{ flexDirection: "row", gap: 14 }}>
              <TouchableOpacity
                style={[styles.matchChatBtn, { backgroundColor: "#FFFFFF" }]}
                onPress={() => openDirectChat(matchCelebration?._id)}
              >
                <Text style={[styles.matchChatText, { color: "#7C4DFF" }]}>
                  Start Chat 💬
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.matchChatBtn,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
                onPress={() => setMatchCelebration(null)}
              >
                <Text style={[styles.matchChatText, { color: "#FFFFFF" }]}>
                  Keep Browsing
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0B14" },
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#FFFFFF" },
  goldBadgeBtn: { borderRadius: 16, overflow: "hidden" },
  goldGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  goldBadgeText: { color: "#000000", fontWeight: "800", fontSize: 12 },

  tabBarContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    marginTop: 14,
  },
  subTabButton: { flex: 1, paddingVertical: 14, alignItems: "center" },
  subTabButtonActive: { borderBottomWidth: 2, borderBottomColor: "#FF4081" },
  subTabText: { fontSize: 15, fontWeight: "700", color: "#8E8E93" },
  subTabTextActive: { color: "#FFFFFF" },

  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { color: "#8E8E93", marginTop: 12, fontSize: 14 },
  tabContentCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  heartWrapper: { marginBottom: 24 },
  heartGradientCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#FFFFFF", marginBottom: 6 },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },

  gridScrollContent: { padding: 12, paddingBottom: 80 },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  profileCard: {
    width: "48%",
    height: 240,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    margin: "1%",
  },
  superlikeCardBorder: {
    borderWidth: 2,
    borderColor: "#00E5FF",
  },
  cardImage: { width: "100%", height: "100%", resizeMode: "cover" },
  likeTypeBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  likeTypeText: { fontSize: 10, fontWeight: "900" },
  matchPill: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#00E676",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  matchPillText: { color: "#000", fontSize: 10, fontWeight: "900" },
  cardGradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 24,
  },
  profileName: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
  cardSubDetail: { fontSize: 11, color: "#D1D5DB", marginTop: 2 },
  viewProfileChip: {
    marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewProfileText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  directChatBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF4081",
    paddingVertical: 6,
    borderRadius: 12,
  },
  directChatBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },

  topPicksSubtext: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 12,
  },
  timeTag: { fontSize: 12, fontWeight: "600", color: "#A1A1AA", marginTop: 2 },
  starCircle: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#00E5FF",
    justifyContent: "center",
    alignItems: "center",
  },

  profileModalContainer: { flex: 1, backgroundColor: "#000000" },
  profileModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 14,
    backgroundColor: "#000000",
  },
  profileModalTitle: { fontSize: 24, fontWeight: "900", color: "#FFFFFF" },
  profileDownArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  heroImageWrapper: { width: "100%", height: SCREEN_HEIGHT * 0.55, marginBottom: 8 },
  profileHeroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  detailsCardSection: {
    backgroundColor: "#1C1C1E",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  sectionHeaderTitle: { color: "#A1A1AA", fontSize: 13, fontWeight: "700" },
  sectionHeaderValue: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  bioText: { color: "#E4E4E7", fontSize: 15, lineHeight: 22 },

  floatingBottomBar: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalCancelBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 75, 75, 0.4)",
  },
  likeBackMainBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#00E676",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  likeBackBtnText: { color: "#000000", fontWeight: "900", fontSize: 16 },

  matchModalContainer: { flex: 1 },
  matchGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  matchTitle: { fontSize: 30, fontWeight: "900", color: "#FFFFFF", marginTop: 16 },
  matchSubtitle: {
    fontSize: 15,
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
  },
  matchAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginVertical: 28,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  matchChatBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 28 },
  matchChatText: { fontSize: 15, fontWeight: "800" },
});
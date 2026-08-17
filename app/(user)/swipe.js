import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Swiper from "react-native-deck-swiper";
import {
  Ionicons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useGetSwipeFeedQuery,
  useHandleSwipeActionMutation,
  useRewindSwipeActionMutation, // 👈 Rewind mutation
} from "../../services/apiSlice";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BOTTOM_TAB_BAR_HEIGHT = 60;
const CARD_WIDTH = SCREEN_WIDTH - 12;
const CARD_HEIGHT = SCREEN_HEIGHT - BOTTOM_TAB_BAR_HEIGHT;

const SwipeScreen = () => {
  const swiperRef = useRef(null);
  const [photoIndices, setPhotoIndices] = useState({});
  const [matchData, setMatchData] = useState(null);
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("For you");
  const [cardIndex, setCardIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.setItem("lastVisitedRoute", "/(user)/swipe").catch(() => {});
    AsyncStorage.setItem("onboardingStep", "PROFILE_COMPLETE").catch(() => {});
  }, []);

  const { data: feedData, isLoading, error, refetch } = useGetSwipeFeedQuery();
  const [handleSwipeAction] = useHandleSwipeActionMutation();
  const [rewindSwipeAction, { isLoading: isRewinding }] = useRewindSwipeActionMutation();

  const users = feedData?.users || [];

  const getAge = (dateVal) => {
    if (!dateVal) return 26;
    const birthDate = new Date(dateVal);
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970) || 26;
  };

  const handlePhotoTap = (userId, totalPhotos, direction) => {
    setPhotoIndices((prev) => {
      const currentIndex = prev[userId] || 0;
      let newIndex = currentIndex;

      if (direction === "NEXT" && currentIndex < totalPhotos - 1) {
        newIndex = currentIndex + 1;
      } else if (direction === "PREV" && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }

      return { ...prev, [userId]: newIndex };
    });
  };

  // 🟢 Real Backend Swipe Action Trigger (LIKE / SUPERLIKE / DISLIKE)
  const onSwiped = async (swipedCardIndex, action) => {
    const targetUser = users[swipedCardIndex];
    setCardIndex(swipedCardIndex + 1);

    if (!targetUser?._id) return;

    try {
      const result = await handleSwipeAction({
        targetUserId: targetUser._id,
        action: action, // "LIKE", "SUPERLIKE", or "DISLIKE"
      }).unwrap();

      if (result?.isMatch) {
        setMatchData(result.matchedUser || targetUser);
      }
    } catch (err) {
      console.error("Swipe Action Backend Error:", err);
    }
  };

  // 🟢 Real Backend Rewind Action
  const handleRewindPress = async () => {
    if (cardIndex === 0 || isRewinding) return;

    try {
      const result = await rewindSwipeAction().unwrap();
      if (result?.success) {
        swiperRef.current?.swipeBack();
        setCardIndex((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      Alert.alert("Notice", err?.data?.message || "No previous action to undo.");
    }
  };

  const openDirectChat = (userId) => {
    if (!userId) return;
    if (profileModalVisible) {
      setProfileModalVisible(false);
    }
    router.push({
      pathname: "/(user)/chat",
      params: { userId: String(userId) },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF4081" />
        <Text style={styles.loaderText}>Finding matches nearby...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.deckContainer}>
        {error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Failed to load profiles</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
              <Text style={styles.refreshText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : users.length > 0 && cardIndex < users.length ? (
          <Swiper
            key={users.length}
            ref={swiperRef}
            cards={users}
            cardIndex={cardIndex}
            cardWidth={CARD_WIDTH}
            cardHeight={CARD_HEIGHT}
            marginTop={0}
            marginBottom={0}
            cardVerticalPadding={0}
            cardHorizontalPadding={0}
            renderCard={(card) => {
              if (!card) return null;
              const photoIndex = photoIndices[card._id] || 0;
              const photos =
                card.photos && card.photos.length > 0
                  ? card.photos
                  : [{ url: "https://via.placeholder.com/400x600" }];
              const currentPhoto = photos[photoIndex]?.url || photos[0]?.url;

              return (
                <View style={styles.fullScreenCard}>
                  {/* Card Main Image */}
                  <Image
                    source={{ uri: currentPhoto }}
                    style={styles.fullScreenImage}
                  />

                  {/* Top Overlay Filters */}
                  <View style={styles.topHeaderOverlayRow}>
                    <TouchableOpacity style={styles.filterMenuBtn}>
                      <Octicons name="sliders" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.filterScroll}
                    >
                      {["For you", "Double Date", "Astrology"].map((tab) => (
                        <TouchableOpacity
                          key={tab}
                          style={[
                            styles.filterChip,
                            activeTab === tab && styles.filterChipActive,
                          ]}
                          onPress={() => setActiveTab(tab)}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              activeTab === tab && styles.filterChipTextActive,
                            ]}
                          >
                            {tab}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.sparkleBtn}>
                      <Ionicons
                        name="sparkles-sharp"
                        size={20}
                        color="#FF4081"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Photo Dots Progress Indicator */}
                  {photos.length > 1 && (
                    <View style={styles.indicatorContainer}>
                      {photos.map((_, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.indicatorDot,
                            idx === photoIndex && styles.indicatorDotActive,
                          ]}
                        />
                      ))}
                    </View>
                  )}

                  {/* Left and Right Tap Zones */}
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.tapLeft}
                    onPress={() =>
                      handlePhotoTap(card._id, photos.length, "PREV")
                    }
                  />
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.tapRight}
                    onPress={() =>
                      handlePhotoTap(card._id, photos.length, "NEXT")
                    }
                  />

                  {/* Bottom Gradient Overlay */}
                  <LinearGradient
                    colors={[
                      "transparent",
                      "rgba(0,0,0,0.5)",
                      "rgba(0,0,0,0.95)",
                    ]}
                    style={styles.gradientOverlay}
                  >
                    {/* Active Status Badge */}
                    <View style={styles.activeBadge}>
                      <View style={styles.greenDot} />
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>

                    {/* Name, Age */}
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>
                        {card.fullName}, {getAge(card.birthDate || card.dob)}
                      </Text>
                    </View>

                    {/* Distance Indicator */}
                    <View style={styles.distanceRow}>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.distanceText}>
                        {card.distanceKm || 8} km away
                      </Text>
                    </View>

                    {/* Full Profile Inspect Arrow */}
                    <TouchableOpacity
                      style={styles.detailArrowBtn}
                      onPress={() => {
                        setProfileModalUser(card);
                        setProfileModalVisible(true);
                      }}
                    >
                      <Ionicons name="arrow-up" size={30} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* 🟢 5 ACTION BUTTONS WITH REAL BACKEND ACTIONS */}
                    <View style={styles.floatingActionsBar}>
                      {/* 1. Rewind / Undo Button */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.actionBtn, styles.btnRewind]}
                        onPress={handleRewindPress}
                        disabled={cardIndex === 0}
                      >
                        <Ionicons name="reload" size={20} color="#FFB800" />
                      </TouchableOpacity>

                      {/* 2. Dislike / Nope Button */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.actionBtn, styles.btnNope]}
                        onPress={() => swiperRef.current?.swipeLeft()}
                      >
                        <Ionicons name="close" size={28} color="#FF4B4B" />
                      </TouchableOpacity>

                      {/* 3. Superlike Button (⭐ Star) */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.actionBtn, styles.btnSuper]}
                        onPress={() => swiperRef.current?.swipeTop()}
                      >
                        <FontAwesome name="star" size={20} color="#00D2FF" />
                      </TouchableOpacity>

                      {/* 4. Like / Heart Button (💖 Heart) */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.actionBtn, styles.btnLike]}
                        onPress={() => swiperRef.current?.swipeRight()}
                      >
                        <Ionicons name="heart" size={28} color="#00E676" />
                      </TouchableOpacity>

                      {/* 5. Direct Chat / Send Button */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.actionBtn, styles.btnMessage]}
                        onPress={() => openDirectChat(card._id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name="paper-plane"
                          size={18}
                          color="#9C27B0"
                        />
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </View>
              );
            }}
            onSwipedLeft={(index) => onSwiped(index, "DISLIKE")}
            onSwipedRight={(index) => onSwiped(index, "LIKE")}
            onSwipedTop={(index) => onSwiped(index, "SUPERLIKE")}
            onSwipedAll={() => refetch()}
            stackSize={2}
            stackScale={0.94}
            stackSeparation={-14}
            backgroundColor="transparent"
            animateCardOpacity
            verticalThreshold={CARD_HEIGHT / 5}
            horizontalThreshold={SCREEN_WIDTH / 4}
            overlayLabels={{
              left: {
                title: "NOPE",
                style: {
                  label: styles.overlayNope,
                  wrapper: styles.overlayWrapperLeft,
                },
              },
              right: {
                title: "LIKE",
                style: {
                  label: styles.overlayLike,
                  wrapper: styles.overlayWrapperRight,
                },
              },
              top: {
                title: "SUPER LIKE",
                style: {
                  label: styles.overlaySuperLike,
                  wrapper: styles.overlayWrapperTop,
                },
              },
            }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="sparkles" size={60} color="#7C4DFF" />
            <Text style={styles.emptyTitle}>No More Profiles Around</Text>
            <Text style={styles.emptySub}>
              You have swiped through all available users nearby.
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => {
                setCardIndex(0);
                refetch();
              }}
            >
              <Text style={styles.refreshText}>Refresh Feed</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 🟢 MATCH CELEBRATION MODAL */}
      <Modal visible={!!matchData} transparent animationType="slide">
        <View style={styles.matchModalContainer}>
          <LinearGradient
            colors={["#FF4081", "#7C4DFF"]}
            style={styles.matchGradient}
          >
            <MaterialCommunityIcons
              name="heart-flash"
              size={80}
              color="#FFFFFF"
            />
            <Text style={styles.matchTitle}>{"IT'S A MATCH!"}</Text>
            <Text style={styles.matchSubtitle}>
              You and {matchData?.fullName} liked each other.
            </Text>
            <Image
              source={{
                uri:
                  matchData?.photos?.[0]?.url ||
                  matchData?.photo ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.matchAvatar}
            />

            <View style={{ flexDirection: "row", gap: 14 }}>
              <TouchableOpacity
                style={[styles.matchChatBtn, { backgroundColor: "#FFFFFF" }]}
                onPress={() => {
                  const targetId = matchData?._id;
                  setMatchData(null);
                  openDirectChat(targetId);
                }}
              >
                <Text style={[styles.matchChatText, { color: "#7C4DFF" }]}>
                  Send Message 💬
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.matchChatBtn,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
                onPress={() => setMatchData(null)}
              >
                <Text style={[styles.matchChatText, { color: "#FFFFFF" }]}>
                  Keep Swiping
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* 🟢 FULL PROFILE DETAIL VIEW MODAL */}
      <Modal visible={profileModalVisible} animationType="slide">
        <View style={styles.profileModalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />

          <View style={styles.profileModalHeader}>
            <Text style={styles.profileModalTitle}>
              {profileModalUser?.fullName},{" "}
              {getAge(profileModalUser?.birthDate || profileModalUser?.dob)}
            </Text>
            <TouchableOpacity
              onPress={() => setProfileModalVisible(false)}
              style={styles.profileDownArrowBtn}
            >
              <Ionicons name="arrow-down" size={20} color="#000000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.profileScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Gallery Images */}
            <View style={styles.heroImageWrapper}>
              <Image
                source={{
                  uri:
                    profileModalUser?.photos?.[0]?.url ||
                    "https://via.placeholder.com/600x800",
                }}
                style={styles.profileHeroImage}
              />

              <TouchableOpacity
                style={styles.floatingReplyBtn}
                onPress={() => openDirectChat(profileModalUser?._id)}
              >
                <Ionicons
                  name="paper-plane"
                  size={16}
                  color="#000000"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.replyBtnText}>Reply</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Information Sections */}
            <View style={styles.detailsCardSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="search" size={18} color="#A1A1AA" />
                <Text style={styles.sectionHeaderTitle}>Looking for</Text>
              </View>
              <Text style={styles.sectionHeaderValue}>
                {profileModalUser?.relationshipGoal || "Long-term partner"}
              </Text>
            </View>

            {profileModalUser?.bio ? (
              <View style={styles.detailsCardSection}>
                <View style={styles.sectionHeaderRow}>
                  <Feather name="info" size={18} color="#A1A1AA" />
                  <Text style={styles.sectionHeaderTitle}>About Me</Text>
                </View>
                <Text style={{ color: "#E4E4E7", fontSize: 16, lineHeight: 22 }}>
                  {profileModalUser.bio}
                </Text>
              </View>
            ) : null}

            <View style={styles.detailsCardSection}>
              <View style={styles.sectionHeaderRow}>
                <Feather name="user" size={18} color="#A1A1AA" />
                <Text style={styles.sectionHeaderTitle}>Essentials</Text>
              </View>

              <View style={styles.essentialItemRow}>
                <Ionicons name="location-outline" size={18} color="#FFFFFF" />
                <Text style={styles.essentialItemText}>
                  {profileModalUser?.distanceKm || 8} km away
                </Text>
              </View>

              <View style={styles.essentialItemRow}>
                <Ionicons name="person-outline" size={18} color="#FFFFFF" />
                <Text style={styles.essentialItemText}>
                  {profileModalUser?.gender || "Woman"}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Modal Bottom Action Controls */}
          <View style={styles.modalFooterActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.btnNope]}
              onPress={() => {
                setProfileModalVisible(false);
                swiperRef.current?.swipeLeft();
              }}
            >
              <Ionicons name="close" size={28} color="#FF4B4B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.btnSuper]}
              onPress={() => {
                setProfileModalVisible(false);
                swiperRef.current?.swipeTop();
              }}
            >
              <FontAwesome name="star" size={20} color="#00D2FF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.btnLike]}
              onPress={() => {
                setProfileModalVisible(false);
                swiperRef.current?.swipeRight();
              }}
            >
              <Ionicons name="heart" size={28} color="#00E676" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SwipeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  loaderContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: { color: "#FFFFFF", marginTop: 12, fontSize: 16, fontWeight: "600" },
  deckContainer: { flex: 1, backgroundColor: "#000000" },
  fullScreenCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000000",
    alignSelf: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
    top: 0,
    left: 0,
  },
  topHeaderOverlayRow: {
    position: "absolute",
    top: Platform.OS === "android" ? 8 : 12,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 35,
  },
  filterMenuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterScroll: { alignItems: "center", gap: 8, paddingHorizontal: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  filterChipActive: { backgroundColor: "rgba(35, 35, 38, 0.9)" },
  filterChipText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  filterChipTextActive: { color: "#FFFFFF", fontWeight: "800" },
  sparkleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 52 : 86,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    zIndex: 25,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  indicatorDotActive: {
    backgroundColor: "#FFFFFF",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tapLeft: { position: "absolute", top: 0, left: 0, width: "50%", height: "65%", zIndex: 10 },
  tapRight: { position: "absolute", top: 0, right: 0, width: "50%", height: "65%", zIndex: 10 },
  gradientOverlay: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === "ios" ? 80 : 80,
    paddingTop: 28,
    zIndex: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  greenDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#00E676", marginRight: 6 },
  activeBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  nameRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "flex-start", gap: 14 },
  userName: { fontSize: 28, fontWeight: "900", color: "#FFFFFF" },
  detailArrowBtn: {
    position: "absolute",
    right: 18,
    bottom: 170,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    zIndex: 30,
  },
  distanceRow: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 4 },
  distanceText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  floatingActionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 10,
  },
  actionBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(18, 18, 20, 0.75)",
    borderWidth: 1.5,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  btnRewind: { width: 48, height: 48, borderRadius: 24, borderColor: "rgba(255, 184, 0, 0.4)" },
  btnNope: { width: 60, height: 60, borderRadius: 30, borderColor: "rgba(255, 75, 75, 0.5)" },
  btnSuper: { width: 48, height: 48, borderRadius: 24, borderColor: "rgba(0, 210, 255, 0.4)" },
  btnLike: { width: 60, height: 60, borderRadius: 30, borderColor: "rgba(0, 230, 118, 0.5)" },
  btnMessage: { width: 48, height: 48, borderRadius: 24, borderColor: "rgba(156, 39, 176, 0.4)" },

  overlayWrapperLeft: { flexDirection: "column", alignItems: "flex-end", marginTop: 40, marginLeft: -30 },
  overlayWrapperRight: { flexDirection: "column", alignItems: "flex-start", marginTop: 40, marginRight: -30 },
  overlayWrapperTop: { flexDirection: "column", alignItems: "center", justifyContent: "center" },
  overlayNope: {
    backgroundColor: "rgba(255, 62, 89, 0.95)",
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 28,
    transform: [{ rotate: "15deg" }],
  },
  overlayLike: {
    backgroundColor: "rgba(0, 230, 118, 0.95)",
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 28,
    transform: [{ rotate: "-15deg" }],
  },
  overlaySuperLike: {
    backgroundColor: "rgba(0, 210, 255, 0.95)",
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 28,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#000000",
  },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginTop: 16 },
  emptySub: { fontSize: 14, color: "#A1A1AA", textAlign: "center", marginTop: 8 },
  refreshButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#FF4081",
  },
  refreshText: { color: "#FFFFFF", fontWeight: "700" },

  matchModalContainer: { flex: 1 },
  matchGradient: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  matchTitle: { fontSize: 36, fontWeight: "900", color: "#FFFFFF", marginTop: 16 },
  matchSubtitle: { fontSize: 16, color: "#FFFFFF", marginTop: 8, textAlign: "center" },
  matchAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginVertical: 32,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  matchChatBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 28 },
  matchChatText: { fontSize: 16, fontWeight: "800" },

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
  profileModalTitle: { fontSize: 26, fontWeight: "900", color: "#FFFFFF" },
  profileDownArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileScroll: { flex: 1 },
  heroImageWrapper: { position: "relative", width: "100%", height: SCREEN_HEIGHT * 0.6 },
  profileHeroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  floatingReplyBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    elevation: 5,
  },
  replyBtnText: { color: "#000000", fontWeight: "800", fontSize: 16 },
  detailsCardSection: {
    backgroundColor: "#1C1C1E",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  sectionHeaderTitle: { color: "#A1A1AA", fontSize: 14, fontWeight: "700" },
  sectionHeaderValue: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  essentialItemRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  essentialItemText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  modalFooterActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 20,
    paddingVertical: 14,
    backgroundColor: "#000000",
  },
});
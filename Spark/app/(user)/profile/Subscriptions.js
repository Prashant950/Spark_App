import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function SubscriptionsScreen() {
  const router = useRouter();

  // Tier Subscription Data with exact video pricing & full feature set
  const subscriptionTiers = {
    plus: {
      name: "SPARK PLUS",
      badgeColor: "#FF2A55",
      startingPrice: "₹99.00",
      plans: [
        { id: "p1", title: "1 week", priceWk: "₹99.00/wk", total: "₹99.00", badge: "Popular" },
        { id: "p2", title: "1 month", priceWk: "₹49.50/wk", total: "₹198.00", badge: "Save 50%" },
        { id: "p3", title: "6 months", priceWk: "₹32.00/wk", total: "₹768.00", badge: "Best value" },
      ],
      sections: [
        {
          sectionTitle: "Upgrade your likes",
          items: [
            { title: "Unlimited likes", included: true },
            { title: "See who Likes You", included: false },
            { title: "Priority Likes", sub: "Your likes will be seen sooner with Priority Likes.", included: false },
          ],
        },
        {
          sectionTitle: "Enhance your experience",
          items: [
            { title: "Unlimited Rewinds", included: true },
            { title: "1 free Boost per month", sub: "Free monthly Boost only available with subscriptions of 1 month or longer.", included: false },
            { title: "2 free Super Likes per week", included: false },
            { title: "3 free First Impressions per week", sub: "Stand out with a message before matching.", included: false },
          ],
        },
        {
          sectionTitle: "Premium Discovery",
          items: [
            { title: "Unlimited Passport™ Mode", sub: "Match and chat with people anywhere in the world.", included: true },
            { title: "Top Picks", sub: "Browse through a daily curated selection of profiles.", included: false },
          ],
        },
        {
          sectionTitle: "Take control",
          items: [
            { title: "Control your profile", sub: "Only show what you want them to know.", included: true },
            { title: "Control who sees you", sub: "Manage who you're seen by.", included: true },
            { title: "Control who you see", sub: "Choose the type of people you want to connect with.", included: true },
            { title: "Hide ads", included: true },
          ],
        },
      ],
    },
    gold: {
      name: "SPARK GOLD",
      badgeColor: "#FFD700",
      startingPrice: "₹159.00",
      plans: [
        { id: "g1", title: "1 week", priceWk: "₹159.00/wk", total: "₹159.00", badge: "Popular" },
        { id: "g2", title: "1 month", priceWk: "₹79.70/wk", total: "₹319.00", badge: "Save 50%" },
        { id: "g3", title: "6 months", priceWk: "₹54.10/wk", total: "₹1,299.00", badge: "Save 66%" },
      ],
      sections: [
        {
          sectionTitle: "Upgrade your likes",
          items: [
            { title: "Unlimited likes", included: true },
            { title: "See who Likes You", included: true },
            { title: "Priority Likes", sub: "Your likes will be seen sooner with Priority Likes.", included: false },
          ],
        },
        {
          sectionTitle: "Enhance your experience",
          items: [
            { title: "Unlimited Rewinds", included: true },
            { title: "1 free Boost per month", sub: "Free monthly Boost only available with subscriptions of 1 month or longer.", included: true },
            { title: "2 free Super Likes per week", included: true },
            { title: "3 free First Impressions per week", sub: "Stand out with a message before matching.", included: false },
          ],
        },
        {
          sectionTitle: "Premium Discovery",
          items: [
            { title: "Unlimited Passport™ Mode", sub: "Match and chat with people anywhere in the world.", included: true },
            { title: "Top Picks", sub: "Browse through a daily curated selection of profiles.", included: true },
          ],
        },
        {
          sectionTitle: "Take control",
          items: [
            { title: "Control your profile", sub: "Only show what you want them to know.", included: true },
            { title: "Control who sees you", sub: "Manage who you're seen by.", included: true },
            { title: "Control who you see", sub: "Choose the type of people you want to connect with.", included: true },
            { title: "Hide ads", included: true },
          ],
        },
      ],
    },
    platinum: {
      name: "SPARK PLATINUM",
      badgeColor: "#00E5FF",
      startingPrice: "₹385.00",
      plans: [
        { id: "pt1", title: "1 week", priceWk: "₹385.00/wk", total: "₹385.00", badge: "Popular" },
        { id: "pt2", title: "1 month", priceWk: "₹192.20/wk", total: "₹769.00", badge: "Save 50%" },
        { id: "pt3", title: "6 months", priceWk: "₹124.90/wk", total: "₹2,999.00", badge: "Save 68%" },
      ],
      sections: [
        {
          sectionTitle: "Upgrade your likes",
          items: [
            { title: "Unlimited likes", included: true },
            { title: "See who Likes You", included: true },
            { title: "Priority Likes", sub: "Your likes will be seen sooner with Priority Likes.", included: true },
          ],
        },
        {
          sectionTitle: "Enhance your experience",
          items: [
            { title: "Unlimited Rewinds", included: true },
            { title: "1 free Boost per month", sub: "Free monthly Boost only available with subscriptions of 1 month or longer.", included: true },
            { title: "3 free Super Likes per week", included: true },
            { title: "3 free First Impressions per week", sub: "Stand out with a message before matching.", included: true },
          ],
        },
        {
          sectionTitle: "Premium Discovery",
          items: [
            { title: "Unlimited Passport™ Mode", sub: "Match and chat with people anywhere in the world.", included: true },
            { title: "Top Picks", sub: "Browse through a daily curated selection of profiles.", included: true },
          ],
        },
        {
          sectionTitle: "Take control",
          items: [
            { title: "Control your profile", sub: "Only show what you want them to know.", included: true },
            { title: "Control who sees you", sub: "Manage who you're seen by.", included: true },
            { title: "Control who you see", sub: "Choose the type of people you want to connect with.", included: true },
            { title: "Hide ads", included: true },
          ],
        },
      ],
    },
  };

  const [activeTierKey, setActiveTierKey] = useState("gold"); // Default Gold
  const currentTier = subscriptionTiers[activeTierKey];
  const [selectedPlan, setSelectedPlan] = useState(currentTier.plans[0]);

  // Handle tier tab change
  const handleSwitchTier = (tierKey) => {
    setActiveTierKey(tierKey);
    setSelectedPlan(subscriptionTiers[tierKey].plans[0]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tier Switcher Row */}
      <View style={styles.tierTabRow}>
        <TouchableOpacity
          style={[styles.tierTab, activeTierKey === "plus" && styles.tierTabPlusActive]}
          onPress={() => handleSwitchTier("plus")}
        >
          <Text style={styles.tierTabText}>PLUS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tierTab, activeTierKey === "gold" && styles.tierTabGoldActive]}
          onPress={() => handleSwitchTier("gold")}
        >
          <Text style={[styles.tierTabText, { color: "#FFD700" }]}>GOLD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tierTab, activeTierKey === "platinum" && styles.tierTabPlatActive]}
          onPress={() => handleSwitchTier("platinum")}
        >
          <Text style={styles.tierTabText}>PLATINUM</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Horizontal Plans Selection Carousel (Fixed Padding to prevent badge truncation) */}
        <Text style={styles.selectPlanLabel}>Select a plan</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.plansCarousel}
        >
          {currentTier.plans.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.85}
                onPress={() => setSelectedPlan(plan)}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
              >
                {plan.badge && (
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                <View style={styles.planHeaderRow}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
                </View>
                <Text style={styles.planPrice}>{plan.priceWk}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Dynamic Categorized Feature Sections */}
        {currentTier.sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionWrapper}>
            <Text style={styles.sectionHeader}>{section.sectionTitle}</Text>
            {section.items.map((feat, fIdx) => (
              <View key={fIdx} style={styles.featureItemRow}>
                <Ionicons
                  name={feat.included ? "checkmark-sharp" : "lock-closed-outline"}
                  size={20}
                  color={feat.included ? "#FFFFFF" : "#8E8E93"}
                  style={styles.featureCheckIcon}
                />
                <View style={styles.featureTextWrapper}>
                  <Text style={[styles.featureTitle, !feat.included && styles.featureDisabled]}>
                    {feat.title}
                  </Text>
                  {feat.sub && (
                    <Text style={[styles.featureSub, !feat.included && styles.featureDisabledSub]}>
                      {feat.sub}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Footer Button with Real Total Money */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient colors={["#FF4081", "#7C4DFF"]} style={styles.gradientBtn}>
            <Text style={styles.btnText}>
              Continue for {selectedPlan.total} total
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },

  // Tier Selector Buttons
  tierTabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginVertical: 12,
  },
  tierTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  tierTabPlusActive: { backgroundColor: "#FF2A55", borderColor: "#FF2A55" },
  tierTabGoldActive: { backgroundColor: "rgba(255,215,0,0.18)", borderColor: "#FFD700" },
  tierTabPlatActive: { backgroundColor: "#00E5FF", borderColor: "#00E5FF" },
  tierTabText: { fontSize: 12, fontWeight: "900", color: "#FFFFFF" },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  selectPlanLabel: { fontSize: 14, fontWeight: "700", color: "#A1A1AA", marginBottom: 16, marginTop: 8 },

  // Carousel Plan Cards (Added Top Padding & Margin to prevent Badge Truncation)
  plansCarousel: {
    gap: 12,
    paddingRight: 10,
    paddingTop: 12, // Prevents badges from clipping at top
    marginBottom: 28,
  },
  planCard: {
    width: 136,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 18, // Extra top room for badge
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
    position: "relative",
    justifyContent: "space-between",
  },
  planCardSelected: { borderColor: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.14)" },
  cardBadge: {
    position: "absolute",
    top: -10,
    left: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    elevation: 2,
  },
  cardBadgeText: { fontSize: 10, fontWeight: "900", color: "#0D0B14" },
  planHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planTitle: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
  planPrice: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", marginTop: 10 },

  // Feature Section List
  sectionWrapper: { marginBottom: 20 },
  sectionHeader: { fontSize: 14, fontWeight: "800", color: "#8E8E93", marginBottom: 14 },
  featureItemRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  featureCheckIcon: { marginRight: 12, marginTop: 2 },
  featureTextWrapper: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  featureSub: { fontSize: 12, color: "#A1A1AA", marginTop: 2, lineHeight: 17 },
  featureDisabled: { color: "#666666" },
  featureDisabledSub: { color: "#555555" },

  // Sticky Bottom Action Button
  footer: { paddingHorizontal: 20, paddingBottom: 20, backgroundColor: "#0D0B14", marginBottom: 60 },
  gradientBtn: { height: 54, borderRadius: 27, justifyContent: "center", alignItems: "center" },
  btnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
});
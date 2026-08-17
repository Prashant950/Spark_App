import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

// Subscription Plans Data (Prices in INR ₹)
const SUBSCRIPTION_PLANS = [
  {
    id: "1_week",
    title: "1 week",
    badge: "Popular",
    pricePerWk: "₹385.00",
    totalPrice: "₹385.00",
    savings: null,
  },
  {
    id: "1_month",
    title: "1 month",
    badge: null,
    pricePerWk: "₹192.20",
    totalPrice: "₹769.00",
    savings: "Save 50%",
  },
  {
    id: "6_months",
    title: "6 months",
    badge: "Best value",
    pricePerWk: "₹124.90",
    totalPrice: "₹2,999.00",
    savings: "Save 68%",
  },
];

const PaywallScreen = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[0]);

  // Features List
  const features = [
    {
      title: "Unlimited likes",
      sub: null,
    },
    {
      title: "See who Likes You",
      sub: null,
    },
    {
      title: "Priority Likes",
      sub: "Your likes will be seen sooner with Priority Likes.",
    },
    {
      title: "Unlimited Rewinds",
      sub: null,
    },
    {
      title: "1 free Boost per month",
      sub: "Free monthly Boost only available with subscriptions of 1 month or longer.",
    },
    {
      title: "3 free Super Likes per week",
      sub: null,
    },
    {
      title: "3 free First Impressions per week",
      sub: "Stand out with a message before matching.",
    },
    {
      title: "Unlimited Passport™ Mode",
      sub: "Match and chat with people anywhere in the world.",
    },
    {
      title: "Top Picks",
      sub: "Browse through a daily curated selection of profiles.",
    },
    {
      title: "Control your profile",
      sub: "Only show what you want them to know.",
    },
    {
      title: "Hide ads",
      sub: null,
    },
  ];

  const handleClose = () => {
    router.back();
  };

  const handleContinuePayment = () => {
    console.log("Processing payment for plan:", selectedPlan);
    // Payment gateway logic goes here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Brand Header with Metallic/Gradient Badge */}
        <View style={styles.brandTitleRow}>
          <Text style={styles.brandTitleText}>SPARK</Text>
          <LinearGradient
            colors={["#00E5FF", "#7C4DFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.platinumBadge}
          >
            <Text style={styles.platinumBadgeText}>PLATINUM</Text>
          </LinearGradient>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.paywallHeading}>
          Check out the best profiles every day.
        </Text>

        <Text style={styles.selectPlanLabel}>Select a plan</Text>

        {/* Horizontal Plans Carousel with Padding for Badges */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.plansCarousel}
        >
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;

            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.85}
                onPress={() => setSelectedPlan(plan)}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                ]}
              >
                {/* Top Badge Tag */}
                {plan.badge && (
                  <LinearGradient
                    colors={isSelected ? ["#FF4081", "#7C4DFF"] : ["#FFFFFF", "#E0E0E0"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.cardBadge}
                  >
                    <Text
                      style={[
                        styles.cardBadgeText,
                        isSelected && { color: "#FFFFFF" },
                      ]}
                    >
                      {plan.badge}
                    </Text>
                  </LinearGradient>
                )}

                <View style={styles.planHeaderRow}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#FF4081"
                    />
                  )}
                </View>

                <Text style={styles.planPrice}>{plan.pricePerWk}/wk</Text>

                {plan.savings ? (
                  <View style={styles.savingsPill}>
                    <Text style={styles.savingsText}>{plan.savings}</Text>
                  </View>
                ) : (
                  <View style={{ height: 24 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Included Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.includedHeader}>Included with Spark Platinum</Text>

          {features.map((feature, idx) => (
            <View key={idx} style={styles.featureItemRow}>
              <View style={styles.checkIconCircle}>
                <Ionicons name="checkmark-sharp" size={16} color="#FF4081" />
              </View>
              <View style={styles.featureTextWrapper}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                {feature.sub && (
                  <Text style={styles.featureSub}>{feature.sub}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Disclaimer Note */}
        <Text style={styles.disclaimerText}>
          {"By tapping Continue, you will be charged, your subscription will auto-renew for the same price and package length until you cancel via Play Store Settings, and you agree to our Terms."}
        </Text>
      </ScrollView>

      {/* Sticky Bottom Gradient Payment Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleContinuePayment}
        >
          <LinearGradient
            colors={["#FF4081", "#7C4DFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>
              Continue for {selectedPlan.totalPrice} total
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaywallScreen;

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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandTitleText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  platinumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  platinumBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  paywallHeading: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 34,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  selectPlanLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#A1A1AA",
    marginBottom: 14,
  },

  // Carousel Plan Cards
  plansCarousel: {
    gap: 12,
    paddingRight: 10,
    paddingTop: 12, // Prevents badge truncation
    marginBottom: 28,
  },
  planCard: {
    width: 140,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 20, // Space for top badge
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    position: "relative",
    justifyContent: "space-between",
  },
  planCardSelected: {
    borderColor: "#FF4081",
    backgroundColor: "rgba(255, 64, 129, 0.08)",
    shadowColor: "#FF4081",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBadge: {
    position: "absolute",
    top: -10,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0D0B14",
  },
  planHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginVertical: 10,
  },
  savingsPill: {
    backgroundColor: "rgba(255, 64, 129, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 64, 129, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  savingsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF4081",
  },

  // Features List
  featuresContainer: {
    marginBottom: 28,
  },
  includedHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#A1A1AA",
    marginBottom: 18,
  },
  featureItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checkIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255, 64, 129, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 1,
  },
  featureTextWrapper: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  featureSub: {
    fontSize: 13,
    color: "#A1A1AA",
    marginTop: 4,
    lineHeight: 18,
  },

  disclaimerText: {
    fontSize: 12,
    color: "#8E8E93",
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 20,
  },

  // Sticky Bottom Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
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
    fontWeight: "800",
  },
});
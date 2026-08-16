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

export default function BoostsScreen() {
  const router = useRouter();

  // Boost Options with total money calculations
  const packs = [
    {
      id: "20",
      count: "20 Boosts",
      pricePerEach: "₹175.00/ea",
      totalPrice: "₹3,500.00",
      badge: "Save 51%",
    },
    {
      id: "10",
      count: "10 Boosts",
      pricePerEach: "₹215.00/ea",
      totalPrice: "₹2,150.00",
      badge: "Save 40%",
    },
    {
      id: "3",
      count: "3 Boosts",
      pricePerEach: "₹356.60/ea",
      totalPrice: "₹1,069.80",
      badge: null,
    },
  ];

  const [selectedPack, setSelectedPack] = useState(packs[1]); // Default 10 Boosts

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header Close */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTabRow}>
          <Text style={[styles.headerTab, styles.headerTabActive]}>Boost</Text>
          <Text style={styles.headerTab}>Primetime Boost</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.centerHero}>
          <Ionicons name="flash" size={54} color="#E040FB" />
          <Text style={styles.heroTitle}>Be seen</Text>
          <Text style={styles.heroSub}>
            Be a top profile in your area for 30 minutes to get more likes.
          </Text>
        </View>

        {/* Boost Options */}
        <View style={styles.packsContainer}>
          {packs.map((pack) => {
            const isSelected = selectedPack.id === pack.id;
            return (
              <TouchableOpacity
                key={pack.id}
                style={[styles.packCard, isSelected && styles.packCardSelected]}
                onPress={() => setSelectedPack(pack)}
                activeOpacity={0.85}
              >
                {pack.badge && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{pack.badge}</Text>
                  </View>
                )}
                <Text style={styles.packTitle}>{pack.count}</Text>
                <Text style={styles.packPrice}>{pack.pricePerEach}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.orText}>or</Text>

        <View style={styles.goldCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.goldCardTitle}>Get Spark Gold</Text>
            <Text style={styles.goldCardSub}>Get 1 free Boost every 1 month</Text>
          </View>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => router.push("/(user)/profile/Subscriptions")}
          >
            <Text style={styles.selectBtnText}>Select</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dynamic Money Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient colors={["#E040FB", "#7C4DFF"]} style={styles.gradientBtn}>
            <Text style={styles.btnText}>
              Continue for {selectedPack.totalPrice} total
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
    paddingTop: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTabRow: { flexDirection: "row", gap: 16 },
  headerTab: { fontSize: 14, fontWeight: "700", color: "#8E8E93" },
  headerTabActive: { color: "#E040FB" },

  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 },
  centerHero: { alignItems: "center", marginBottom: 28 },
  heroTitle: { fontSize: 26, fontWeight: "900", color: "#FFFFFF", marginTop: 12 },
  heroSub: { fontSize: 14, color: "#A1A1AA", textAlign: "center", marginTop: 6, lineHeight: 20 },
  packsContainer: { gap: 14, marginBottom: 20 },
  packCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
    position: "relative",
  },
  packCardSelected: { borderColor: "#E040FB", backgroundColor: "rgba(224,64,251,0.08)" },
  badgePill: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#FFFFFF" },
  packTitle: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  packPrice: { fontSize: 15, fontWeight: "700", color: "#A1A1AA" },
  orText: { fontSize: 15, color: "#8E8E93", textAlign: "center", marginVertical: 10, fontStyle: "italic" },
  goldCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  goldCardTitle: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  goldCardSub: { fontSize: 12, color: "#A1A1AA", marginTop: 4 },
  selectBtn: { backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  selectBtnText: { color: "#000000", fontWeight: "800", fontSize: 13 },
  footer: { paddingHorizontal: 20, paddingBottom: 20, backgroundColor: "#0D0B14", marginBottom: 60 },
  gradientBtn: { height: 54, borderRadius: 27, justifyContent: "center", alignItems: "center" },
  btnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
});
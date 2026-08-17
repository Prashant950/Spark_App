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
import { Feather, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function SuperLikesScreen() {
  const router = useRouter();

  // Packs with exact video pricing (Per piece price & calculated total price)
  const packs = [
    {
      id: "3",
      count: "3 Super Likes",
      pricePerEach: "₹389.60/ea",
      totalPrice: "₹1,168.80",
      badge: null,
    },
    {
      id: "15",
      count: "15 Super Likes",
      pricePerEach: "₹293.30/ea",
      totalPrice: "₹4,400.00",
      badge: "Save 25%",
      popular: true,
    },
    {
      id: "30",
      count: "30 Super Likes",
      pricePerEach: "₹226.60/ea",
      totalPrice: "₹6,798.00",
      badge: "Save 42%",
      bestValue: true,
    },
  ];

  const [selectedPack, setSelectedPack] = useState(packs[1]); // Default 15 Super Likes

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Close Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Center Hero Icon */}
        <View style={styles.centerHero}>
          <FontAwesome name="star" size={54} color="#00E5FF" />
          <Text style={styles.heroTitle}>Get Super Likes</Text>
          <Text style={styles.heroSub}>
           {" Stand out with a Super Like. You're 3x more likely to get a match!"}
          </Text>
        </View>

        {/* Packs Card Stack */}
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

        {/* Spark Gold Offer Card */}
        <View style={styles.goldCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.goldCardTitle}>Get Spark Gold</Text>
            <Text style={styles.goldCardSub}>Includes 2 free Super Likes every 1 week</Text>
          </View>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => router.push("/(user)/profile/Subscriptions")}
          >
            <Text style={styles.selectBtnText}>Select</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Money Button */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85}>
          <LinearGradient colors={["#00E5FF", "#0088FF"]} style={styles.gradientBtn}>
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
  header: { paddingHorizontal: 20, paddingTop: 10 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
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
  packCardSelected: { borderColor: "#00E5FF", backgroundColor: "rgba(0,229,255,0.08)" },
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
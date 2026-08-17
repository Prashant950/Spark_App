import React, { useEffect, useCallback } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PageNotFound = () => {
  const router = useRouter();

  const navigateToTarget = useCallback(async () => {
    try {
      const last = await AsyncStorage.getItem("lastVisitedRoute");
      const target = last && last !== "/index" ? last : "/UserDetails/LookingRelationship";
      try {
        router.push(target);
      } catch (_) {
        router.replace(target);
      }
    } catch (_) {
      try { router.replace("/UserDetails/LookingRelationship"); } catch (_) {}
    }
  }, [router]);

  const handleBack = async () => {
    // Direct, deterministic navigation away from 404
    await navigateToTarget();
  };

  useEffect(() => {
    // Immediately attempt to recover from unmatched route
    navigateToTarget();
  }, [navigateToTarget]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.bigIcon}>?</Text>
        <Text style={styles.title}>Unmatched Route</Text>
        <Text style={styles.subtitle}>Page could not be found.</Text>

        <View style={styles.row}>
          <TouchableOpacity onPress={handleBack} style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Go back</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/index")} style={[styles.button, styles.ghost]} activeOpacity={0.8}>
            <Text style={[styles.buttonText, styles.ghostText]}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PageNotFound;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  bigIcon: { fontSize: 96, color: "#666", marginBottom: 8 },
  title: { fontSize: 40, color: "#fff", fontWeight: "700", textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 18, color: "#bbb", textAlign: "center", marginBottom: 18 },
  row: { flexDirection: "row", marginTop: 12 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    marginHorizontal: 8,
  },
  ghost: { backgroundColor: "transparent", borderWidth: 0 },
  buttonText: { color: "#1EA6FF", fontSize: 16, fontWeight: "600" },
  ghostText: { color: "#8EA8C8" },
});

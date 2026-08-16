import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Login = () => {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#08070F", "#100A1B", "#0A0610"]}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            paddingTop:
              Platform.OS === "android"
                ? (StatusBar.currentHeight || 0) + 12
                : 18,
          },
        ]}
      >
        <View style={styles.topSection}>
          <View style={styles.glowCircle} />
          <View style={styles.logoCircle}>
            <Image source={require("../assets/images/logo.png")} style={styles.logoImage} />
          </View>
          <Text style={styles.title}>Spark</Text>
          <Text style={styles.subtitle}>IGNITE YOUR CONNECTION</Text>
          <Text style={styles.description}>
            By tapping Create Account or Sign In, you agree to our Terms. Learn how we process your data in our Privacy Policy and Cookie Policy.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/EnterMobile")}> 
            <LinearGradient
              colors={["#FF5BC4", "#8D3BFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Feather name="smartphone" size={20} color="#fff" style={styles.iconLeft} />
              <Text style={styles.primaryButtonText}>CONTINUE WITH PHONE</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineButton} activeOpacity={0.85} onPress={() => router.push("/EnterEmail")}> 
            <MaterialIcons name="email" size={20} color="#FFF" style={styles.iconLeft} />
            <Text style={styles.outlineText}>CONTINUE WITH EMAIL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineButton} activeOpacity={0.85}> 
            <FontAwesome name="google" size={20} color="#FFF" style={styles.iconLeft} />
            <Text style={styles.outlineText}>CONTINUE WITH GOOGLE</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.footerButton} activeOpacity={0.8}>
          <Text style={styles.footerText}>TROUBLE SIGNING IN?</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08070F",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSection: {
    alignItems: "center",
    marginTop: 16,
  },
  glowCircle: {
    position: "absolute",
    top: 0,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255, 95, 196, 0.16)",
    shadowColor: "rgba(255, 95, 196, 0.45)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 10,
  },
  logoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
    overflow: "hidden",
  },
  logoImage: {
    width: 110,
    height: 110,
    resizeMode: "contain",
  },
  title: {
    fontSize: 44,
    fontWeight: "900",
    color: "#F7F7F9",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.72)",
    letterSpacing: 1.6,
    marginBottom: 28,
  },
  description: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 320,
    marginTop: 8,
  },
  buttonGroup: {
    marginTop: 24,
    width: "100%",
  },
  primaryButton: {
    height: 64,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(255, 91, 196, 0.35)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  outlineButton: {
    marginTop: 16,
    height: 60,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  outlineText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  iconLeft: {
    position: "absolute",
    left: 26,
  },
  footerButton: {
    marginTop: 34,
    alignItems: "center",
  },
  footerText: {
    color: "#FF9FE9",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
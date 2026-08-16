import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState, useEffect } from "react";
import {
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDateOfBirthMutation } from "../services/apiSlice";

const EnterDOB = () => {
  const router = useRouter();

  // Individual states for Day, Month, Year
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  
  // 1. Age state & Error state
  const [age, setAge] = useState(null);
  const [ageError, setAgeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [activeBox, setActiveBox] = useState(null);

  const [dateOfBirth] = useDateOfBirthMutation();

  // References for automatic focus switching
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const dayRef = useRef(null);

  // 2. Automatically calculate Age when Day, Month, or Year changes
  useEffect(() => {
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      const d = parseInt(day, 10);
      const m = parseInt(month, 10) - 1; // JS Months are 0-indexed
      const y = parseInt(year, 10);

      const birthDate = new Date(y, m, d);
      const today = new Date();

      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }

      setAge(calculatedAge);

      // Check 18+ validation
      if (calculatedAge < 18) {
        setAgeError("You must be at least 18 years old to use this app.");
      } else {
        setAgeError("");
      }
    } else {
      setAge(null);
      setAgeError("");
    }
  }, [day, month, year]);

  useEffect(() => {
    AsyncStorage.setItem("lastVisitedRoute", "/EnterDOB").catch(() => {});
  }, []);

  // Handle Day Input
  const handleDayChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    setDay(cleaned);

    if (cleaned.length === 2) {
      monthRef.current?.focus();
    }
  };

  // Handle Month Input
  const handleMonthChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    setMonth(cleaned);

    if (cleaned.length === 2) {
      yearRef.current?.focus();
    }
  };

  // Handle Year Input
  const handleYearChange = (text) => {
    const cleaned = text.replace(/\D/g, "");
    setYear(cleaned);

    if (cleaned.length === 4) {
      Keyboard.dismiss();
    }
  };

  // Handle Backspace Navigation
  const handleKeyPress = (e, field) => {
    if (e.nativeEvent.key === "Backspace") {
      if (field === "month" && month.length === 0) {
        dayRef.current?.focus();
      } else if (field === "year" && year.length === 0) {
        monthRef.current?.focus();
      }
    }
  };

  // 3. Date & 18+ Age Validation Logic
  const isValidDate = () => {
    if (day.length !== 2 || month.length !== 2 || year.length !== 4)
      return false;

    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const currentYear = new Date().getFullYear();

    const isFormatValid =
      d >= 1 &&
      d <= 31 &&
      m >= 1 &&
      m <= 12 &&
      y >= 1940 &&
      y <= currentYear;

    // Strict 18+ check
    return isFormatValid && age !== null && age >= 18;
  };

  const isFormValid = isValidDate();

  // Smooth Back Navigation
  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(
      () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/EnterName");
        }
      },
      Platform.OS === "android" ? 50 : 0,
    );
  };

  // 4. handleSubmit sending both dob and age to backend
  const handleSubmit = async () => {
    if (!isFormValid) return;

    const formattedDay = day.padStart(2, "0");
    const formattedMonth = month.padStart(2, "0");
    const formattedYear = year;

    // Expected format: YYYY-MM-DD
    const formattedDate = `${formattedYear}-${formattedMonth}-${formattedDay}`;

    try {
      setIsLoading(true);
      
      // Sending both DOB and calculated AGE to Backend
      const response = await dateOfBirth({
        dob: formattedDate,
        age: age,
      }).unwrap();

      if (response?.success) {
        await AsyncStorage.setItem(
          "onboardingStep",
          response?.user?.onboardingStep || "DOB_COMPLETED"
        );
        router.replace("/ChooseGender");
      }
    } catch (error) {
      console.error("DOB Update Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{"What's your Date of Birth?"}</Text>

        {/* Date Container Box */}
        <View style={[styles.inputBox, activeBox && styles.inputBoxFocused]}>
          <FontAwesome5
            name="calendar-alt"
            size={20}
            color="#F06292"
            style={styles.calendarIcon}
          />

          <View style={styles.dateInputsWrapper}>
            {/* DAY INPUT */}
            <View style={styles.segmentWrapper}>
              <TextInput
                ref={dayRef}
                style={[styles.segmentInput, day && styles.activeText]}
                value={day}
                onChangeText={handleDayChange}
                onKeyPress={(e) => handleKeyPress(e, "day")}
                onFocus={() => setActiveBox("day")}
                keyboardType="number-pad"
                maxLength={2}
                caretHidden={false}
                selectionColor="#FFFFFF"
              />
              {!day && <Text style={styles.placeholderOverlay}>DD</Text>}
            </View>

            <Text style={styles.separator}> / </Text>

            {/* MONTH INPUT */}
            <View style={styles.segmentWrapper}>
              <TextInput
                ref={monthRef}
                style={[styles.segmentInput, month && styles.activeText]}
                value={month}
                onChangeText={handleMonthChange}
                onKeyPress={(e) => handleKeyPress(e, "month")}
                onFocus={() => setActiveBox("month")}
                keyboardType="number-pad"
                maxLength={2}
                caretHidden={false}
                selectionColor="#FFFFFF"
              />
              {!month && <Text style={styles.placeholderOverlay}>MM</Text>}
            </View>

            <Text style={styles.separator}> / </Text>

            {/* YEAR INPUT */}
            <View style={styles.segmentWrapper}>
              <TextInput
                ref={yearRef}
                style={[
                  styles.segmentInput,
                  year && styles.activeText,
                  { width: 68 },
                ]}
                value={year}
                onChangeText={handleYearChange}
                onKeyPress={(e) => handleKeyPress(e, "year")}
                onFocus={() => setActiveBox("year")}
                keyboardType="number-pad"
                maxLength={4}
                caretHidden={false}
                selectionColor="#FFFFFF"
              />
              {!year && <Text style={styles.placeholderOverlay}>YYYY</Text>}
            </View>
          </View>
        </View>

        {/* 5. Live Age Display Card or Error Message */}
        {age !== null && !ageError && (
          <View style={styles.ageBadge}>
            <Text style={styles.ageBadgeText}>
              Your Age: <Text style={styles.ageHighlight}>{age} years old</Text>
            </Text>
          </View>
        )}

        {ageError ? (
          <Text style={styles.errorText}>{ageError}</Text>
        ) : (
          <Text style={styles.disclaimer}>
            Your profile shows your age, not your date of birth.
          </Text>
        )}

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={isFormValid && !isLoading ? 0.85 : 1}
          disabled={!isFormValid || isLoading}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={
              isFormValid
                ? ["#FF4081", "#7C4DFF"]
                : ["rgba(255, 64, 129, 0.35)", "rgba(124, 77, 255, 0.35)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  !isFormValid && styles.buttonTextDisabled,
                ]}
              >
                Next
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EnterDOB;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0B14",
  },

  // Header Bar
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },

  // Content Area
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 44,
    letterSpacing: -0.5,
    marginBottom: 40,
  },

  // DOB Box Container
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    borderRadius: 16,
    backgroundColor: "#000000",
    borderWidth: 1.5,
    borderColor: "#333333",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  inputBoxFocused: {
    borderColor: "#FFFFFF",
  },
  calendarIcon: {
    marginRight: 12,
  },

  dateInputsWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  segmentWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  segmentInput: {
    width: 38,
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
    zIndex: 2,
  },
  placeholderOverlay: {
    position: "absolute",
    fontSize: 18,
    fontWeight: "800",
    color: "#666666",
    letterSpacing: 1,
    zIndex: 1,
  },
  activeText: {
    color: "#FFFFFF",
  },
  separator: {
    fontSize: 22,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.35)",
    marginHorizontal: 4,
  },

  // Age Badge Styles
  ageBadge: {
    backgroundColor: "rgba(240, 98, 146, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(240, 98, 146, 0.3)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 16,
  },
  ageBadgeText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  ageHighlight: {
    color: "#F06292",
    fontWeight: "800",
  },

  // Error Text
  errorText: {
    fontSize: 14,
    color: "#FF5252",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 36,
  },

  // Subtitle Disclaimer
  disclaimer: {
    fontSize: 15,
    color: "#A1A1AA",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
  },

  // Button
  buttonWrapper: {
    width: "100%",
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
    fontWeight: "700",
  },
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.4)",
  },
});
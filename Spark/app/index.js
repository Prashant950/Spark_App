// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Redirect } from "expo-router";
// import { ActivityIndicator, View, StyleSheet } from "react-native";
// import { useEffect, useState } from "react";

// const ROUTE_MAP = {
//   EMAIL_ENTERED: "/EnterName",  
//   EMAIL_VERIFIED: "/EmailOTPVerify",
//   NAME_COMPLETED: "/EnterName",
//   DOB_COMPLETED: "/EnterDOB",
//   GENDER_COMPLETED: "/ChooseGender",
//   WHO_INTERESTED_COMPLETED: "/UserDetails/WhoInterested",
//   DISTANCE_COMPLETED: "/UserDetails/DistancePreference",
//   LOOKINGRELATIONSHIP_COMPLETED: "/UserDetails/LookingRelationship",
//   RELATIONSHIP_GOAL_COMPLETED: "/UserDetails/RelationshipGoal",
//   STUDYING_COMPLETED: "/UserDetails/StudyingPage",
//   LIFESTYLE_COMPLETED: "/UserDetails/UsersFirstPageLifestyle",
//   INTERESTS_COMPLETED: "/UserDetails/UsersSecondPageLifeStyle",
//   ESSENTIALS_COMMUNICATION_STYLE_COMPLETED: "/UserDetails/AuthenticityAtracts/CommunicateStyleFirstPage",
//   ESSENTIALS_COMMUNICATION_STYLE_COMPLETED2: "/UserDetails/AuthenticityAtracts/CommunicateSecondPage",
//   ESSENTIALS_COMMUNICATION_STYLE_COMPLETED3: "/UserDetails/AuthenticityAtracts/ComunicateThirdPage",
//   CREATIVITY_COMPLETED: "/UserDetails/CreativityInterests",
//   BIO_COMPLETED: "/UserDetails/UserEnterAbout",
//   LOCATION_COMPLETED: "/UserDetails/UserEnableLocation",
//   PHOTOS_COMPLETED: "/UserDetails/UserPhoto",
//   AVOID_SOMEONE_COMPLETED: "/UserDetails/AvoidSomeone",
//   PROFILE_COMPLETE: "/UserDetails/UserNotCompleteProfile",

  
// };


// export default function Index() {
//   const [target, setTarget] = useState(null);

//   useEffect(() => {
//     const restoreSession = async () => {
//       try {
//         const token = await AsyncStorage.getItem("token");
//         const onboardingStep = await AsyncStorage.getItem("onboardingStep");
//         const lastVisitedRoute = await AsyncStorage.getItem("lastVisitedRoute");

//         if (!token) {
//           setTarget("/login");
//           return;
//         }

//         const safeLastRoute = lastVisitedRoute && lastVisitedRoute !== "/login" && lastVisitedRoute !== "/index"
//           ? lastVisitedRoute
//           : null;

//         setTarget(safeLastRoute || ROUTE_MAP[onboardingStep] || "/UserDetails/LookingRelationship");
//       } catch (error) {
//         console.error("Bootstrap auth error:", error);
//         setTarget("/login");
//       }
//     };

//     restoreSession();
//   }, []);

//   if (!target) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#FF4D8D" />
//       </View>
//     );
//   }

//   return <Redirect href={target} />;
// }

// const styles = StyleSheet.create({
//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#0D0B14",
//   },
// });


import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import * as Location from "expo-location";

const ROUTE_MAP = {
  EMAIL_ENTERED: "/EnterName",
  EMAIL_VERIFIED: "/EmailOTPVerify",
  NAME_COMPLETED: "/EnterName",
  DOB_COMPLETED: "/EnterDOB",
  GENDER_COMPLETED: "/ChooseGender",
  WHO_INTERESTED_COMPLETED: "/UserDetails/WhoInterested",
  DISTANCE_COMPLETED: "/UserDetails/DistancePreference",
  LOOKINGRELATIONSHIP_COMPLETED: "/UserDetails/LookingRelationship",
  RELATIONSHIP_GOAL_COMPLETED: "/UserDetails/LookingRelationship",
  STUDYING_COMPLETED: "/UserDetails/StudyingPage",
  LIFESTYLE_COMPLETED: "/UserDetails/UsersFirstPageLifestyle",
  INTERESTS_COMPLETED: "/UserDetails/UsersSecondPageLifeStyle",
  ESSENTIALS_COMMUNICATION_STYLE_COMPLETED: "/UserDetails/AuthenticityAtracts/CommunicateStyleFirstPage",
  ESSENTIALS_COMMUNICATION_STYLE_COMPLETED2: "/UserDetails/AuthenticityAtracts/CommunicateSecondPage",
  ESSENTIALS_COMMUNICATION_STYLE_COMPLETED3: "/UserDetails/AuthenticityAtracts/ComunicateThirdPage",
  CREATIVITY_COMPLETED: "/UserDetails/UsersInterests10Pages/Creativity",
  PHOTOS_COMPLETED: "/UserDetails/UserPhoto",
  BIO_COMPLETED: "/UserDetails/UserEnterAbout",
  LOCATION_COMPLETED: "/UserDetails/UserEnableLocation",
  AVOID_SOMEONE_COMPLETED: "/UserDetails/AvoidSomeone",
  PROFILE_COMPLETE: "/(user)/swipe",
};

export default function Index() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const onboardingStep = await AsyncStorage.getItem("onboardingStep");
        const lastVisitedRoute = await AsyncStorage.getItem("lastVisitedRoute");

        // 1. Agar user logged in nahi hai -> Login Screen
        if (!token) {
          setTarget("/login");
          return;
        }

        // 2. Location Permission Status Check (Sabse Pehle)
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status !== "granted") {
          // System me Location Permission ENABLED nahi hai -> Direct Location Screen
          setTarget("/UserDetails/UserEnableLocation");
          return;
        }

        // 3. Location Enabled hai -> Onboarding Step or Last Visited Route
        const safeLastRoute =
          lastVisitedRoute &&
          lastVisitedRoute !== "/login" &&
          lastVisitedRoute !== "/index" &&
          lastVisitedRoute !== "/UserDetails/UserEnableLocation"
            ? lastVisitedRoute
            : null;

        // Route fallback logic
        const nextTarget =
          safeLastRoute ||
          ROUTE_MAP[onboardingStep] ||
          "/(user)/swipe";

        setTarget(nextTarget);
      } catch (error) {
        console.error("Bootstrap auth error:", error);
        setTarget("/login");
      }
    };

    restoreSession();
  }, []);

  if (!target) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF4D8D" />
      </View>
    );
  }

  return <Redirect href={target} />;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D0B14",
  },
});
// import { Stack } from "expo-router";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { Provider } from "react-redux";
// import store from "../Store/store";

// export default function RootLayout() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <Provider store={store}>
//         <Stack
//           //initialRouteName="DistancePreference"
//           screenOptions={{
//             headerShown: false,
//             animation: "none",
//             animationDuration: 200,
//           }}
//         >
//           <Stack.Screen name="index" />
//           <Stack.Screen name="login" />
//           <Stack.Screen name="EnterName" />
//           <Stack.Screen name="EnterDOB" />
//           <Stack.Screen name="ChooseGender" />
//           <Stack.Screen name="UserDetails/WhoInterested" />
//           <Stack.Screen name="UserDetails/DistancePreference" />
//           <Stack.Screen name="UserDetails/LookingRelationship" />
//           <Stack.Screen name="UserDetails/StudyingPage" />
//           <Stack.Screen name="UserDetails/UsersFirstPageLifestyle" />
//           <Stack.Screen name="UserDetails/UsersSecondPageLifeStyle" />
//           <Stack.Screen name="UserDetails/AuthenticityAtracts/CommunicateStyleFirstPage" />
//           <Stack.Screen name="UserDetails/AuthenticityAtracts/CommunicateSecondPage" />
//           <Stack.Screen name="UserDetails/AuthenticityAtracts/ComunicateThirdPage" />
//           <Stack.Screen name="UserDetails/UserPhoto" />
//           <Stack.Screen name="EmailOTPVerify" />
//           <Stack.Screen name="UserDetails/UserEnableLocation" />
//           <Stack.Screen name="UserDetails/UserEnterAbout" />


//           <Stack.Screen name="Welcomepage" />
//           <Stack.Screen name="UserDetails/UserNotCompleteProfile" />
//           <Stack.Screen name="(user)" />
//         </Stack>
//       </Provider>
//     </GestureHandlerRootView>
//   );
// }


import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { View } from "react-native";
import store from "../Store/store";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000000" }}>
      <Provider store={store}>
        {/* Outer view container to completely block white flash during transitions */}
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
          <Stack
            screenOptions={{
              headerShown: false,
              // Dark background for screens
              contentStyle: { backgroundColor: "#000000" },
              // Smooth iOS & Android slide transition
              animation: "slide_from_right",
              animationDuration: 220,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="EnterName" />
            <Stack.Screen name="EnterDOB" />
            <Stack.Screen name="ChooseGender" />
            <Stack.Screen name="EmailOTPVerify" />
            <Stack.Screen name="UserDetails/WhoInterested" />
            <Stack.Screen name="UserDetails/DistancePreference" />
            <Stack.Screen name="UserDetails/LookingRelationship" />
            <Stack.Screen name="UserDetails/StudyingPage" />
            <Stack.Screen name="UserDetails/UsersFirstPageLifestyle" />
            <Stack.Screen name="UserDetails/UsersSecondPageLifeStyle" />
            <Stack.Screen name="UserDetails/AuthenticityAtracts/CommunicateStyleFirstPage" />
            <Stack.Screen name="UserDetails/AuthenticityAtracts/CommunicateSecondPage" />
            <Stack.Screen name="UserDetails/AuthenticityAtracts/ComunicateThirdPage" />
            <Stack.Screen name="UserDetails/UserPhoto" />
            <Stack.Screen name="UserDetails/UserEnterAbout" />
            <Stack.Screen name="UserDetails/UserEnableLocation" />
            <Stack.Screen name="UserDetails/AvoidSomeone" />
            <Stack.Screen name="UserDetails/UserNotCompleteProfile" />
            <Stack.Screen name="UserDetails/FaceVerification" />
            <Stack.Screen name="Welcomepage" />
            <Stack.Screen name="(user)" />
          </Stack>
        </View>
      </Provider>
    </GestureHandlerRootView>
  );
}
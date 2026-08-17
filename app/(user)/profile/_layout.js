import { Stack } from "expo-router";
import { View } from "react-native";

export default function ProfileStackLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
          animation: "slide_from_right",
          animationDuration: 220,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="EditProfile" />
        <Stack.Screen name="SuperLikes" />
        <Stack.Screen name="Boosts" />
        <Stack.Screen name="Subscriptions" />
        
        {/* Settings Screen slide down effect for smooth back */}
        <Stack.Screen
          name="Settings"
          options={{
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </View>
  );
}
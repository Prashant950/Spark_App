import React from "react";
import { Tabs } from "expo-router";
import { StyleSheet, Platform, View } from "react-native";
import {
  FontAwesome5,
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export default function UserTabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#FFFFFF",
          tabBarInactiveTintColor: "#8E8E93",
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          // Tab change hote waqt white screen flicker rokne ke liye
          sceneContainerStyle: { backgroundColor: "#000000" },
        }}
      >
        {/* 1. Swipe Tab */}
        <Tabs.Screen
          name="swipe"
          options={{
            title: "Swipe",
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name="fire"
                size={26}
                color={focused ? "#FF4081" : color}
              />
            ),
          }}
        />

        {/* 2. Explore Tab */}
        {/* <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="compass"
                size={24}
                color={focused ? "#FF4081" : color}
              />
            ),
          }}
        /> */}

        {/* 3. Likes Tab */}
        <Tabs.Screen
          name="likes"
          options={{
            title: "Likes",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "heart" : "heart-outline"}
                size={24}
                color={focused ? "#FF4081" : color}
              />
            ),
          }}
        />

        {/* 4. Chat Tab */}
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={24}
                color={focused ? "#FF4081" : color}
              />
            ),
          }}
        />

        {/* 5. Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <FontAwesome5
                name={focused ? "user-alt" : "user"}
                size={20}
                color={focused ? "#FF4081" : color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#0D0B14",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    height: Platform.OS === "ios" ? 88 : 68,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    paddingTop: 8,
    position: "absolute", // Seamless card overlay ke liye
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});
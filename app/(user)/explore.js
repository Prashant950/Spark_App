// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   Modal,
//   ImageBackground,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   Ionicons,
//   Feather,
//   MaterialCommunityIcons,
//   FontAwesome5,
// } from "@expo/vector-icons";


// // Mock profiles associated with categories
// const MOCK_PROFILES = [
//   {
//     id: 1,
//     name: "San",
//     age: 31,
//     distance: "13 miles away",
//     image:
//       "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
//     active: true,
//   },
//   {
//     id: 2,
//     name: "Riya",
//     age: 26,
//     distance: "5 miles away",
//     image:
//       "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
//     active: true,
//   },
// ];

// export default function ExploreScreen() {
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

//   // Explore Category Cards Data from Video
//   const categories = [
//     {
//       id: "long_term",
//       title: "Long-term partner",
//       count: "2K",
//       icon: <MaterialCommunityIcons name="flower" size={44} color="#FF4081" />,
//     },
//     {
//       id: "serious",
//       title: "Serious commitment",
//       count: "1K",
//       icon: <Ionicons name="diamond" size={40} color="#E040FB" />,
//     },
//     {
//       id: "free_tonight",
//       title: "Free tonight",
//       count: "1K",
//       icon: <Ionicons name="moon" size={40} color="#40C4FF" />,
//     },
//     {
//       id: "short_fun",
//       title: "Short-term fun",
//       count: "890",
//       icon: <MaterialCommunityIcons name="heart-flash" size={42} color="#FF5252" />,
//     },
//     {
//       id: "new_friends",
//       title: "New friends",
//       count: "1K",
//       icon: <MaterialCommunityIcons name="hand-wave" size={40} color="#FF80AB" />,
//     },
//     {
//       id: "non_monogamous",
//       title: "Non-monogamous",
//       count: "1K",
//       icon: <MaterialCommunityIcons name="fruit-pineapple" size={42} color="#FFAB40" />,
//     },
//     {
//       id: "photo_verified",
//       title: "Get photo verified",
//       count: "2K",
//       icon: <MaterialCommunityIcons name="shield-check" size={44} color="#00E5FF" />,
//     },
//     {
//       id: "wants_kids",
//       title: "Wants kids",
//       count: "252",
//       icon: <MaterialCommunityIcons name="teddy-bear" size={42} color="#FF4081" />,
//     },
//     {
//       id: "child_free",
//       title: "Child-free",
//       count: "122",
//       icon: <Ionicons name="cloud" size={40} color="#80D8FF" />,
//     },
//     {
//       id: "travel",
//       title: "Travel",
//       count: "881",
//       icon: <Ionicons name="paper-plane" size={40} color="#EA80FC" />,
//     },
//     {
//       id: "binge_watchers",
//       title: "Binge watchers",
//       count: "1K",
//       icon: <Feather name="tv" size={38} color="#FF4081" />,
//     },
//     {
//       id: "sporty",
//       title: "Sporty",
//       count: "901",
//       icon: <MaterialCommunityIcons name="bottle-tonic-outline" size={40} color="#40C4FF" />,
//     },
//     {
//       id: "coffee_date",
//       title: "Coffee date",
//       count: "888",
//       icon: <FontAwesome5 name="coffee" size={36} color="#FF80AB" />,
//     },
//     {
//       id: "date_night",
//       title: "Date night",
//       count: "1K",
//       icon: <FontAwesome5 name="glass-cheers" size={36} color="#E040FB" />,
//     },
//     {
//       id: "thrill_seekers",
//       title: "Thrill seekers",
//       count: "1K",
//       icon: <FontAwesome5 name="dice" size={38} color="#FF5252" />,
//     },
//     {
//       id: "creatives",
//       title: "Creatives",
//       count: "2K",
//       icon: <Ionicons name="pin" size={40} color="#FF4081" />,
//     },
//     {
//       id: "foodies",
//       title: "Foodies",
//       count: "2K",
//       icon: <Ionicons name="nutrition" size={40} color="#FF80AB" />,
//     },
//     {
//       id: "nature_lovers",
//       title: "Nature lovers",
//       count: "1K",
//       icon: <MaterialCommunityIcons name="sprout" size={42} color="#69F0AE" />,
//     },
//   ];

//   const handleCardPress = (category) => {
//     setSelectedCategory(category);
//     setCurrentProfileIndex(0);
//   };

//   const handleCloseModal = () => {
//     setSelectedCategory(null);
//   };

//   const currentProfile = MOCK_PROFILES[currentProfileIndex];

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

//       {/* Top Section Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerSubtitle}>
//           Find people with similar relationship goals
//         </Text>
//       </View>

//       {/* Categories Grid Area */}
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.gridContainer}>
//           {categories.map((cat) => (
//             <TouchableOpacity
//               key={cat.id}
//               activeOpacity={0.8}
//               onPress={() => handleCardPress(cat)}
//               style={styles.categoryCard}
//             >
//               {/* Glossy Icon Center Container */}
//               <View style={styles.iconContainer}>{cat.icon}</View>

//               {/* Title & Count Row */}
//               <View style={styles.cardFooter}>
//                 <Text style={styles.categoryTitle} numberOfLines={2}>
//                   {cat.title}
//                 </Text>
//                 <Text style={styles.categoryCount}>{cat.count}</Text>
//               </View>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>

//       {/* CATEGORY SWIPE MODAL (Opens Swipe View when a card is clicked) */}
//       <Modal
//         visible={selectedCategory !== null}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={handleCloseModal}
//       >
//         <SafeAreaView style={styles.modalContainer}>
//           <StatusBar barStyle="light-content" backgroundColor="#000000" />

//           {/* Modal Header Bar */}
//           <View style={styles.modalHeader}>
//             <TouchableOpacity
//               style={styles.modalCloseButton}
//               onPress={handleCloseModal}
//               activeOpacity={0.7}
//             >
//               <Feather name="x" size={22} color="#FFFFFF" />
//             </TouchableOpacity>

//             <Text style={styles.modalCategoryTitle}>
//               {selectedCategory?.title}
//             </Text>

//             <View style={{ width: 40 }} />
//           </View>

//           {/* Profile Card View */}
//           <View style={styles.cardContainer}>
//             <ImageBackground
//               source={{ uri: currentProfile?.image }}
//               style={styles.cardImage}
//               imageStyle={{ borderRadius: 20 }}
//             >
//               {/* Header Dashes */}
//               <View style={styles.cardHeaderControls}>
//                 <View style={styles.dashIndicators}>
//                   <View style={[styles.dash, styles.activeDash]} />
//                   <View style={styles.dash} />
//                   <View style={styles.dash} />
//                 </View>
//               </View>

//               {/* Profile Info Overlay */}
//               <View style={styles.cardDetailsOverlay}>
//                 {currentProfile?.active && (
//                   <View style={styles.activeBadge}>
//                     <View style={styles.activeDot} />
//                     <Text style={styles.activeText}>Recently active</Text>
//                   </View>
//                 )}

//                 <View style={styles.nameRow}>
//                   <Text style={styles.userName}>
//                     {currentProfile?.name} {currentProfile?.age}
//                   </Text>
//                   <TouchableOpacity style={styles.upArrowButton}>
//                     <Feather name="arrow-up-right" size={22} color="#FFFFFF" />
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.locationRow}>
//                   <Ionicons name="location-outline" size={18} color="#FFFFFF" />
//                   <Text style={styles.locationText}>
//                     {currentProfile?.distance}
//                   </Text>
//                 </View>

//                 {/* Dislike & Like Buttons */}
//                 <View style={styles.actionButtonsRow}>
//                   <TouchableOpacity
//                     style={styles.dislikeCircle}
//                     activeOpacity={0.8}
//                     onPress={() => {
//                       if (currentProfileIndex < MOCK_PROFILES.length - 1) {
//                         setCurrentProfileIndex(currentProfileIndex + 1);
//                       } else {
//                         handleCloseModal();
//                       }
//                     }}
//                   >
//                     <Ionicons name="close" size={32} color="#FFFFFF" />
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={styles.likeCircle}
//                     activeOpacity={0.8}
//                     onPress={() => {
//                       if (currentProfileIndex < MOCK_PROFILES.length - 1) {
//                         setCurrentProfileIndex(currentProfileIndex + 1);
//                       } else {
//                         handleCloseModal();
//                       }
//                     }}
//                   >
//                     <Ionicons name="heart" size={34} color="#FF2A55" />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </ImageBackground>
//           </View>
//         </SafeAreaView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#0D0B14",
//   },

//   // Header Text
//   header: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#A1A1AA",
//   },

//   // Scroll Grid Layout
//   scrollContent: {
//     paddingHorizontal: 14,
//     paddingBottom: 24,
//   },
//   gridContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     rowGap: 14,
//     marginBottom: 60,
//   },

//   // Category Cards
//   categoryCard: {
//     width: "48%", // 2 Cards per row
//     height: 180,
//     borderRadius: 22,
//     backgroundColor: "rgba(255, 255, 255, 0.05)",
//     borderWidth: 1.5,
//     borderColor: "rgba(255, 255, 255, 0.12)",
//     padding: 14,
//     justifyContent: "space-between",
//   },
//   iconContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cardFooter: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     justifyContent: "space-between",
//   },
//   categoryTitle: {
//     flex: 1,
//     fontSize: 15,
//     fontWeight: "800",
//     color: "#FFFFFF",
//     lineHeight: 18,
//     paddingRight: 6,
//   },
//   categoryCount: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#A1A1AA",
//   },

//   // Modal Screen Styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "#000000",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   modalCloseButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalCategoryTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#FFFFFF",
//   },

//   // Swipe Card in Modal
//   cardContainer: {
//     flex: 1,
//     marginHorizontal: 12,
//     marginBottom: 16,
//   },
//   cardImage: {
//     flex: 1,
//     justifyContent: "space-between",
//   },
//   cardHeaderControls: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//   },
//   dashIndicators: {
//     flexDirection: "row",
//     gap: 6,
//   },
//   dash: {
//     flex: 1,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "rgba(255, 255, 255, 0.4)",
//   },
//   activeDash: {
//     backgroundColor: "#FFFFFF",
//   },

//   cardDetailsOverlay: {
//     paddingHorizontal: 16,
//     paddingBottom: 20,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   activeBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 255, 255, 0.9)",
//     alignSelf: "flex-start",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginBottom: 10,
//   },
//   activeDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#10B981",
//     marginRight: 6,
//   },
//   activeText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#000000",
//   },
//   nameRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   userName: {
//     fontSize: 32,
//     fontWeight: "900",
//     color: "#FFFFFF",
//   },
//   upArrowButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 4,
//     marginBottom: 20,
//   },
//   locationText: {
//     fontSize: 16,
//     color: "#FFFFFF",
//     fontWeight: "600",
//     marginLeft: 6,
//   },

//   actionButtonsRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 28,
//   },
//   dislikeCircle: {
//     width: 68,
//     height: 68,
//     borderRadius: 34,
//     backgroundColor: "rgba(255, 255, 255, 0.18)",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: "rgba(255, 255, 255, 0.3)",
//   },
//   likeCircle: {
//     width: 68,
//     height: 68,
//     borderRadius: 34,
//     backgroundColor: "rgba(255, 255, 255, 0.18)",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: "rgba(255, 255, 255, 0.3)",
//   },
// });
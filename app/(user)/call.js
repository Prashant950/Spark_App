// import React, { useEffect, useState, useRef } from "react";
// import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
// import createAgoraRtcEngine, { RtcSurfaceView, ChannelProfileType, ClientRoleType } from "react-native-agora";
// import { Ionicons } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";

// const AGORA_APP_ID = "YOUR_AGORA_APP_ID"; // Agora Console se milega

// export default function CallScreen() {
//   const { channelName, callType } = useLocalSearchParams(); // callType: 'video' | 'audio'
//   const [joined, setJoined] = useState(false);
//   const [remoteUid, setRemoteUid] = useState(null);
//   const engineRef = useRef(null);
//   const router = useRouter();

//   useEffect(() => {
//     initAgora();
//     return () => {
//       engineRef.current?.release();
//     };
//   }, []);

//   const initAgora = async () => {
//     try {
//       const engine = createAgoraRtcEngine();
//       engineRef.current = engine;

//       engine.initialize({ appId: AGORA_APP_ID });

//       engine.registerEventHandler({
//         onJoinChannelSuccess: () => setJoined(true),
//         onUserJoined: (_connection, uid) => setRemoteUid(uid),
//         onUserOffline: () => {
//           setRemoteUid(null);
//           router.back();
//         },
//       });

//       if (callType === "video") {
//         engine.enableVideo();
//         engine.startPreview();
//       } else {
//         engine.enableAudio();
//       }

//       engine.joinChannel("", channelName, 0, {
//         clientRoleType: ClientRoleType.ClientRoleBroadcaster,
//         channelProfile: ChannelProfileType.ChannelProfileCommunication,
//       });
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const endCall = () => {
//     engineRef.current?.leaveChannel();
//     router.back();
//   };

//   return (
//     <View style={styles.container}>
//       {/* Remote User Stream (Video Call) */}
//       {callType === "video" && remoteUid ? (
//         <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.remoteVideo} />
//       ) : (
//         <View style={styles.audioContainer}>
//           <Ionicons name="person-circle" size={120} color="#8696A0" />
//           <Text style={styles.callingText}>In Call...</Text>
//         </View>
//       )}

//       {/* Self Local Video (In Overlay Corner) */}
//       {callType === "video" && joined && (
//         <RtcSurfaceView canvas={{ uid: 0 }} style={styles.localVideo} />
//       )}

//       {/* Call Action Controls (End Call Button) */}
//       <View style={styles.controlsBar}>
//         <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
//           <Ionicons name="call" size={28} color="#FFFFFF" style={{ transform: [{ rotate: "135deg" }] }} />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#0B141A" },
//   remoteVideo: { flex: 1, width: "100%", height: "100%" },
//   localVideo: { width: 100, height: 150, position: "absolute", top: 40, right: 20, borderRadius: 12 },
//   audioContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   callingText: { color: "#FFFFFF", fontSize: 18, marginTop: 20 },
//   controlsBar: { position: "absolute", bottom: 40, left: 0, right: 0, alignItems: "center" },
//   endCallBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FF3040", justifyContent: "center", alignItems: "center" },
// });
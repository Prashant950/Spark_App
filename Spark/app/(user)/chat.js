import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Modal,
  Alert,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useLocalSearchParams, useRouter } from "expo-router";
import { storage } from "../../features/authSlice";
import {
  useGetOrCreateConversationQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useSendMediaMessageMutation,
  useGetUserConversationsQuery,
} from "../../services/apiSlice";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

export default function ChatScreen() {
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [storedAuthUser, setStoredAuthUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetUserId = params?.userId;
  const quickEmojiOptions = ["😊", "😂", "😍", "👍", "🔥", "🎉", "❤️", "👋"];

  // Logged-in User Data from Redux Store
  const authUser = useSelector((state) => state.auth?.user);
  const resolvedAuthUser = authUser || storedAuthUser;
  const currentUserId = resolvedAuthUser
    ? String(resolvedAuthUser._id ?? resolvedAuthUser.id ?? "") || null
    : null;

  useEffect(() => {
    if (authUser) return;

    storage.getItem("user").then((userJson) => {
      if (!userJson) return;
      try {
        setStoredAuthUser(JSON.parse(userJson));
      } catch (error) {
        console.error("Unable to restore stored chat user:", error);
      }
    });
  }, [authUser]);

  const getUserId = (user) => {
    if (!user) return null;
    if (typeof user === "string") return user;
    if (typeof user === "object") {
      const objectId = user._id ?? user.id ?? user.$oid;
      return objectId ? String(objectId) : null;
    }
    return null;
  };

  const getOtherParticipant = (participants = [], userId) => {
    if (!userId || !Array.isArray(participants)) return null;
    return participants.find((participant) => {
      const participantId = getUserId(participant);
      return participantId && participantId !== userId;
    }) || null;
  };

  // 1. Fetch Conversations List for Inbox Screen
  const {
    data: convosListData,
    isLoading: convosLoading,
    refetch: refetchConvosList,
  } = useGetUserConversationsQuery(undefined, {
    pollingInterval: 2000,
  });

  // 2. Fetch Single Conversation for Chat Room
  const {
    data: convoData,
    isLoading: convoLoading,
    refetch: refetchConvo,
  } = useGetOrCreateConversationQuery(targetUserId, { skip: !targetUserId });

  const conversationId = convoData?.conversation?._id;

  // 3. Fetch Messages Query
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetMessagesQuery(conversationId, {
    skip: !conversationId,
    pollingInterval: 2000,
  });

  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const [sendMediaMessage] = useSendMediaMessageMutation();
  const flatListRef = useRef(null);

  useEffect(() => {
    if (targetUserId) {
      refetchConvo?.();
    }
    refetchConvosList?.();
  }, [targetUserId, currentUserId, refetchConvo, refetchConvosList]);

  // Back button handler to exit chat room and refresh list
  const handleCloseChat = () => {
    router.setParams({ userId: "" });
    refetchConvosList?.();
  };

  const sortedConversations = useMemo(() => {
    return (convosListData?.conversations || []).slice().sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [convosListData?.conversations]);

  // Get target user details for top header
  const targetUser =
    getOtherParticipant(convoData?.conversation?.participants, currentUserId) ||
    (convoData?.conversation?.participants || []).find(
      (p) => getUserId(p) === String(targetUserId)
    );

  const sendChatPayload = async ({
    text = "",
    messageType = "text",
    mediaUrl = "",
    fileName = "",
    location = null,
  }) => {
    if (!targetUserId || !conversationId) return false;

    try {
      const payload = {
        conversationId,
        receiverId: targetUserId,
        text,
        messageType,
      };

      if (mediaUrl) payload.mediaUrl = mediaUrl;
      if (fileName) payload.fileName = fileName;
      if (location) payload.location = location;

      if (messageType === "image" || messageType === "document") {
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append("receiverId", targetUserId);
        formData.append("messageType", messageType);
        formData.append("text", text || (messageType === "image" ? "📷 Photo" : "📄 Document"));
        formData.append("media", {
          uri: mediaUrl,
          name: fileName || `spark-${Date.now()}.${messageType === "image" ? "jpg" : "pdf"}`,
          type: messageType === "image" ? "image/jpeg" : "application/pdf",
        });
        await sendMediaMessage(formData).unwrap();
      } else {
        await sendMessage(payload).unwrap();
      }

      await refetchMessages?.();
      await refetchConvosList?.();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return true;
    } catch (err) {
      console.error("Send message failed:", err);
      Alert.alert("Message not sent", "Something went wrong while sending your message.");
      return false;
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !targetUserId) return;

    const textToSend = messageText.trim();
    setMessageText("");
    setShowEmojiPicker(false);

    await sendChatPayload({
      text: textToSend,
      messageType: "text",
    });
  };

  const handleEmojiPress = (emoji) => {
    setMessageText((prev) => `${prev}${emoji}`);
    setShowEmojiPicker(false);
  };

  const handleOpenAttachmentMenu = () => {
    setShowAttachmentMenu((prev) => !prev);
    setShowEmojiPicker(false);
  };

  const handleImagePick = async (mode = "library") => {
    try {
      setShowAttachmentMenu(false);
      const permissionResult = mode === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== "granted") {
        Alert.alert("Permission required", "Please allow access to choose a photo first.");
        return;
      }

      const result = mode === "camera"
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
            base64: true,
          });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const mediaUrl = asset.base64 && asset.uri ? `data:image/jpeg;base64,${asset.base64}` : asset.uri || "";

      await sendChatPayload({
        text: "📷 Photo",
        messageType: "image",
        mediaUrl,
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      Alert.alert("Unable to open camera/gallery", "Please try again.");
    }
  };

  const handleDocumentPick = async () => {
    try {
      setShowAttachmentMenu(false);
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      await sendChatPayload({
        text: "📄 Document",
        messageType: "document",
        fileName: file.name,
        mediaUrl: file.uri,
      });
    } catch (error) {
      console.error("Document pick failed:", error);
      Alert.alert("Document not attached", "Please try another file.");
    }
  };

  const handleShareLocation = async () => {
    try {
      setShowAttachmentMenu(false);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Location permission needed", "Allow location access to share your current place.");
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      await sendChatPayload({
        text: "📍 Live location",
        messageType: "location",
        location: {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
        },
      });
    } catch (error) {
      console.error("Location share failed:", error);
      Alert.alert("Location not shared", "Unable to fetch your current location right now.");
    }
  };

  const openLocationInMaps = (location) => {
    if (!location?.latitude || !location?.longitude) return;

    const lat = Number(location.latitude);
    const lng = Number(location.longitude);
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url);
  };

  const openDocument = async (item) => {
    const fileUrl = item?.mediaUrl || item?.uri;
    if (!fileUrl) {
      Alert.alert("No file", "This document could not be opened.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(fileUrl);
      if (!supported) {
        Alert.alert("Open failed", "This file type cannot be opened on this device.");
        return;
      }
      await Linking.openURL(fileUrl);
    } catch (error) {
      console.error("Open document failed:", error);
      Alert.alert("Open failed", "Unable to open this document right now.");
    }
  };

  const openAttachment = (item) => {
    if (!item) return;

    if (item.messageType === "image" && item.mediaUrl) {
      setSelectedImage(item.mediaUrl);
      return;
    }

    if (item.messageType === "document") {
      openDocument(item);
      return;
    }

    if (item.messageType === "location") {
      openLocationInMaps(item.location);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessageStatus = (item) => {
    if (item.isRead) {
      return (
        <MaterialCommunityIcons
          name="check-all"
          size={16}
          color="#34B7F1"
          style={styles.tickIcon}
        />
      );
    } else {
      return (
        <MaterialCommunityIcons
          name="check"
          size={15}
          color="#8696A0"
          style={styles.tickIcon}
        />
      );
    }
  };

  // 🟢 VIEW 1: DEDICATED CHAT ROOM MODAL (Jab kisi Card/Swipe User par click ho)
  if (targetUserId) {
    return (
      <Modal visible={true} animationType="fade" 
      transparent={true} statusBarTranslucent={true}
      onRequestClose={handleCloseChat}>
        <Modal
          visible={!!selectedImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.imagePreviewOverlay}>
            <TouchableOpacity style={styles.closeImageButton} onPress={() => setSelectedImage(null)}>
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Image source={{ uri: selectedImage }} style={styles.fullImagePreview} resizeMode="contain" />
          </View>
        </Modal>
        <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.chatRoomContainer} edges={["top", "bottom"]}>
          <StatusBar barStyle="light-content" backgroundColor="#0B141A" translucent />

          {/* Top Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={handleCloseChat} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Image
              source={{
                uri: targetUser?.photos?.[0]?.url || "https://via.placeholder.com/100",
              }}
              style={styles.headerAvatar}
            />

            <View style={styles.headerUserInfo}>
              <Text style={styles.headerUserName} numberOfLines={1}>
                {targetUser?.fullName || "Spark Match"}
              </Text>
              <Text style={styles.onlineText}>online</Text>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.headerIconBtn}>
                <Ionicons name="videocam" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn}>
                <Ionicons name="call" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn}>
                <Feather name="more-vertical" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages Body */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
          >
            <View style={styles.chatFlexContainer}>
              {convoLoading || messagesLoading ? (
                <View style={styles.centerLoader}>
                  <ActivityIndicator size="large" color="#00A884" />
                  <Text style={styles.loaderText}>Loading messages...</Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messagesData?.messages || []}
                  keyExtractor={(item, index) => item._id || String(index)}
                  onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                  onLayout={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                  contentContainerStyle={styles.messagesListContent}
                  ListEmptyComponent={
                    <View style={styles.emptyChatBox}>
                      <Image
                        source={{
                          uri: targetUser?.photos?.[0]?.url || "https://via.placeholder.com/150",
                        }}
                        style={styles.emptyChatAvatar}
                      />
                      <Text style={styles.emptyChatTitle}>
                        You matched with {targetUser?.fullName || "User"}
                      </Text>
                      <Text style={styles.emptyChatSub}>Say Hi 👋 to break the ice!</Text>
                    </View>
                  }
                  renderItem={({ item }) => {
                    const senderId = getUserId(item.sender);
                    const isMe = senderId && currentUserId && senderId === currentUserId;
                    const mediaType = item.messageType || "text";

                    return (
                      <View
                        style={[
                          styles.messageBubbleWrapper,
                          isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper,
                        ]}
                      >
                        <TouchableOpacity
                          activeOpacity={0.9}
                          onPress={() => openAttachment(item)}
                          style={[
                            styles.messageBubble,
                            isMe ? styles.myBubble : styles.theirBubble,
                            mediaType !== "text" && styles.mediaBubble,
                          ]}
                        >
                          {mediaType === "image" && item.mediaUrl ? (
                            <Image source={{ uri: item.mediaUrl }} style={styles.messageMedia} />
                          ) : null}

                          {mediaType === "document" && item.fileName ? (
                            <View style={styles.fileCard}>
                              <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                              <Text style={styles.fileText} numberOfLines={2}>{item.fileName}</Text>
                            </View>
                          ) : null}

                          {mediaType === "location" && item.location ? (
                            <View style={styles.locationCard}>
                              <Ionicons name="location" size={18} color="#FFFFFF" />
                              <Text style={styles.locationText}>
                                {item.location.latitude?.toFixed?.(4) ?? item.location.latitude}, {item.location.longitude?.toFixed?.(4) ?? item.location.longitude}
                              </Text>
                            </View>
                          ) : null}

                          {item.text ? <Text style={styles.msgText}>{item.text}</Text> : null}
                          <View style={styles.metaRow}>
                            <Text style={styles.timestampText}>
                              {formatTime(item.createdAt)}
                            </Text>
                            {isMe && renderMessageStatus(item)}
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
              )}

              {/* Clean Single Text Input Bar */}
              <View style={styles.bottomInputBar}>
                {showEmojiPicker && (
                  <View style={styles.emojiPicker}>
                    {quickEmojiOptions.map((emoji) => (
                      <TouchableOpacity key={emoji} onPress={() => handleEmojiPress(emoji)} style={styles.emojiItem}>
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {showAttachmentMenu && (
                  <View style={styles.attachmentMenu}>
                    <TouchableOpacity style={styles.attachmentItem} onPress={() => handleImagePick("camera")}>
                      <Ionicons name="camera" size={20} color="#FFFFFF" />
                      <Text style={styles.attachmentLabel}>Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachmentItem} onPress={() => handleImagePick("library")}>
                      <Ionicons name="images" size={20} color="#FFFFFF" />
                      <Text style={styles.attachmentLabel}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachmentItem} onPress={handleDocumentPick}>
                      <Ionicons name="document-text" size={20} color="#FFFFFF" />
                      <Text style={styles.attachmentLabel}>Document</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachmentItem} onPress={handleShareLocation}>
                      <Ionicons name="location" size={20} color="#FFFFFF" />
                      <Text style={styles.attachmentLabel}>Location</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.inputCard}>
                  <TouchableOpacity style={styles.inputInnerBtn} onPress={handleOpenAttachmentMenu}>
                    <Feather name="plus" size={22} color="#8696A0" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.inputInnerBtn} onPress={() => setShowEmojiPicker((prev) => !prev)}>
                    <FontAwesome5 name="smile" size={20} color="#8696A0" />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.chatInput}
                    placeholder="Message"
                    placeholderTextColor="#8696A0"
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.sendIconButton,
                    !messageText.trim() && styles.sendDisabled,
                  ]}
                  disabled={!messageText.trim() || sending}
                  onPress={handleSend}
                >
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
        </View>
      </Modal>
    );
  }

  // 🟢 VIEW 2: CHAT TAB INBOX LIST (Filter out self user strictly)
  const conversations = sortedConversations.filter((item) => {
    const otherUser = getOtherParticipant(item.participants, currentUserId);
    if (!otherUser) return false;
    if (!searchQuery.trim()) return true;
    return otherUser.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerIconsRow}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Feather name="shield" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages"
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations Cards List */}
      <View style={styles.messagesContainer}>
        {convosLoading ? (
          <ActivityIndicator size="small" color="#FF4081" style={{ marginTop: 20 }} />
        ) : conversations.length === 0 ? (
          <View style={styles.emptyInboxBox}>
            <Feather name="message-square" size={48} color="#8E8E93" />
            <Text style={styles.emptyInboxTitle}>No Messages Yet</Text>
            <Text style={styles.emptyInboxSub}>
              Swipe profiles and tap chat icon to start a conversation!
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const participants = item.participants || [];
              if (!currentUserId) return null;

              const otherUser = getOtherParticipant(participants, currentUserId);
              const otherUserId = getUserId(otherUser);

              if (!otherUser || typeof otherUser !== "object" || !otherUserId) return null;
              if (otherUserId === currentUserId) return null;

              return (
                <TouchableOpacity
                  key={item._id}
                  activeOpacity={0.8}
                  style={styles.messageRow}
                  onPress={() => router.setParams({ userId: otherUserId })}
                >
                  <Image
                    source={{
                      uri: otherUser.photos?.[0]?.url || "https://via.placeholder.com/100",
                    }}
                    style={styles.userListAvatar}
                  />

                  <View style={styles.messageContent}>
                    <View style={styles.nameRow}>
                      <Text style={styles.senderName}>{otherUser.fullName}</Text>
                      {(item.updatedAt || item.createdAt) && (
                        <Text style={styles.timeText}>
                          {formatTime(item.updatedAt || item.createdAt)}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {item.lastMessage || "Tap to chat 👋"}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={18} color="#8E8E93" />
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0B14" },
  chatRoomContainer: { flex: 1, backgroundColor: "#0B141A" },
  chatFlexContainer: { flex: 1, justifyContent: "space-between" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 20, 26, 0.98)", // App ka main theme color
  },
  headerTitle: { fontSize: 32, fontWeight: "900", color: "#FFFFFF" },
  headerIconsRow: { flexDirection: "row", alignItems: "center" },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#1F2C34",
  },
  backButton: { paddingRight: 6 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  headerUserInfo: { flex: 1 },
  headerUserName: { fontSize: 16, fontWeight: "700", color: "#E9EDEF" },
  onlineText: { fontSize: 12, color: "#8696A0" },
  headerRightActions: { flexDirection: "row", alignItems: "center" },
  headerIconBtn: { paddingHorizontal: 8 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#FFFFFF", fontSize: 16 },
  messagesContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    flex: 1,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  userListAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  messageContent: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingRight: 8,
  },
  senderName: { fontSize: 17, fontWeight: "800", color: "#FFFFFF" },
  timeText: { fontSize: 12, color: "#8696A0" },
  lastMessage: { fontSize: 14, color: "#A1A1AA" },
  centerLoader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: { color: "#8696A0", marginTop: 10 },
  messagesListContent: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 16 },
  emptyChatBox: { alignItems: "center", justifyContent: "center", marginTop: 60, paddingHorizontal: 20 },
  emptyChatAvatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 16 },
  emptyChatTitle: { color: "#E9EDEF", fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptyChatSub: { color: "#8696A0", fontSize: 14, textAlign: "center", marginTop: 6 },
  emptyInboxBox: { alignItems: "center", justifyContent: "center", marginTop: 50 },
  emptyInboxTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginTop: 12 },
  emptyInboxSub: { color: "#8E8E93", fontSize: 14, textAlign: "center", marginTop: 6 },
  messageBubbleWrapper: { marginVertical: 4, width: "100%", flexDirection: "row" },
  myBubbleWrapper: { justifyContent: "flex-end" },
  theirBubbleWrapper: { justifyContent: "flex-start" },
  messageBubble: { maxWidth: "78%", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, borderRadius: 12 },
  myBubble: { backgroundColor: "#005C4B", borderTopRightRadius: 2, alignSelf: "flex-end" },
  theirBubble: { backgroundColor: "#202C33", borderTopLeftRadius: 2, alignSelf: "flex-start" },
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImagePreview: {
    width: "100%",
    height: "80%",
  },
  closeImageButton: {
    position: "absolute",
    top: 40,
    right: 16,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  msgText: { color: "#E9EDEF", fontSize: 15, lineHeight: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 2 },
  timestampText: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginRight: 2 },
  tickIcon: { marginLeft: 2 },
  bottomInputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#0B141A",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  inputCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#202C33",
    borderRadius: 24,
    paddingHorizontal: 6,
    marginRight: 8,
    minHeight: 44,
  },
  inputInnerBtn: { padding: 8 },
  chatInput: { flex: 1, color: "#E9EDEF", fontSize: 16, maxHeight: 100, paddingVertical: 6, paddingHorizontal: 6 },
  emojiPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#1F2C34",
    borderRadius: 18,
    padding: 8,
    marginBottom: 8,
    marginHorizontal: 6,
  },
  emojiItem: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: { fontSize: 24 },
  attachmentMenu: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1F2C34",
    borderRadius: 18,
    padding: 10,
    marginBottom: 8,
    marginHorizontal: 6,
  },
  attachmentItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    minWidth: 72,
  },
  attachmentLabel: {
    marginTop: 6,
    color: "#E9EDEF",
    fontSize: 11,
  },
  sendIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00A884",
    justifyContent: "center",
    alignItems: "center",
  },
  sendDisabled: { backgroundColor: "rgba(0, 168, 132, 0.4)" },
  mediaBubble: { padding: 4, overflow: "hidden" },
  messageMedia: {
    width: 220,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    maxWidth: 220,
  },
  fileText: {
    color: "#FFFFFF",
    fontSize: 13,
    marginLeft: 8,
    flexShrink: 1,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    maxWidth: 230,
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginLeft: 8,
    flexShrink: 1,
  },
});
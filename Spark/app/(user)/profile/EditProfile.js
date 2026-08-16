import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useUploadPhotosMutation,
} from "../../../services/apiSlice";

export default function EditProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("edit");
  const [smartPhotos, setSmartPhotos] = useState(true);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [genderMenuOpen, setGenderMenuOpen] = useState(false);
  const [relationshipMenuOpen, setRelationshipMenuOpen] = useState(false);
  const [petsMenuOpen, setPetsMenuOpen] = useState(false);
  const [drinkingMenuOpen, setDrinkingMenuOpen] = useState(false);
  const [workoutMenuOpen, setWorkoutMenuOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const genderOptions = ["Man", "Woman", "Beyond Binary"];
  const relationshipOptions = [
    "Long-term partner",
    "Long-term, open to short",
    "Short-term, open to long",
    "Short-term fun",
    "New friends",
    "Still figuring it out",
  ];
  const petsOptions = ["Dog", "Cat", "Reptile", "Amphibian", "Bird", "Fish", "Don't have, but love", "Other", "No pets"];
  const drinkingOptions = ["Not for me", "Newly teetotal", "Sober curious", "On special occasions", "Socially, at the weekend", "Most nights"];
  const workoutOptions = ["Every day", "Often", "Sometimes", "Never"];

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("Man");
  const [bio, setBio] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [lookingFor, setLookingFor] = useState("Long-term partner");
  const [pets, setPets] = useState("Dog");
  const [drinking, setDrinking] = useState("Sober curious");
  const [workout, setWorkout] = useState("Every day");
  const [photos, setPhotos] = useState([]);
  const [pendingLocalPhotos, setPendingLocalPhotos] = useState([]);

  const { data: profileData, isLoading: isFetching, refetch } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [uploadPhotosApi, { isLoading: isUploadingPhotos }] = useUploadPhotosMutation();

  const displayPhotos = [...photos, ...pendingLocalPhotos];
  const previewPhoto = displayPhotos[previewIndex] || "https://via.placeholder.com/400";

  const formatDateDisplay = (value) => {
    if (!value) return "";
    if (value.includes("/")) return value;

    const asDate = new Date(value);
    if (Number.isNaN(asDate.getTime())) return value;

    return asDate.toLocaleDateString("en-GB");
  };

  const parseDateInput = (input) => {
    const digits = input.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const handleDatePickerChange = (event, selectedDate) => {
    if (event?.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      const nextDate = new Date(selectedDate);
      const formatted = `${String(nextDate.getDate()).padStart(2, "0")}/${String(
        nextDate.getMonth() + 1,
      ).padStart(2, "0")}/${nextDate.getFullYear()}`;
      setBirthDate(formatted);
    }

    setShowDatePicker(false);
  };

  const normalizeDateForAPI = (value) => {
    if (!value || !value.includes("/")) return value;

    const [day, month, year] = value.split("/");
    if (!day || !month || !year) return value;

    const parsed = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toISOString();
  };

  const getAge = (dateVal) => {
    if (!dateVal) return 24;

    const normalized = dateVal.includes("/")
      ? (() => {
          const [day, month, year] = dateVal.split("/");
          return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        })()
      : new Date(dateVal);

    if (Number.isNaN(normalized.getTime())) return 24;

    const ageDiff = Date.now() - normalized.getTime();
    return Math.abs(new Date(ageDiff).getUTCFullYear() - 1970) || 24;
  };

  useEffect(() => {
    if (profileData) {
      const user = profileData.profile || profileData.user || profileData;
      setFullName(user.fullName || user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || user.phoneNumber || "");
      setBirthDate(formatDateDisplay(user.birthDate || user.dob || ""));
      setGender(user.gender || "Man");
      setBio(user.bio || "");
      setJobTitle(user.jobTitle || "");
      setCompany(user.company || "");
      setLookingFor(user.relationshipGoal || user.lookingFor || "Long-term partner");
      setSmartPhotos(user.smartPhotos ?? true);

      if (user.photos && Array.isArray(user.photos)) {
        setPhotos(user.photos.map((p) => (typeof p === "string" ? p : p.url)));
      }
      if (user.lifestyle) {
        setPets(user.lifestyle.pets || "Dog");
        setDrinking(user.lifestyle.drinking || "Sober curious");
        setWorkout(user.lifestyle.workout || "Every day");
      }
    }
  }, [profileData]);

  useEffect(() => {
    if (previewIndex > displayPhotos.length - 1 && displayPhotos.length > 0) {
      setPreviewIndex(0);
    }
  }, [displayPhotos.length, previewIndex]);

  const handlePickImage = async () => {
    const remainingSlots = 9 - displayPhotos.length;
    if (remainingSlots <= 0) {
      Alert.alert("Limit Reached", "You can upload a maximum of 9 photos.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera roll permission is needed to pick photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
    });

    if (!result.canceled && result.assets?.length) {
      const selectedUris = result.assets
        .map((asset) => asset.uri)
        .filter(Boolean)
        .slice(0, remainingSlots);

      if (selectedUris.length > 0) {
        setPendingLocalPhotos((prev) => [...prev, ...selectedUris]);
      }
    }
  };

  const handleRemovePhoto = (index) => {
    if (index < photos.length) {
      setPhotos((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    const localIndex = index - photos.length;
    setPendingLocalPhotos((prev) => prev.filter((_, i) => i !== localIndex));
  };

  const normalizePhotoObject = (photo) => {
    if (typeof photo === "string") {
      return { url: photo, public_id: "" };
    }

    if (photo && typeof photo === "object") {
      const url = photo.url || photo.secure_url;
      if (typeof url === "string") {
        return { url, public_id: photo.public_id || "" };
      }
    }

    return null;
  };

  const handleSave = async () => {
    try {
      let uploadedPhotoObjects = [];

      if (pendingLocalPhotos.length > 0) {
        const formData = new FormData();

        pendingLocalPhotos.forEach((photoUri, idx) => {
          const fileName = photoUri.split("/").pop() || `profile-${Date.now()}-${idx}.jpg`;
          formData.append("photos", {
            uri: photoUri,
            name: fileName,
            type: "image/jpeg",
          });
        });

        const uploadResponse = await uploadPhotosApi(formData).unwrap();
        uploadedPhotoObjects = Array.isArray(uploadResponse?.photos)
          ? uploadResponse.photos
              .map((photo) => normalizePhotoObject(photo))
              .filter(Boolean)
          : [];
      }

      const existingPhotoObjects = photos
        .map((photo) => normalizePhotoObject(photo))
        .filter(Boolean);

      const mergedPhotos = [...existingPhotoObjects, ...uploadedPhotoObjects];

      await updateProfile({
        fullName,
        email,
        phoneNumber: phone,
        birthDate: normalizeDateForAPI(birthDate),
        gender,
        bio,
        jobTitle,
        company,
        relationshipGoal: lookingFor,
        photos: mergedPhotos,
        lifestyle: { pets, drinking, workout },
        smartPhotos,
      }).unwrap();

      setPhotos((prev) => [...prev, ...uploadedPhotoObjects.map((photo) => photo.url)]);
      setPendingLocalPhotos([]);
      refetch();
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", err?.data?.message || err?.message || "Failed to update profile.");
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF4081" />
        <Text style={{ color: "#A1A1AA", marginTop: 12 }}>Loading saved profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0B14" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving || isUploadingPhotos}
          style={styles.saveHeaderBtn}
        >
          {isSaving || isUploadingPhotos ? (
            <ActivityIndicator size="small" color="#FF4081" />
          ) : (
            <Text style={styles.saveHeaderText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Edit / Preview Segmented Tab Bar */}
      <View style={styles.segmentedTabBar}>
        <TouchableOpacity
          style={[styles.segTab, activeTab === "edit" && styles.segTabActive]}
          onPress={() => setActiveTab("edit")}
          activeOpacity={0.8}
        >
          <Text style={[styles.segTabText, activeTab === "edit" && styles.segTabTextActive]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segTab, activeTab === "preview" && styles.segTabActive]}
          onPress={() => setActiveTab("preview")}
          activeOpacity={0.8}
        >
          <Text style={[styles.segTabText, activeTab === "preview" && styles.segTabTextActive]}>
            Preview
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: EDIT MODE */}
      {activeTab === "edit" ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Media Header */}
          <Text style={styles.sectionTitle}>Media</Text>
          <Text style={styles.sectionSub}>
            Add up to 9 photos. Use prompts to share your personality.
          </Text>
          <Text style={styles.tipLink}>Stand out with our photo tips</Text>

          {/* 3x3 Photo Grid */}
          <View style={styles.photoGrid}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
              const photoUri = displayPhotos[index];

              return (
                <View key={index} style={styles.gridSlotWrapper}>
                  {photoUri ? (
                    <View style={styles.photoBox}>
                      <Image source={{ uri: photoUri }} style={styles.photoImg} />
                      <TouchableOpacity
                        style={styles.deleteBadge}
                        onPress={() => handleRemovePhoto(index)}
                      >
                        <Ionicons name="close" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.emptyBox}
                      onPress={handlePickImage}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={24} color="#A1A1AA" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.addMoreButton, displayPhotos.length >= 9 && styles.addMoreButtonDisabled]}
            activeOpacity={0.8}
            onPress={handlePickImage}
            disabled={displayPhotos.length >= 9}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FF4081" />
            <Text style={styles.addMoreButtonText}>Add images</Text>
          </TouchableOpacity>

          {/* Smart Photos Option */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Smart Photos</Text>
              <Text style={styles.rowSub}>
                Smart Photos continuously tests all your profile photos to find the best one.
              </Text>
            </View>
            <Switch
              value={smartPhotos}
              onValueChange={setSmartPhotos}
              trackColor={{ false: "#3A3A3C", true: "#FF4081" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Basic Account Info */}
          <View style={styles.fieldSection}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            <View style={styles.selectRow}>
              <Text style={styles.selectRowLabel}>Full Name</Text>
              <TextInput
                style={styles.inlineInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your Name"
                placeholderTextColor="#71717A"
              />
            </View>
            <View style={styles.selectRow}>
              <Text style={styles.selectRowLabel}>Email</Text>
              <TextInput
                style={styles.inlineInput}
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor="#71717A"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.selectRow}>
              <Text style={styles.selectRowLabel}>Phone</Text>
              <TextInput
                style={styles.inlineInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91..."
                placeholderTextColor="#71717A"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.selectRow}>
              <View style={styles.selectRowLeft}>
                <Text style={styles.selectRowLabel}>Date of Birth</Text>
              </View>
              <View style={styles.dateFieldContainer}>
                <TextInput
                  style={styles.inlineInput}
                  value={birthDate}
                  onChangeText={(text) => setBirthDate(parseDateInput(text))}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#71717A"
                  keyboardType="numeric"
                  maxLength={10}
                  onFocus={() => setShowDatePicker(true)}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <Feather name="calendar" size={16} color="#A1A1AA" style={styles.calendarIcon} />
                </TouchableOpacity>
              </View>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={
                  birthDate
                    ? (() => {
                        const [day, month, year] = birthDate.split("/");
                        if (day && month && year) {
                          return new Date(Number(year), Number(month) - 1, Number(day));
                        }
                        return new Date();
                      })()
                    : new Date()
                }
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={handleDatePickerChange}
              />
            )}
            <View style={styles.fieldSelectWrap}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.selectRow}
                onPress={() => setGenderMenuOpen((prev) => !prev)}
              >
                <Text style={styles.selectRowLabel}>Gender</Text>
                <View style={styles.valueWithChevron}>
                  <Text style={styles.inlineInput}>{gender}</Text>
                  <Feather name={genderMenuOpen ? "chevron-up" : "chevron-down"} size={18} color="#A1A1AA" />
                </View>
              </TouchableOpacity>
              {genderMenuOpen && (
                <View style={styles.optionList}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionItem, gender === option && styles.optionItemSelected]}
                      onPress={() => {
                        setGender(option);
                        setGenderMenuOpen(false);
                      }}
                    >
                      <Text style={[styles.optionText, gender === option && styles.optionTextSelected]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* About Me Input */}
          <View style={styles.fieldSection}>
            <Text style={styles.sectionTitle}>About me</Text>
            <View style={styles.textareaWrapper}>
              <TextInput
                style={styles.textarea}
                value={bio}
                onChangeText={setBio}
                multiline
                maxLength={500}
                placeholder="Tell something about yourself..."
                placeholderTextColor="#71717A"
              />
              <Text style={styles.charCounter}>{500 - bio.length}</Text>
            </View>
            <Text style={styles.tipLink}>{"Quick About me tips"}</Text>
          </View>

          {/* Work & Company */}
          <View style={styles.fieldSection}>
            <Text style={styles.sectionTitle}>Work & Education</Text>
            <View style={styles.selectRow}>
              <Text style={styles.selectRowLabel}>Job Title</Text>
              <TextInput
                style={styles.inlineInput}
                value={jobTitle}
                onChangeText={setJobTitle}
                placeholder="Software Engineer..."
                placeholderTextColor="#71717A"
              />
            </View>
            <View style={styles.selectRow}>
              <Text style={styles.selectRowLabel}>Company</Text>
              <TextInput
                style={styles.inlineInput}
                value={company}
                onChangeText={setCompany}
                placeholder="Google, Infosys..."
                placeholderTextColor="#71717A"
              />
            </View>
          </View>

          {/* Relationship Goals Section */}
          <View style={styles.fieldSection}>
            <Text style={styles.sectionTitle}>Relationship Goals</Text>
            <View style={styles.fieldSelectWrap}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.selectRow}
                onPress={() => setRelationshipMenuOpen((prev) => !prev)}
              >
                <View style={styles.selectRowLeft}>
                  <Ionicons name="eye-outline" size={20} color="#A1A1AA" />
                  <Text style={styles.selectRowLabel}>Looking for</Text>
                </View>
                <View style={styles.valueWithChevron}>
                  <Text style={styles.inlineInput}>{lookingFor}</Text>
                  <Feather name={relationshipMenuOpen ? "chevron-up" : "chevron-down"} size={18} color="#A1A1AA" />
                </View>
              </TouchableOpacity>
              {relationshipMenuOpen && (
                <View style={styles.optionList}>
                  {relationshipOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionItem, lookingFor === option && styles.optionItemSelected]}
                      onPress={() => {
                        setLookingFor(option);
                        setRelationshipMenuOpen(false);
                      }}
                    >
                      <Text style={[styles.optionText, lookingFor === option && styles.optionTextSelected]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Lifestyle Items */}
          <View style={styles.fieldSection}>
            <Text style={styles.sectionTitle}>Lifestyle</Text>

            <View style={styles.fieldSelectWrap}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.selectRow}
                onPress={() => setPetsMenuOpen((prev) => !prev)}
              >
                <View style={styles.selectRowLeft}>
                  <Ionicons name="paw-outline" size={20} color="#A1A1AA" />
                  <Text style={styles.selectRowLabel}>Pets</Text>
                </View>
                <View style={styles.valueWithChevron}>
                  <Text style={styles.inlineInput}>{pets}</Text>
                  <Feather name={petsMenuOpen ? "chevron-up" : "chevron-down"} size={18} color="#A1A1AA" />
                </View>
              </TouchableOpacity>
              {petsMenuOpen && (
                <View style={styles.optionList}>
                  {petsOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionItem, pets === option && styles.optionItemSelected]}
                      onPress={() => {
                        setPets(option);
                        setPetsMenuOpen(false);
                      }}
                    >
                      <Text style={[styles.optionText, pets === option && styles.optionTextSelected]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldSelectWrap}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.selectRow}
                onPress={() => setDrinkingMenuOpen((prev) => !prev)}
              >
                <View style={styles.selectRowLeft}>
                  <Ionicons name="wine-outline" size={20} color="#A1A1AA" />
                  <Text style={styles.selectRowLabel}>Drinking</Text>
                </View>
                <View style={styles.valueWithChevron}>
                  <Text style={styles.inlineInput}>{drinking}</Text>
                  <Feather name={drinkingMenuOpen ? "chevron-up" : "chevron-down"} size={18} color="#A1A1AA" />
                </View>
              </TouchableOpacity>
              {drinkingMenuOpen && (
                <View style={styles.optionList}>
                  {drinkingOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionItem, drinking === option && styles.optionItemSelected]}
                      onPress={() => {
                        setDrinking(option);
                        setDrinkingMenuOpen(false);
                      }}
                    >
                      <Text style={[styles.optionText, drinking === option && styles.optionTextSelected]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldSelectWrap}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.selectRow}
                onPress={() => setWorkoutMenuOpen((prev) => !prev)}
              >
                <View style={styles.selectRowLeft}>
                  <Ionicons name="fitness-outline" size={20} color="#A1A1AA" />
                  <Text style={styles.selectRowLabel}>Workout</Text>
                </View>
                <View style={styles.valueWithChevron}>
                  <Text style={styles.inlineInput}>{workout}</Text>
                  <Feather name={workoutMenuOpen ? "chevron-up" : "chevron-down"} size={18} color="#A1A1AA" />
                </View>
              </TouchableOpacity>
              {workoutMenuOpen && (
                <View style={styles.optionList}>
                  {workoutOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionItem, workout === option && styles.optionItemSelected]}
                      onPress={() => {
                        setWorkout(option);
                        setWorkoutMenuOpen(false);
                      }}
                    >
                      <Text style={[styles.optionText, workout === option && styles.optionTextSelected]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        /* TAB 2: PREVIEW MODE (Real Synced Data) */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewCard}>
            <Image source={{ uri: previewPhoto }} style={styles.previewImg} />

            {displayPhotos.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.previewArrow, styles.previewArrowLeft]}
                  onPress={() => setPreviewIndex((prev) => (prev === 0 ? displayPhotos.length - 1 : prev - 1))}
                >
                  <Feather name="chevron-left" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.previewArrow, styles.previewArrowRight]}
                  onPress={() => setPreviewIndex((prev) => (prev + 1) % displayPhotos.length)}
                >
                  <Feather name="chevron-right" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.previewDotsWrap}>
                  {displayPhotos.map((_, index) => (
                    <View
                      key={index}
                      style={[styles.previewDot, index === previewIndex && styles.previewDotActive]}
                    />
                  ))}
                </View>
              </>
            )}

            <View style={styles.previewOverlay}>
              <Text style={styles.previewName}>
                {fullName || "User"}, {getAge(birthDate)}
              </Text>
              {jobTitle ? (
                <Text style={styles.previewJobText}>
                  💼 {jobTitle} {company ? `at ${company}` : ""}
                </Text>
              ) : null}
              <Text style={styles.previewBio}>{bio || "No bio added."}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0B14" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  saveHeaderBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  saveHeaderText: { color: "#FF4081", fontWeight: "800", fontSize: 16 },

  segmentedTabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  segTab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  segTabActive: { borderBottomWidth: 2, borderBottomColor: "#FF4081" },
  segTabText: { fontSize: 16, fontWeight: "700", color: "#8E8E93" },
  segTabTextActive: { color: "#FFFFFF" },

  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 80 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF", marginBottom: 6 },
  sectionSub: { fontSize: 14, color: "#A1A1AA", lineHeight: 20 },
  tipLink: { fontSize: 14, fontWeight: "700", color: "#4FC3F7", marginTop: 8, marginBottom: 16 },

  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginVertical: 12,
  },
  gridSlotWrapper: { width: "31%", aspectRatio: 3 / 4 },
  photoBox: { width: "100%", height: "100%", borderRadius: 14, overflow: "visible" },
  photoImg: { width: "100%", height: "100%", borderRadius: 14 },
  deleteBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  emptyBox: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 64, 129, 0.45)",
    backgroundColor: "rgba(255, 64, 129, 0.08)",
  },
  addMoreButtonDisabled: {
    opacity: 0.5,
  },
  addMoreButtonText: {
    color: "#FF4081",
    fontWeight: "700",
    fontSize: 15,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  rowTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  rowSub: { fontSize: 13, color: "#A1A1AA", marginTop: 4, paddingRight: 10 },

  fieldSection: { marginTop: 16 },
  textareaWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  textarea: { fontSize: 16, color: "#FFFFFF", minHeight: 80 },
  charCounter: { textAlign: "right", color: "#A1A1AA", fontSize: 12 },

  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  fieldSelectWrap: { marginTop: 8 },
  selectRowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  selectRowLabel: { fontSize: 15, fontWeight: "600", color: "#FFFFFF", flexShrink: 1 },
  valueWithChevron: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, justifyContent: "flex-end" },
  dateFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    minWidth: 0,
  },
  calendarIcon: { marginLeft: 8 },
  inlineInput: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF4081",
    textAlign: "right",
    flexShrink: 1,
    minWidth: 0,
    marginLeft: 16,
  },
  optionList: {
    backgroundColor: "rgba(22, 19, 32, 0.98)",
    borderRadius: 14,
    marginTop: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  optionItemSelected: {
    backgroundColor: "rgba(255, 64, 129, 0.12)",
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: "#FF4081",
  },

  previewCard: {
    borderRadius: 20,
    overflow: "hidden",
    height: 500,
    position: "relative",
    backgroundColor: "#161320",
  },
  previewImg: { width: "100%", height: "100%", resizeMode: "cover" },
  previewArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.36)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  previewArrowLeft: { left: 12 },
  previewArrowRight: { right: 12 },
  previewDotsWrap: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    gap: 8,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  previewDotActive: {
    backgroundColor: "#FF4081",
    width: 18,
  },
  previewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  previewName: { fontSize: 28, fontWeight: "900", color: "#FFFFFF" },
  previewJobText: { fontSize: 14, color: "#FFD700", fontWeight: "700", marginTop: 4 },
  previewBio: { fontSize: 15, color: "#E0E0E0", marginTop: 6 },
});
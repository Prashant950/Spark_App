const User = require("../models/User");


exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No photos uploaded" });
    }

    const normalizedPhotos = req.files.map((file) => ({
      url: file.path || file.secure_url,
      public_id: file.filename || file.public_id || "",
    }));

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.photos = [...(user.photos || []), ...normalizedPhotos];
    await user.save();

    res.status(200).json({ success: true, photos: user.photos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDOB = async (req, res) => {
  try {
    const dob = req.body?.dob ?? req.body?.selectedDate;

    if (!dob) {
      return res.status(400).json({ success: false, message: "DOB is required" });
    }

    const birthDate = new Date(dob);

    if (isNaN(birthDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format." });
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: "You must be at least 18 years old.",
      });
    }

    let user = await User.findById(req.user._id);

    if (user) {
      user.birthDate = birthDate;
      user.age = age;
      user.onboardingStep = "DOB_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        birthDate,
        age,
        onboardingStep: "DOB_COMPLETED",
      });
    }

    res.status(200).json({
      success: true,
      message: "DOB saved successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateDOB:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGender = async (req, res) => {
  try {
    const rawGender = req.body?.gender;
    const inputGender = typeof rawGender === "string" ? rawGender.trim() : "";

    const normalizedGenderMap = {
      man: "Man",
      woman: "Woman",
      "beyond binary": "Beyond Binary",
      "beyond_binary": "Beyond Binary",
      "non-binary": "Beyond Binary",
      "nonbinary": "Beyond Binary",
    };

    const normalizedGender =
      normalizedGenderMap[inputGender.toLowerCase()] || inputGender;

    const validGenders = ["Man", "Woman", "Beyond Binary"];

    if (!normalizedGender || !validGenders.includes(normalizedGender)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid gender option.",
      });
    }

    let user = await User.findById(req.user._id);

    if (user) {
      user.gender = normalizedGender;
      user.onboardingStep = "GENDER_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        gender: normalizedGender,
        onboardingStep: "GENDER_COMPLETED",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gender saved successfully!",
      onboardingStep: user.onboardingStep,
      user,
    });
  } catch (error) {
    console.error("Error in updateGender controller:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateWhoInterested = async (req, res) => {
  try {
    const rawPreference = req.body?.showMe ?? req.body?.interestedIn;
    const showMe = typeof rawPreference === "string" ? rawPreference.trim() : "";

    const validPreferences = ["Men", "Women", "Beyond Binary", "Everyone"];
    if (!showMe || !validPreferences.includes(showMe)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid preference (Men, Women, Beyond Binary, or Everyone).",
      });
    }

    let user = await User.findById(req.user._id);

    if (user) {
      user.showMe = showMe;
      user.interestedIn = showMe;
      user.onboardingStep = "SHOW_ME_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        showMe,
        interestedIn: showMe,
        onboardingStep: "SHOW_ME_COMPLETED",
      });
    }

    res.status(200).json({
      success: true,
      message: "Preference saved successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateShowMe controller:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateDistancePreference = async (req, res) => {
  try {
    const distancePreference =
      req.body?.distancePreference ?? req.body?.distance ?? req.body?.maxDistance;
    const { latitude, longitude } = req.body;

    const parsedDistance = Number(distancePreference);

    if (!Number.isFinite(parsedDistance) || parsedDistance < 2) {
      return res.status(400).json({
        success: false,
        message: "Please specify a valid distance preference (min 2 km).",
      });
    }

    let locationData = undefined;
    if (latitude !== undefined && longitude !== undefined) {
      locationData = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    let user = await User.findById(req.user._id);

    if (user) {
      user.distancePreference = parsedDistance;
      if (locationData) {
        user.location = locationData;
      }
      user.onboardingStep = "DISTANCE_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        distancePreference: parsedDistance,
        location: locationData,
        onboardingStep: "DISTANCE_COMPLETED",
      });
    }

    res.status(200).json({
      success: true,
      message: "Distance preference and location updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateDistancePreference:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateRelationshipGoal = async (req, res) => {
  try {
    const { relationshipGoal } = req.body;

    // 1. Valid Relationship Goals List
    const validGoals = [
      "Long-term partner",
      "Long-term, open to short",
      "Short-term, open to long",
      "Short-term fun",
      "New friends",
      "Still figuring it out",
    ];

    // 2. Validation Check
    if (!relationshipGoal || !validGoals.includes(relationshipGoal)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid relationship goal option.",
      });
    }

    // 3. Upsert Logic (User Search -> Update or Create)
    let user = await User.findById(req.user._id);

    if (user) {
      user.relationshipGoal = relationshipGoal;
      user.onboardingStep = "RELATIONSHIP_GOAL_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        relationshipGoal,
        onboardingStep: "RELATIONSHIP_GOAL_COMPLETED",
      });
    }

    // 4. Response
    res.status(200).json({
      success: true,
      message: "Relationship goal updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateRelationshipGoal:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCollege = async (req, res) => {
  try {
    const { college } = req.body; // Expected string e.g. "Delhi University" ya empty string agar user skip kar raha ho

    const collegeName = college ? college.trim() : "";

    // Upsert Logic (User Search -> Update or Create)
    let user = await User.findById(req.user._id);

    if (user) {
      user.college = collegeName;
      user.onboardingStep = "STUDYING_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        college: collegeName,
        onboardingStep: "STUDYING_COMPLETED",
      });
    }

    res.status(200).json({
      success: true,
      message: "College/University updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateCollege controller:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateLifestyle = async (req, res) => {
  try {
    const { drinking, smoking, workout, pets } = req.body;

    // 1. Lifestyle object construct karein
    const lifestyleData = {
      drinking: drinking || "",
      smoking: smoking || "",
      workout: workout || "",
      pets: pets || "",
    };

    // 2. Upsert Logic (User exists -> Update, Else -> Create)
    let user = await User.findById(req.user._id);

    if (user) {
      user.lifestyle = {
        ...user.lifestyle,
        ...lifestyleData,
      };
      user.onboardingStep = "LIFESTYLE_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        lifestyle: lifestyleData,
        onboardingStep: "LIFESTYLE_COMPLETED",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lifestyle habits updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateLifestyle controller:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateInterests = async (req, res) => {
  try {
    const { interests, Interests } = req.body; // Expected Array of strings e.g. ["Drone photography", "Chess", "Coding"]
    const incomingInterests = Array.isArray(interests)
      ? interests
      : Array.isArray(Interests)
        ? Interests
        : null;

    // 1. Validation
    if (!incomingInterests) {
      return res.status(400).json({
        success: false,
        message: "Interests must be an array of selected options.",
      });
    }

    // Clean duplicate or empty strings
    const cleanedInterests = [
      ...new Set(
        incomingInterests.filter((item) => typeof item === "string" && item.trim() !== "")
      ),
    ];

    // 2. Upsert Logic (User exists -> Update, Else -> Create)
    let user = await User.findById(req.user._id);

    if (user) {
      user.interests = cleanedInterests;
      user.onboardingStep = "INTERESTS_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        interests: cleanedInterests,
        onboardingStep: "INTERESTS_COMPLETED",
      });
    }

    // 3. Success Response
    res.status(200).json({
      success: true,
      message: "Interests and hobbies updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateInterests controller:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateVibePreferences = async (req, res) => {
  try {
    const { vibePreferences } = req.body;

    if (!Array.isArray(vibePreferences)) {
      return res.status(400).json({
        success: false,
        message: "Vibe preferences must be an array.",
      });
    }

    const cleanedPreferences = [
      ...new Set(
        vibePreferences.filter(
          (item) => typeof item === "string" && item.trim() !== ""
        )
      ),
    ];

    let user = await User.findById(req.user._id);

    if (user) {
      user.vibePreferences = cleanedPreferences;
      user.onboardingStep = "ESSENTIALS_COMMUNICATION_STYLE_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        vibePreferences: cleanedPreferences,
        onboardingStep: "ESSENTIALS_COMMUNICATION_STYLE_COMPLETED",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vibe preferences updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateVibePreferences controller:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateEssentialsAndCommunicationStyle = async (req, res) => {
  try {
    const { communicationStyle, musicPreference, interests } = req.body;

    // Upsert Logic (User exists -> Update, Else -> Create)
    let user = await User.findById(req.user._id);

    const updateData = {
      communicationStyle: Array.isArray(communicationStyle) ? communicationStyle : [],
      musicPreference: musicPreference || "",
      interests: Array.isArray(interests) ? interests : [],
      onboardingStep: "MUSIC_PREFERENCE_COMPLETED",
    };

    if (user) {
      user.communicationStyle = updateData.communicationStyle;
      user.musicPreference = updateData.musicPreference;
      user.interests = updateData.interests;
      user.onboardingStep = updateData.onboardingStep;
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        ...updateData,
      });
    }

    res.status(200).json({
      success: true,
      message: "Interests and communication style updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateInterestsAndStyle:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePersonalityReceivedLOVE = async (req, res) => {
  try {
    const { communicationStyle, loveLanguage, education } = req.body;

    // 1. Prepare update object
    const updateData = {
      communicationStyle: communicationStyle || "",
      loveLanguage: loveLanguage || "",
      education: education || "",
      onboardingStep: "ESSENTIALS_COMMUNICATION_STYLE_COMPLETED3",
    };

    // 2. Upsert Logic (Update if exists, else create)
    let user = await User.findById(req.user._id);

    if (user) {
      user.communicationStyle = updateData.communicationStyle;
      user.loveLanguage = updateData.loveLanguage;
      user.education = updateData.education;
      user.onboardingStep = updateData.onboardingStep;
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        ...updateData,
      });
    }

    res.status(200).json({
      success: true,
      message: "Personality details updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updatePersonalityDetails controller:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCreativityInterests = async (req, res) => {
  try {
    const { passions } = req.body;

    // 1. Validation
    if (!Array.isArray(passions)) {
      return res.status(400).json({
        success: false,
        message: "Passions must be an array.",
      });
    }

    if (passions.length > 10) {
      return res.status(400).json({
        success: false,
        message: "You can select up to 10 interests only.",
      });
    }

    // 2. Prepare update payload
    const updateData = {
      passions: passions || [],
      onboardingStep: "CREATIVITY_COMPLETED",
    };

    // 3. Upsert Logic
    let user = await User.findById(req.user._id);

    if (user) {
      user.passions = updateData.passions;
      user.onboardingStep = updateData.onboardingStep;
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        ...updateData,
      });
    }

    res.status(200).json({
      success: true,
      message: "Passions updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateCreativityInterests controller:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadUserPhotos = async (req, res) => {
  try {
    const files = req.files;

    // 1. Minimum 7 photos validation
    if (!files || files.length < 7) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least 7 photos to proceed.",
      });
    }

    // 2. Extract Cloudinary URLs & Public IDs from multer-storage-cloudinary
    const photoData = files.map((file) => ({
      url: file.path || file.secure_url,
      public_id: file.filename || file.public_id || "",
    }));

    // 3. Upsert User in MongoDB
    let user = await User.findById(req.user._id);

    if (user) {
      user.photos = photoData;
      user.onboardingStep = "PHOTOS_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        photos: photoData,
        onboardingStep: "PHOTOS_COMPLETED",
      });
    }

    res.status(200).json({
      success: true,
      message: "Photos uploaded successfully to Cloudinary!",
      user,
    });
  } catch (error) {
    console.error("Error in uploadUserPhotos controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload photos",
    });
  }
};

exports.updateBio = async (req, res) => {
  try {
    const { bio } = req.body;

    const bioText = bio ? bio.trim() : "";

    // 1. Validation: Max 500 characters
    if (bioText.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Bio cannot exceed 500 characters.",
      });
    }

    // 2. Prepare payload
    const updateData = {
      bio: bioText,
      onboardingStep: "BIO_COMPLETED",
    };

    // 3. Upsert Logic (User exists -> Update, Else -> Create)
    let user = await User.findById(req.user._id);

    if (user) {
      user.bio = updateData.bio;
      user.onboardingStep = updateData.onboardingStep;
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        ...updateData,
      });
    }

    res.status(200).json({
      success: true,
      message: "Bio updated successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateBio controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update bio.",
    });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required.",
      });
    }

    const locationData = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)], // GeoJSON format: [Lng, Lat]
    };

    let user = await User.findById(req.user._id);

    if (user) {
      user.location = locationData;
      user.onboardingStep = "LOCATION_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        location: locationData,
        onboardingStep: "LOCATION_COMPLETED",
      });
    }

    res.status(200).json({
      success: true,
      message: "Location saved successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in updateLocation controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update location.",
    });
  }
};

exports.completeAvoidSomeone = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);

    if (user) {
      user.onboardingStep = "AVOID_SOMEONE_COMPLETED";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        onboardingStep: "AVOID_SOMEONE_COMPLETED",
      });
    }

    res.status(200).json({
      success: true,
      message: "Avoid someone step recorded successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in completeAvoidSomeone:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Profile Complete / Face Verification Skip (Maybe Later)
exports.completeOnboarding = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);

    if (user) {
      user.onboardingStep = "PROFILE_COMPLETE";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        onboardingStep: "PROFILE_COMPLETE",
      });
    }

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in completeOnboarding:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyFaceStatus = async (req, res) => {
  try {
    const file = req.file; // Multer Cloudinary storage file

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Live selfie image is required for verification.",
      });
    }

    const selfieData = {
      url: file.path || file.secure_url,
      public_id: file.filename, // multer-storage-cloudinary public_id
    };

    let user = await User.findById(req.user._id);

    if (user) {
      user.isVerified = true;
      user.verificationSelfie = selfieData;
      user.isPhotoSelfiVerified = true; // Mark selfie verification as true
      user.onboardingStep = "PROFILE_COMPLETE";
      await user.save();
    } else {
      user = await User.create({
        _id: req.user._id,
        isVerified: true,
        isPhotoSelfiVerified: true,
        verificationSelfie: selfieData,
        onboardingStep: "PROFILE_COMPLETE",
      });
    }

    res.status(200).json({
      success: true,
      message: "Face verification completed and selfie saved successfully!",
      user,
    });
  } catch (error) {
    console.error("Error in verifyFaceStatus:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Verification upload failed.",
    });
  }
};


// 🟢 1. Get Logged-In User Profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      profile: user,
    });
  } catch (error) {
    console.error("Error in getMyProfile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 2. Update Profile (Bio, Photos, Lifestyle, Work, Relationship Goals)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      bio,
      jobTitle,
      company,
      relationshipGoal,
      photos,
      lifestyle,
      smartPhotos,
      location,
      gender,
      birthDate,
      fullName,
      phone,
      phoneNumber,
      email,
    } = req.body;

    const updatedFields = {};

    if (fullName !== undefined) updatedFields.fullName = fullName;
    if (email !== undefined) updatedFields.email = email;
    if (phoneNumber !== undefined || phone !== undefined) {
      updatedFields.phoneNumber = phoneNumber ?? phone;
    }
    if (bio !== undefined) updatedFields.bio = bio;
    if (jobTitle !== undefined) updatedFields.jobTitle = jobTitle;
    if (company !== undefined) updatedFields.company = company;
    if (relationshipGoal !== undefined) updatedFields.relationshipGoal = relationshipGoal;

    if (photos !== undefined) {
      updatedFields.photos = Array.isArray(photos)
        ? photos
            .map((photo) => {
              if (typeof photo === "string") {
                return { url: photo, public_id: "" };
              }

              if (photo && typeof photo === "object") {
                if (typeof photo.url === "string") {
                  return {
                    url: photo.url,
                    public_id: photo.public_id || "",
                  };
                }

                if (typeof photo.secure_url === "string") {
                  return {
                    url: photo.secure_url,
                    public_id: photo.public_id || "",
                  };
                }
              }

              return null;
            })
            .filter(Boolean)
        : [];
    }

    if (lifestyle !== undefined) updatedFields.lifestyle = lifestyle;
    if (smartPhotos !== undefined) updatedFields.smartPhotos = smartPhotos;
    if (location !== undefined) updatedFields.location = location;
    if (gender !== undefined) updatedFields.gender = gender;
    if (birthDate !== undefined) updatedFields.birthDate = birthDate;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 3. Delete / Deactivate Account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



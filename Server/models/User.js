const mongoose = require("mongoose");
const ROLES = require("../constants/roles");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // 1. AUTHENTICATION & CREDENTIALS
    // ==========================================
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: [ROLES.USER, ROLES.ADMIN],
      default: ROLES.USER,
    },

    // ==========================================
    // 2. VERIFICATION & TRUST
    // ==========================================
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPhotoSelfiVerified: {
      type: Boolean,
      default: false,
    },
    verificationSelfie: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },

    // ==========================================
    // 3. ONBOARDING STATUS
    // ==========================================
    onboardingStep: {
      type: String,
      enum: [
        "EMAIL_VERIFIED",
        "NAME_COMPLETED",
        "DOB_COMPLETED",
        "GENDER_COMPLETED",
        "SHOW_ME_COMPLETED",
        "DISTANCE_COMPLETED",
        "RELATIONSHIP_GOAL_COMPLETED",
        "STUDYING_COMPLETED",
        "LIFESTYLE_COMPLETED",
        "INTERESTS_COMPLETED",
        "MUSIC_PREFERENCE_COMPLETED",
        "ESSENTIALS_COMMUNICATION_STYLE_COMPLETED",
        "ESSENTIALS_COMMUNICATION_STYLE_COMPLETED2",
        "ESSENTIALS_COMMUNICATION_STYLE_COMPLETED3",
        "CREATIVITY_COMPLETED",
        "PHOTOS_COMPLETED",
        "BIO_COMPLETED",
        "LOCATION_COMPLETED",
        "AVOID_SOMEONE_COMPLETED",
        "PROFILE_COMPLETE",
      ],
      default: "EMAIL_VERIFIED",
    },

    // ==========================================
    // 4. BASIC PROFILE INFORMATION
    // ==========================================
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    birthDate: {
      type: Date,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["Man", "Woman", "Beyond binary", ""],
      default: "",
    },
    showMe: {
      type: String,
      default: "",
    },
    interestedIn: {
      type: String,
      enum: ["Men", "Women", "Everyone", ""],
      default: "",
    },
    relationshipGoal: {
      type: String,
      enum: [
        "Long-term partner",
        "Long-term, open to short",
        "Short-term, open to long",
        "Short-term fun",
        "New friends",
        "Still figuring it out",
        "",
      ],
      default: "",
    },

    // ==========================================
    // 5. WORK & EDUCATION
    // ==========================================
    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    college: {
      type: String,
      trim: true,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },

    // ==========================================
    // 6. MEDIA & BIO
    // ==========================================
    photos: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: "" },
      },
    ],
    smartPhotos: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      trim: true,
      maxLength: 500,
      default: "",
    },

    // ==========================================
    // 7. INTERESTS, PASSIONS & VIBES
    // ==========================================
    interests: [{ type: String }],
    passions: [{ type: String }], // Multi-select array (Max 10)
    vibePreferences: [{ type: String }],
    musicPreference: {
      type: String,
      default: "",
    },
    communicationStyle: {
      type: [String],
      default: [],
    },
    loveLanguage: {
      type: String,
      default: "",
    },

    // ==========================================
    // 8. LIFESTYLE HABITS
    // ==========================================
    lifestyle: {
      drinking: {
        type: String,
        enum: [
          "",
          "Not for me",
          "Newly teetotal",
          "Sober curious",
          "On special occasions",
          "Socially, at the weekend",
          "Most nights",
        ],
        default: "",
      },
      smoking: {
        type: String,
        enum: [
          "",
          "Social smoker",
          "Smoker when drinking",
          "Non-smoker",
          "Smoker",
          "Trying to quit",
        ],
        default: "",
      },
      workout: {
        type: String,
        enum: ["", "Every day", "Often", "Sometimes", "Never"],
        default: "",
      },
      pets: {
        type: String,
        enum: [
          "",
          "Dog",
          "Cat",
          "Reptile",
          "Amphibian",
          "Bird",
          "Fish",
          "Don't have, but love",
          "Other",
          "No pets",
        ],
        default: "",
      },
    },

    // ==========================================
    // 9. LOCATION & DISCOVERY SETTINGS
    // ==========================================
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    distancePreference: {
      type: Number,
      default: 50,
      max: 160,
    },
    discoverySettings: {
      global: { type: Boolean, default: false },
      maxDistance: { type: Number, default: 50 },
      distanceUnit: { type: String, enum: ["Km", "Mi"], default: "Km" },
    },

    // ==========================================
    // 10. SOCIAL & MATCHING RELATIONS
    // ==========================================
    likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    superLikedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ==========================================
    // 11. PRIVACY, SAFETY & RESTRICTIONS
    // ==========================================
    blockedContactsCount: {
      type: Number,
      default: 0,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Geo-spatial index for radius/distance calculations
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
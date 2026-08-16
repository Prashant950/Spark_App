const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const ROLES = require("../constants/roles");
const {
  updateProfile,
  uploadPhotos,
  getMyProfile,
  deleteAccount,
  updateDOB,
  updateGender,
  updateWhoInterested,
  updateDistancePreference,
  updateRelationshipGoal,
  updateCollege,
  updateLifestyle,
  updateInterests,
  updateVibePreferences,
  updateEssentialsAndCommunicationStyle,
  updatePersonalityReceivedLOVE,
  updateCreativityInterests,
  uploadUserPhotos,
  updateBio,
  updateLocation,
  completeAvoidSomeone,
  completeOnboarding,
  verifyFaceStatus,
} = require("../controllers/userController");


// PRIVATE USER ROUTES
router.put("/profile", protect, authorize(ROLES.USER, ROLES.ADMIN), updateProfile);
router.post(
  "/upload-photos",
  protect,
  authorize(ROLES.USER),
  upload.array("photos", 9),
  uploadPhotos
);
router.get("/me", protect, authorize(ROLES.USER), getMyProfile);
router.put("/update", protect, authorize(ROLES.USER), updateProfile);
router.delete("/delete", protect, authorize(ROLES.USER), deleteAccount);

router.put("/dob", protect, authorize(ROLES.USER), updateDOB);
router.put("/gender", protect, authorize(ROLES.USER), updateGender);
router.put("/interested-in", protect, authorize(ROLES.USER), updateWhoInterested);
router.put("/distance-preference", protect, authorize(ROLES.USER), updateDistancePreference);
router.put("/relationship-goal", protect, authorize(ROLES.USER), updateRelationshipGoal);
router.put("/college", protect, authorize(ROLES.USER), updateCollege);
router.put("/lifestyle", protect, authorize(ROLES.USER), updateLifestyle);
router.put("/interests", protect, authorize(ROLES.USER), updateInterests);
router.put("/vibe-preferences", protect, authorize(ROLES.USER), updateVibePreferences);
router.put("/essentials-communication-style", protect, authorize(ROLES.USER), updateEssentialsAndCommunicationStyle);
router.put("/personality-received-love", protect, authorize(ROLES.USER), updatePersonalityReceivedLOVE);
router.put("/creativity-interests", protect, authorize(ROLES.USER), updateCreativityInterests);
router.post("/user-photos", protect, authorize(ROLES.USER), upload.array("photos", 15), uploadUserPhotos);
router.put("/bio", protect, authorize(ROLES.USER), updateBio);
router.put("/location", protect, authorize(ROLES.USER), updateLocation);
router.put("/avoid-someone", protect, authorize(ROLES.USER), completeAvoidSomeone);
router.put("/complete-onboarding", protect, authorize(ROLES.USER), completeOnboarding);
router.put("/verify-face-status", protect, upload.single("selfie"), authorize(ROLES.USER), verifyFaceStatus);
module.exports = router;
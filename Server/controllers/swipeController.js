const User = require("../models/User");



// 1. Fetch Real Cards / Feed Profiles
// exports.getSwipeFeed = async (req, res) => {
//   try {
//     const currentUser = await User.findById(req.user._id);

//     if (!currentUser) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // 1. Exclude Current User + Swiped Users
//     const excludedUserIds = [
//       currentUser._id,
//       ...(currentUser.likedUsers || []),
//       ...(currentUser.dislikedUsers || []),
//       ...(currentUser.superLikedUsers || []),
//     ];

//     let baseQuery = { 
//       _id: { $nin: excludedUserIds },
//       onboardingStep: "PROFILE_COMPLETE" // Only show onboarded/complete users
//     };

//     let feed = [];

//     // 2. First Try GeoSpatial Nearby Location Filter (50km)
//     if (
//       currentUser.location &&
//       currentUser.location.coordinates &&
//       currentUser.location.coordinates.length === 2 &&
//       currentUser.location.coordinates[0] !== 0
//     ) {
//       try {
//         feed = await User.find({
//           ...baseQuery,
//           location: {
//             $near: {
//               $geometry: currentUser.location,
//               $maxDistance: 1000000, // Increased to 1000km to cover all cities for testing
//             },
//           },
//         })
//           .select("fullName dob bio photos location gender onboardingStep vibePreferences passions")
//           .limit(20);
//       } catch (geoErr) {
//         console.warn("GeoSpatial Query Fallback:", geoErr.message);
//       }
//     }

//     // 3. Fallback: If no nearby users found or location missing, fetch all other active dummy profiles
//     if (feed.length === 0) {
//       feed = await User.find(baseQuery)
//         .select("fullName dob bio photos location gender onboardingStep vibePreferences passions")
//         .limit(20);
//     }

//     res.status(200).json({
//       success: true,
//       count: feed.length,
//       users: feed,
//     });
//   } catch (error) {
//     console.error("Error fetching swipe feed:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const calculateDistanceInKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 8; // Fallback 8 KM
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

exports.getSwipeFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Exclude current logged in user and already swiped users
    const excludedUserIds = [
      currentUserId,
      ...(currentUser.likedUsers || []),
      ...(currentUser.dislikedUsers || []),
      ...(currentUser.superLikedUsers || []),
    ];

    let baseQuery = { _id: { $nin: excludedUserIds } };

    // Fetch matching profiles
    let rawUsers = await User.find(baseQuery)
      .select(
        "fullName birthDate gender bio photos location relationshipGoal college communicationStyle passions vibePreferences isPhotoSelfiVerified"
      )
      .limit(30)
      .lean();

    const userLat = currentUser.location?.coordinates?.[1];
    const userLng = currentUser.location?.coordinates?.[0];

    // Compute distance for each profile in KM
    const usersWithDistance = rawUsers.map((u) => {
      const targetLng = u.location?.coordinates?.[0];
      const targetLat = u.location?.coordinates?.[1];
      const distanceKm = calculateDistanceInKm(userLat, userLng, targetLat, targetLng);
      return {
        ...u,
        distanceKm: distanceKm || 5,
      };
    });

    res.status(200).json({
      success: true,
      count: usersWithDistance.length,
      users: usersWithDistance,
    });
  } catch (error) {
    console.error("Error fetching swipe feed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Handle Swipe Right (Like), Swipe Left (Dislike), Swipe Up (Super Like)
exports.handleSwipeAction = async (req, res) => {
  try {
    const { targetUserId, action } = req.body;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    let isMatch = false;

    if (action === "LIKE" || action === "SUPERLIKE") {
      if (action === "LIKE") {
        currentUser.likedUsers.addToSet(targetUserId);
      } else {
        currentUser.superLikedUsers.addToSet(targetUserId);
      }

      const targetHasLiked =
        targetUser.likedUsers.includes(currentUserId) ||
        targetUser.superLikedUsers.includes(currentUserId);

      if (targetHasLiked) {
        isMatch = true;
        currentUser.matches.addToSet(targetUserId);
        targetUser.matches.addToSet(currentUserId);
        await targetUser.save();
      }
    } else if (action === "DISLIKE") {
      currentUser.dislikedUsers.addToSet(targetUserId);
    }

    await currentUser.save();

    res.status(200).json({
      success: true,
      isMatch,
      matchedUser: isMatch
        ? {
            _id: targetUser._id,
            fullName: targetUser.fullName,
            photo: targetUser.photos?.[0]?.url || "",
          }
        : null,
    });
  } catch (error) {
    console.error("Error processing swipe:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
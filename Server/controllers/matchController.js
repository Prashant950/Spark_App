const Like = require("../models/Like");
const Match = require("../models/Match");
const Conversation = require("../models/Conversation");


// ==========================================
// 1. LIKE / SUPERLIKE CONTROLLER
// ==========================================
exports.sendLikeOrSuperlike = async (req, res) => {
  try {
    const senderId = req.user._id.toString();
    const { receiverId, type } = req.body; // type: "LIKE" or "SUPERLIKE"

    if (!receiverId || !["LIKE", "SUPERLIKE"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action type or receiver missing.",
      });
    }

    if (senderId === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot like yourself.",
      });
    }

    // Check if the other person has ALREADY liked you (Pending)
    const oppositeLike = await Like.findOne({
      sender: receiverId,
      receiver: senderId,
      status: "Pending",
      type: { $in: ["LIKE", "SUPERLIKE"] },
    });

    if (oppositeLike) {
      // 🌟 MUTUAL MATCH! Both users liked each other.
      oppositeLike.status = "Accepted";
      oppositeLike.type = "MATCHED";
      await oppositeLike.save();

      // Update/Create the current user's entry as Accepted/MATCHED
      await Like.findOneAndUpdate(
        { sender: senderId, receiver: receiverId },
        { type: "MATCHED", status: "Accepted" },
        { upsert: true, new: true }
      );

      // Automatically create a Chat Conversation for Mutual Friends
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
      }

      const matchedUser = await User.findById(receiverId).select(
        "fullName photos bio jobTitle location"
      );

      return res.status(200).json({
        success: true,
        isMatch: true,
        message: "It's a Mutual Match! 🎉",
        matchedUser,
        conversationId: conversation._id,
      });
    }

    // Normal Like or Superlike (First time)
    const likeDoc = await Like.findOneAndUpdate(
      { sender: senderId, receiver: receiverId },
      { type, status: "Pending" },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      isMatch: false,
      message: `${type === "SUPERLIKE" ? "Superlike" : "Like"} sent successfully!`,
      like: likeDoc,
    });
  } catch (error) {
    console.error("Error in sendLikeOrSuperlike:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==========================================
// 2. DISLIKE / NOPE CONTROLLER
// ==========================================
exports.sendDislike = async (req, res) => {
  try {
    const senderId = req.user._id.toString();
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required.",
      });
    }

    const dislikeDoc = await Like.findOneAndUpdate(
      { sender: senderId, receiver: receiverId },
      { type: "DISLIKE", status: "Rejected" },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile skipped.",
      like: dislikeDoc,
    });
  } catch (error) {
    console.error("Error in sendDislike:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. REWIND / UNDO CONTROLLER
// ==========================================
exports.rewindLastAction = async (req, res) => {
  try {
    const senderId = req.user._id.toString();

    // Find the last interacted profile by this user
    const lastInteraction = await Like.findOne({ sender: senderId }).sort({
      updatedAt: -1,
    });

    if (!lastInteraction) {
      return res.status(404).json({
        success: false,
        message: "No previous action found to rewind.",
      });
    }

    // Delete the last interaction record to bring card back
    await Like.findByIdAndDelete(lastInteraction._id);

    const restoredUser = await User.findById(lastInteraction.receiver).select(
      "fullName photos bio age gender jobTitle location"
    );

    res.status(200).json({
      success: true,
      message: "Last action rewound successfully.",
      restoredUser,
    });
  } catch (error) {
    console.error("Error in rewindLastAction:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. GET LIKES & SUPERLIKES RECEIVED
// ==========================================
exports.getLikesReceived = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Fetch users who liked/superliked the logged-in user
    const likesReceived = await Like.find({
      receiver: currentUserId,
      status: "Pending",
      type: { $in: ["LIKE", "SUPERLIKE"] },
    })
      .populate(
        "sender",
        "fullName photos birthDate gender bio jobTitle company location"
      )
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      likes: likesReceived,
    });
  } catch (error) {
    console.error("Error in getLikesReceived:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. GET MUTUAL FRIENDS / MATCHED USERS LIST
// ==========================================
exports.getMutualMatches = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const matches = await Like.find({
      sender: currentUserId,
      status: "Accepted",
      type: "MATCHED",
    })
      .populate(
        "receiver",
        "fullName photos birthDate gender bio jobTitle location"
      )
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error("Error in getMutualMatches:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
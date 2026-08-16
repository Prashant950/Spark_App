const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Match = require("../models/Match");

// @desc    Send a Message to a Matched User
// @route   POST /api/chat/send
// @access  Private (User)
// exports.sendMessage = async (req, res) => {
//   try {
//     const { receiverId, text } = req.body;
//     const senderId = req.user._id;

//     if (!receiverId || !text) {
//       return res.status(400).json({ message: "receiverId and text are required" });
//     }

//     // Verify if users are actually matched before allowing chat
//     const isMatched = await Match.findOne({
//       $or: [
//         { user1: senderId, user2: receiverId },
//         { user1: receiverId, user2: senderId },
//       ],
//       status: "MATCHED",
//     });

//     if (!isMatched) {
//       return res.status(403).json({ message: "You can only chat with matched users" });
//     }

//     // Create & Save Message
//     const message = await Message.create({
//       sender: senderId,
//       receiver: receiverId,
//       text,
//     });

//     res.status(201).json({ success: true, message });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// @desc    Get Message Conversation with a Specific User
// @route   GET /api/chat/:userId
// @access  Private (User)
// exports.getMessages = async (req, res) => {
//   try {
//     const currentUserId = req.user._id;
//     const targetUserId = req.params.userId;

//     const messages = await Message.find({
//       $or: [
//         { sender: currentUserId, receiver: targetUserId },
//         { sender: targetUserId, receiver: currentUserId },
//       ],
//     }).sort({ createdAt: 1 }); // Oldest to newest

//     res.status(200).json({ success: true, count: messages.length, messages });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


//==============================================================
// 1. Get or Create Conversation with Target User
exports.getOrCreateConversation = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { targetUserId } = req.params;

    // Guard Check: Self conversation prevent karein
    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a conversation with yourself",
      });
    }

    // Single conversation lookup with BOTH participants
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] },
    }).populate("participants", "fullName photos birthDate gender isVerified");

    // Agar conversation nahi mili, toh Nayi Create karein
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, targetUserId], // 👈 Sender + Target User
      });

      conversation = await conversation.populate(
        "participants",
        "fullName photos birthDate gender isVerified"
      );
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Fetch Messages for a Conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      { conversationId, receiver: currentUserId, isDelivered: false },
      { $set: { isDelivered: true } }
    );

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    let {
      conversationId,
      receiverId,
      text = "",
      messageType = "text",
      mediaUrl = "",
      fileName = "",
      location,
    } = req.body;

    if (!receiverId && !conversationId) {
      return res.status(400).json({ success: false, message: "receiverId or conversationId is required" });
    }

    // 1. Agar Conversation ID missing hai, toh Find ya Create karein
    if (!conversationId && receiverId) {
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
      }
      conversationId = conversation._id;
    }

    const finalText = text || {
      image: "📷 Photo",
      document: "📄 Document",
      location: "📍 Live location",
    }[messageType] || "";

    const newMessage = await Message.create({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      text: finalText,
      messageType,
      mediaUrl,
      fileName,
      location,
    });

    // Update conversation meta
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $set: {
          lastMessage: finalText,
          lastMessageSender: senderId,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    // Ensure we return a populated message object (avoid calling populate() on the raw returned value)
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "fullName photos birthDate gender isVerified")
      .populate("receiver", "fullName photos birthDate gender isVerified");

    res.status(201).json({
      success: true,
      message: populatedMessage,
      conversationId,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMediaMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { conversationId, receiverId, messageType = "image", text = "" } = req.body;
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    if (!receiverId && !conversationId) {
      return res.status(400).json({ success: false, message: "receiverId or conversationId is required" });
    }

    let resolvedConversationId = conversationId;
    if (!resolvedConversationId && receiverId) {
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
      }
      resolvedConversationId = conversation._id;
    }

    const finalType = messageType === "document" ? "document" : "image";
    const finalText = text || (finalType === "document" ? "📄 Document" : "📷 Photo");

    const newMessage = await Message.create({
      conversationId: resolvedConversationId,
      sender: senderId,
      receiver: receiverId,
      text: finalText,
      messageType: finalType,
      mediaUrl: uploadedFile.path || uploadedFile.secure_url || uploadedFile.url || "",
      fileName: uploadedFile.originalname || uploadedFile.filename || "file",
    });

    await Conversation.findByIdAndUpdate(
      resolvedConversationId,
      {
        $set: {
          lastMessage: finalText,
          lastMessageSender: senderId,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "fullName photos birthDate gender isVerified")
      .populate("receiver", "fullName photos birthDate gender isVerified");

    res.status(201).json({
      success: true,
      message: populatedMessage,
      conversationId: resolvedConversationId,
    });
  } catch (error) {
    console.error("Error in sendMediaMessage:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Logged-in user ke conversations fetch karein
    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate({
        path: "participants",
        select: "fullName photos birthDate gender isVerified", // User info fetch
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};